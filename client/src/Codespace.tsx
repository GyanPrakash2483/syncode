import { useNavigate, useParams, useSearchParams } from "react-router";
import { useEffect, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import 'primereact/resources/themes/soho-dark/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { Toolbar } from "primereact/toolbar";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Splitter, SplitterPanel } from "primereact/splitter";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { PanelMenu } from "primereact/panelmenu";
import socket from "./socket";
import { Archive, ArchiveRestore, FilePlus2, FolderPlus, icons, MousePointer2, TextCursorInput, Trash2 } from "lucide-react";
import { OverlayPanel } from "primereact/overlaypanel";


interface mousepointer {
  username: string
  x: number,
  y: number,
  color: string
}

interface SyncodeFile {
  filename: string,
  content: string
}

function AskUsername({ codespaceId }: {
  codespaceId: string
}) {

  const [inputUsername, setInputUsername] = useState("");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e1e1e] text-[#d4d4d4]">
      <form
        onSubmit={e => {
          e.preventDefault();
          if (inputUsername.trim()) {
            navigate(`/codespace/${codespaceId}?username=${inputUsername.trim()}`)
          }
        }}
        className="bg-[#252526] p-8 rounded-lg shadow-lg border border-[#333] min-w-[320px]"
      >
        <h2 className="text-2xl font-semibold mb-6 text-[#d4d4d4]">Enter your username</h2>
        <div className="mb-6">
          <label htmlFor="username" className="block text-sm font-medium mb-2 text-[#d4d4d4]">Username</label>
          <InputText
            id="username"
            value={inputUsername}
            onChange={e => setInputUsername(e.target.value)}
            autoComplete="off"
            required
            className="w-full"
          />
        </div>
        <Button
          label="Continue"
          icon="pi pi-user"
          type="submit"
          className="w-full p-button-primary"
        />
      </form>
    </div>
  );
}

type PanelMenuItem = {
  label: string;
  icon: string;
  filepath: string;
  command?: () => void;
  items?: PanelMenuItem[];
  key?: string;
};



function Codespace() {

  const params = useParams();
  const [searchParams, _] = useSearchParams();
  const codespaceId = params.codespaceId;
  const username = searchParams.get("username") || "";

  const toast = useRef<Toast>(null);


  if (!username) {
    return (
      <AskUsername codespaceId={codespaceId || "default"} />
    )

  }

  function ToolbarStart() {
    return (
      <div className="text-xl font-bold">
        {username}
      </div>
    )
  }

  function ToolbarMiddle() {
    return (
      <IconField iconPosition="left">
        <InputIcon className="pi pi-search" />
        <InputText placeholder="search" />
      </IconField>
    )
  }

  function ToolbarRight() {

    function toggleFullscreen() {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.documentElement.requestFullscreen();
      }
    }

    const [inviteVisible, setInviteVisible] = useState(false);
    const inviteUrl = `${new URL(location.href).origin}/codespace/${codespaceId}`

    return (
      <div className="flex gap-2">
        <Button
          label="Toggle Fullscreen"
          onClick={toggleFullscreen}
          icon="pi pi-expand"
          className="p-button-info"
        />
        <Button
          label="Invite"
          icon="pi pi-user-plus"
          className="p-button-success"
          onClick={() => setInviteVisible(true)}
        />
        <Dialog
          visible={inviteVisible}
          modal
          onHide={() => { if (inviteVisible) setInviteVisible(false) }}
          content={
            ({ hide }) => (
              <div className="p-4 flex flex-col items-center justify-center gap-4">
                <span className="font-bold text-xl overflow-clip">Share this link to invite to this codespace</span>
                <span className="bg-black text-white p-1"> {inviteUrl} </span>
                <div className="flex justify-around w-full">
                  <Button
                    label="Copy URL"
                    onClick={() => {
                      navigator.clipboard.writeText(inviteUrl)
                        .then(() => {
                          toast.current?.show({
                            severity: "success",
                            summary: "Copied",
                            detail: "Invite URL copied to clipboard."
                          })
                        })
                        .catch(() => {
                          toast.current?.show({
                            severity: "error",
                            summary: "Failed",
                            detail: "Browser is preventing from copying invite URL, please copy manually."
                          })
                        })
                    }}
                  />
                  <Button
                    className="p-button-outlined"
                    label="Cancel"
                    onClick={(e) => hide(e)}
                  />
                </div>
              </div>
            )
          }
        />
      </div>
    )
  }



  useEffect(() => {
    document.addEventListener('mousemove', (e) => {
      socket.emit('mousemove', {
        username,
        codespaceId,
        mouseX: e.clientX / window.innerWidth,
        mouseY: e.clientY / window.innerHeight
      })
    })

    socket.emit('reguser', {
      username,
      codespaceId,
      mouseX: 0.5,
      mouseY: 0.5
    })
  }, [])

  const [pointers, setPointers] = useState<mousepointer[]>([])

  useEffect(() => {
    socket.on('mouseupdate', (data) => {
      setPointers(prev => {
        const newPointer = [...prev];

        const existing = newPointer.find((pointerrec) => pointerrec.username === data.username);

        if (existing) {
          existing.x = data.mouseX;
          existing.y = data.mouseY;
        } else {
          newPointer.push({
            username: data.username,
            x: data.mouseX,
            y: data.mouseY,
            color: "#000000".replace(/0/g, function () { return (~~(Math.random() * 16)).toString(16); })
          })
        }

        return newPointer;
      })
    })
  }, [])

  const [fileStructure, setFileStructure] = useState([]);

  const [files, setFiles] = useState<SyncodeFile[]>([]);

  function addFile(file_data: SyncodeFile) {
    setFiles((prevFiles) => {
      let newFiles = [...prevFiles];

      const existing = newFiles.find((file) => file.filename === file_data.filename);
      if (existing) {
        existing.content = file_data.content;
      } else {
        newFiles.push(file_data);
      }
      return newFiles;
    })
  }

  useEffect(() => {
    socket.on('fileupdate', (data: SyncodeFile) => {
      addFile(data)
    })
  }, [])

  /** The following code has been Generated by LLM */

  function buildPanelMenu(files: SyncodeFile[]): PanelMenuItem[] {
    const root: PanelMenuItem = {
      label: "Files",
      icon: "pi pi-folder",
      filepath: "",
      key: "main",
      items: []
    };

    files.forEach(file => {
      const parts = file.filename.split("/"); // e.g. ["src", "index.js"]
      let current = root;

      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1;
        const pathSoFar =
          current.filepath === "" ? part : current.filepath + "/" + part;

        let node = current.items?.find(n => n.label === part);

        if (!node) {
          node = {
            label: part,
            icon: isFile ? "pi pi-file" : "pi pi-folder",
            filepath: pathSoFar,
            items: isFile ? undefined : [] as PanelMenuItem[],
            command: () => {
              if (!isFile) {
                setCurrentDirectory(pathSoFar);
                console.log("currentDirectory: " + pathSoFar)
              } else {
                setOpenFile(pathSoFar);
                console.log("openFile: " + pathSoFar)
                const parts = pathSoFar.split("/");
                parts.pop();
                const directory = parts.length > 0 ? parts.join("/") : "";

                setCurrentDirectory(directory);
                console.log("currentDirectory: " + directory)
              }
            },
          };
          current.items?.push(node);
        }

        current = node;
      });
    });

    // 🧹 Clean up empty folders → remove `items` if length 0
    function clean(node: PanelMenuItem) {
      if (node.items && node.items.length === 0) {
        delete node.items;
      } else {
        node.items?.forEach(clean);
      }
    }
    clean(root);

    return [root];
  }

  /** LLM Generated code ends */

  useEffect(() => {
    setFileStructure(buildPanelMenu(files) as never[]);
  }, [files])

  const [currentDirectory, setCurrentDirectory] = useState("")
  const [openFile, setOpenFile] = useState("welcome.txt")

  const newFileOP = useRef<OverlayPanel>(null)
  const [newFileName, setNewFileName] = useState("");


  return (
    <div>
      {
        pointers.map((pointer, index) => (
          <div
            key={index}
            className="h-[12px] w-[12px] absolute z-50"
            style={{
              left: `${Math.round(pointer.x * window.innerWidth)}px`,
              top: `${Math.round(pointer.y * window.innerHeight)}px`
            }}
          >
            <MousePointer2
              style={{
                color: pointer.color
              }}
            />
            <span
              className="text-white text-sm p-1 rounded-sm"
              style={{
                backgroundColor: pointer.color,
              }}
            >
              {pointer.username}
            </span>
          </div>

        ))
      }
      <Toast ref={toast} />
      <Toolbar start={ToolbarStart} center={ToolbarMiddle} right={ToolbarRight} />
      <Splitter className="h-[90vh]">
        <SplitterPanel size={10} className="flex flex-col justify-between">
          {/* File Structure */}
          <PanelMenu model={fileStructure} className="w-full" expandedKeys={{main: true}} />
          <div className="toolbar flex flex-row justify-around">

            {/** Create File - Begin */}

            <OverlayPanel ref={newFileOP}>
              <div className="flex flex-column gap-2 p-2">
                <InputText value={newFileName} onChange={(e) => setNewFileName(e.target.value)} placeholder="Filename..." />
                <Button label="Create File" onClick={() => {
                  newFileOP.current?.hide();
                  const fullFilePath = currentDirectory ? currentDirectory + "/" + newFileName : newFileName;
                  setNewFileName("");

                  socket.emit('clientfileupdate', {
                    codespaceId,
                    filename: fullFilePath,
                    content: ""
                  })

                  addFile({
                    filename: fullFilePath,
                    content: ""
                  })
                }} />
              </div>
            </OverlayPanel>
            <Button
              style={{
                backgroundColor: "#00000000",
                borderColor: "#494959",
                padding: 10,
                color: "white"
              }}
              tooltip="New File"
              onClick={(e) => newFileOP.current?.toggle(e)}
            >
              <FilePlus2 />
            </Button>

            {/** Create File - End */}

            {/** Create Folder - Begin */}
            <Button
              style={{
                backgroundColor: "#00000000",
                borderColor: "#494959",
                padding: 10,
                color: "white"
              }}
              tooltip="New Folder"
            >
              <FolderPlus />
            </Button>

            {/** Create Folder - End */}
            <Button
              style={{
                backgroundColor: "#00000000",
                borderColor: "#494959",
                padding: 10,
                color: "white"
              }}
              tooltip="Delete File"
            >
              <Trash2 />
            </Button>
            <Button
              style={{
                backgroundColor: "#00000000",
                borderColor: "#494959",
                padding: 10,
                color: "white"
              }}
              tooltip="Rename File"
            >
              <TextCursorInput />
            </Button>
          </div>
        </SplitterPanel>
        <SplitterPanel size={90}>
          <Splitter layout="vertical">
            <SplitterPanel size={70}>
              <Splitter>
                <SplitterPanel size={80}>
                  Code
                </SplitterPanel>
                <SplitterPanel size={20}>
                  Gemini Instance
                </SplitterPanel>
              </Splitter>
            </SplitterPanel>
            <SplitterPanel size={30}>
              Terminal
            </SplitterPanel>
          </Splitter>
        </SplitterPanel>
      </Splitter>
    </div>
  )
}

export default Codespace;