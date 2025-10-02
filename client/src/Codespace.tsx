import { useNavigate, useParams, useSearchParams } from "react-router";
import { useEffect, useRef, useState, version } from "react";
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
import { FilePlus2, FolderPlus, MousePointer2, Play, TextCursorInput, Trash2 } from "lucide-react";
import { OverlayPanel } from "primereact/overlaypanel";
import { Editor } from "@monaco-editor/react";
import { BreadCrumb } from "primereact/breadcrumb";
import type { MenuItem } from "primereact/menuitem";
import { Dropdown } from "primereact/dropdown";
import Terminal, { type TerminalRef } from "./components/Terminal";


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

  function updateFile(file_data: SyncodeFile) {
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
              } else {
                setOpenFile(pathSoFar);
                const parts = pathSoFar.split("/");
                parts.pop();
                const directory = parts.length > 0 ? parts.join("/") : "";

                setCurrentDirectory(directory);
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

  function deleteFile(file_path: string) {
    setFiles((prevFiles) => {
      let newFiles = [...prevFiles];

      const existing = newFiles.findIndex((file) => file.filename === file_path);
      if (existing != -1) {
        newFiles.splice(existing, 1);
      }

      return newFiles
    })
  }

  useEffect(() => {
    socket.on('deletefile', (data) => {
      deleteFile(data.filename);
    })
  }, [])

  function renameFile(filename: string, newfilename: string) {
    setFiles((prevFiles) => {
      let newFiles = [...prevFiles];

      const existing = newFiles.find((file) => file.filename === filename);
      if (existing) {
        existing.filename = newfilename;
      }

      return newFiles;
    })
  }

  useEffect(() => {
    socket.on('filerename', (data) => {
      renameFile(data.filename, data.newfilename);
    })
  }, [])

  const [currentDirectory, setCurrentDirectory] = useState("");
  const [openFile, setOpenFile] = useState("welcome.txt");

  const newFileOP = useRef<OverlayPanel>(null);
  const [newFileName, setNewFileName] = useState("");

  const newFolderOP = useRef<OverlayPanel>(null);
  const [newFolderName, setNewFolderName] = useState("");

  const deleteOP = useRef<OverlayPanel>(null);

  const renameOP = useRef<OverlayPanel>(null);
  const [newName, setNewName] = useState("");

  const [breadcrumbModel, setBreadcrumbModel] = useState<MenuItem[]>([]);

  const [fileContent, setFileContent] = useState<string>("");

  const [selectedTheme, setSelectedTheme] = useState("vs-dark");
  const themes = [
    "vs-dark",
    "light"
  ]

  interface Language {
    language: string;
    monacoId: string;
    extension: string;
  }

  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const languages: Language[] = [
    {
      language: "JavaScript",
      monacoId: "javascript",
      extension: ".js"
    },
    {
      language: "TypeScript",
      monacoId: "typescript",
      extension: ".ts"
    },
    {
      language: "HTML",
      monacoId: "html",
      extension: ".html"
    },
    {
      language: "CSS",
      monacoId: "css",
      extension: ".css"
    },
    {
      language: "C",
      monacoId: "c",
      extension: ".c"
    },
    {
      language: "C++",
      monacoId: "cpp",
      extension: ".cpp"
    },
    {
      language: "Java",
      monacoId: "java",
      extension: ".java"
    },
    {
      language: "JSON",
      monacoId: "json",
      extension: ".json"
    },
    {
      language: "Markdown",
      monacoId: "markdown",
      extension: ".md"
    },
    {
      language: "Text",
      monacoId: "plaintext",
      extension: ".txt"
    }
  ];

  useEffect(() => {
    const newModel = openFile.split("/").map((part) => {
      return {
        label: part
      }
    });
    setBreadcrumbModel(newModel);

    const file = files.find((file) => file.filename === openFile);
    setFileContent(file?.content || "");

    const language: Language | undefined = languages.find((lang) => openFile.endsWith(lang.extension));
    setSelectedLanguage(language || languages[0]);

  }, [openFile]);


  const lastRun = useRef(0);

  useEffect(() => {
    const file = files.find((file) => file.filename === openFile);
    if (file) {
      file.content = fileContent;
    }

    const now = Date.now();
    if (now - lastRun.current < 50) {
      return;
    }
    lastRun.current = now;

    socket.emit('clientfileupdate', {
      codespaceId,
      filename: openFile,
      content: fileContent
    })

  }, [fileContent]);


  useEffect(() => {
    const handler = (data: SyncodeFile) => {
      if (openFile === data.filename) {
        if (fileContent != data.content) {
          setFileContent(data.content);
        }
      }
      updateFile(data)
    };

    socket.on('fileupdate', handler);
    return () => {
      socket.off('fileupdate', handler);
    };
  }, [openFile]);

  const filesRef = useRef(files);

  useEffect(() => {
    filesRef.current = files;
  }, [files])

  function getFileContent(filename: string) {
    const file: SyncodeFile | undefined = filesRef.current.find((file) => file.filename === filename);

    if (file) {
      return file.content;
    } else {
      return null;
    }

  }

  interface pistonRuntime {
    language: string;
    version: string;
    aliases: string[];
    runtime?: string;
  }

  const [pistonRuntimes, setPistonRuntimes] = useState<pistonRuntime[]>([]);

  // Get piston runtimes
  useEffect(() => {
    async function getPistonRuntimes() {
      const response = await fetch("https://emkc.org/api/v2/piston/runtimes");
      const data = await response.json();
      setPistonRuntimes(data);
    }

    getPistonRuntimes();
  }, [])

  const pistonRuntimesRef = useRef<pistonRuntime[]>([]);

  useEffect(() => {
    pistonRuntimesRef.current = pistonRuntimes
  }, [pistonRuntimes])

  function getPistonLanguageVersion(language: string) {
    const runtime = pistonRuntimesRef.current.find(runtime => runtime.language === language);
    if (runtime) {
      return runtime.version;
    }
  }

  async function runJavascriptFile(filename: string) {
    if(getFileContent(filename) === null) {
      return `${filename}: No such file`
    }
    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      body: JSON.stringify({
        language: "javascript",
        version: getPistonLanguageVersion("javascript"),
        files: [{
          name: filename,
          content: getFileContent(filename)
        }]
      })
    })

    const data = await response.json();

    if (data.run.output) {
      return data.run.output;
    } else {
      return "The program generated no output";
    }

  }

  async function runTypescriptFile(filename: string) {
    if(getFileContent(filename) === null) {
      return `${filename}: No such file`
    }
    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      body: JSON.stringify({
        language: "typescript",
        version: getPistonLanguageVersion("typescript"),
        files: [{
          name: filename,
          content: getFileContent(filename)
        }]
      })
    })

    const data = await response.json();

    if (data.run.output) {
      return data.run.output;
    } else {
      return "The program generated no output";
    }

  }

  async function runCFile(filename: string) {
    if(getFileContent(filename) === null) {
      return `${filename}: No such file`
    }
    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      body: JSON.stringify({
        language: "c",
        version: getPistonLanguageVersion("c"),
        files: [{
          name: filename,
          content: getFileContent(filename)
        }]
      })
    })

    const data = await response.json();

    if (data.run.output) {
      return data.run.output;
    } else {
      return "The program generated no output";
    }

  }

  async function runCppFile(filename: string) {
    if(getFileContent(filename) === null) {
      return `${filename}: No such file`
    }
    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      body: JSON.stringify({
        language: "c++",
        version: getPistonLanguageVersion("c++"),
        files: [{
          name: filename,
          content: getFileContent(filename)
        }]
      })
    })

    const data = await response.json();

    if (data.run.output) {
      return data.run.output;
    } else {
      return "The program generated no output";
    }

  }

  async function runJavaFile(filename: string) {
    if(getFileContent(filename) === null) {
      return `${filename}: No such file`
    }
    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      body: JSON.stringify({
        language: "java",
        version: getPistonLanguageVersion("java"),
        files: [{
          name: filename,
          content: getFileContent(filename)
        }]
      })
    })

    const data = await response.json();

    if (data.run.output) {
      return data.run.output;
    } else {
      return "The program generated no output";
    }

  }

  const terminalRef = useRef<TerminalRef>(null)

  const terminalCommandHandler = async (command: string) => {
    const args = command.trim().split(' ');
    const baseCommand = args[0];
    let output = '';

    switch (baseCommand) {
      case 'help':
        output = `Available commands: help, echo, date, clear`;
        break;

      case 'echo':
        output = args.slice(1).join(' ');
        break;

      case 'date':
        output = new Date().toString();
        break;

      case 'clear':
        terminalRef.current?.clear();
        return;

      case 'node':
        output = await runJavascriptFile(args[1]);
        break;

      case 'ts-node':
        output = await runTypescriptFile(args[1]);
        break;

      case 'crun':
        output = await runCFile(args[1]);
        break;

      case 'cpprun':
        output = await runCppFile(args[1]);
        break;

      case 'javarun':
        output = await runJavaFile(args[1]);
        break;

      default:
        output = `${command}: command not found`;
    }

    return output;
  };

  function runHandler() {

    let command: string;

    switch(selectedLanguage?.language) {
      case "JavaScript":
        command = `node ${openFile}`
        break;

      case "TypeScript":
        command = `ts-node ${openFile}`
        break;

      case "C":
        command = `crun ${openFile}`
        break;

      case "C++":
        command = `cpprun ${openFile}`
        break;

      case "Java":
        command = `javarun ${openFile}`
        break;

      default:
        command = "echo Not a valid executable format"
    }
    console.log(command)
    terminalRef.current?.executeCommand(command)
  }

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
          <PanelMenu model={fileStructure} className="w-full" expandedKeys={{ main: true }} />
          <div className="toolbar flex flex-row justify-around">

            {/** Create File - Begin */}

            <OverlayPanel ref={newFileOP}>
              <div className="flex flex-column gap-2 p-2">
                <InputText value={newFileName} onChange={(e) => setNewFileName(e.target.value)} placeholder="File name..." />
                <Button label="Create File" onClick={() => {
                  newFileOP.current?.hide();
                  const fullFilePath = currentDirectory ? currentDirectory + "/" + newFileName : newFileName;
                  setNewFileName("");

                  socket.emit('clientfileupdate', {
                    codespaceId,
                    filename: fullFilePath,
                    content: ""
                  })

                  updateFile({
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
            <OverlayPanel ref={newFolderOP}>
              <div className="flex flex-column gap-2 p-2">
                <InputText value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="Folder name..." />
                <Button label="Create Folder" onClick={() => {
                  newFolderOP.current?.hide();
                  const fullFolderPath = (currentDirectory ? currentDirectory + "/" + newFolderName : newFolderName) + "/.noemptydir";
                  setNewFileName("");

                  socket.emit('clientfileupdate', {
                    codespaceId,
                    filename: fullFolderPath,
                    content: ""
                  })

                  updateFile({
                    filename: fullFolderPath,
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
              tooltip="New Folder"
              onClick={(e) => newFolderOP.current?.toggle(e)}
            >
              <FolderPlus />
            </Button>

            {/** Create Folder - End */}

            { /** Delete File Begin */}
            <OverlayPanel ref={deleteOP}>
              <div className="flex flex-column gap-2 p-2">
                <span className="flex flex-col justify-center"> Delete {openFile}? </span>
                <Button label="Delete" severity="danger" onClick={() => {
                  deleteOP.current?.hide();

                  socket.emit('clientfiledelete', {
                    codespaceId,
                    filename: openFile
                  })

                  deleteFile(openFile);
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
              tooltip="Delete File"
              onClick={(e) => deleteOP.current?.toggle(e)}
            >
              <Trash2 />
            </Button>

            { /** Delete File End */}

            { /** Rename File Begin */}

            <OverlayPanel ref={renameOP}>
              <div className="flex flex-column gap-2 p-2">
                <InputText value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Rename file..." />
                <Button label="Rename" onClick={() => {
                  renameOP.current?.hide();

                  socket.emit('clientfilerename', {
                    codespaceId,
                    filename: openFile,
                    newfilename: newName
                  })

                  renameFile(openFile, newName);
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
              tooltip="Rename File"
              onClick={(e) => {
                renameOP.current?.toggle(e);
                setNewName(openFile);
              }}
            >
              <TextCursorInput />
            </Button>

            { /**Rename File End */}

          </div>
        </SplitterPanel>
        <SplitterPanel size={90}>
          <Splitter layout="vertical">
            <SplitterPanel size={70}>
              <Splitter>
                <SplitterPanel size={80} className="flex flex-col">
                  {/** Code */}
                  <div className="flex justify-between items-center">
                    <BreadCrumb model={breadcrumbModel} home={{
                      icon: "pi pi-home",
                    }} />

                    <div>
                      <Dropdown
                        className="mx-2"
                        value={selectedTheme}
                        options={themes}
                        onChange={(e) => setSelectedTheme(e.value)}
                      />
                      <Dropdown
                        className="mx-2"
                        value={selectedLanguage}
                        options={languages}
                        optionLabel="language"
                        onChange={(e) => setSelectedLanguage(e.value)}
                      />
                    </div>

                    <Button
                      style={{
                        backgroundColor: "#00000000",
                        borderColor: "#494959",
                        padding: 10,
                        color: "white",
                        marginRight: "10px"
                      }}
                      tooltip="Run"
                      onClick={runHandler}
                    >
                      <Play className="mr-4" />
                      Run
                    </Button>

                  </div>
                  <Editor
                    className="h-[99%] max-w-[99%]"
                    language={selectedLanguage?.monacoId || "javascript"}
                    theme={selectedTheme}
                    value={fileContent}
                    onChange={(newVal => setFileContent(newVal || ""))}
                  />

                </SplitterPanel>
                <SplitterPanel size={20}>
                  Gemini Instance
                </SplitterPanel>
              </Splitter>
            </SplitterPanel>
            <SplitterPanel size={30}>
              <div className="w-full h-[250px] bg-gray-900 overflow-scroll">
                <Terminal
                  prompt={
                    <>
                      <span className="text-green-500">{username.toLowerCase()}@syncode</span>
                      <span className="text-white">:</span>
                      <span className="text-violet-600">~</span>
                      <span className="text-white">$ </span>
                    </>
                  }
                  commandHandler={terminalCommandHandler}
                  ref={terminalRef as React.Ref<Terminal> | undefined}
                />
              </div>
            </SplitterPanel>
          </Splitter>
        </SplitterPanel>
      </Splitter>
    </div>
  )
}

export default Codespace;