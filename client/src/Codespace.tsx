import { useNavigate, useParams, useSearchParams } from "react-router";
import { useRef, useState } from "react";
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

function Codespace() {

  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
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
          onHide={() => {if(inviteVisible) setInviteVisible(false)}}
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

  return (
    <div>
      <Toast ref={toast} />
      <Toolbar start={ToolbarStart} center={ToolbarMiddle} right={ToolbarRight} />
      <Splitter className="h-[90vh]">
        <SplitterPanel size={15}>
          File tree
        </SplitterPanel>
        <SplitterPanel size={85}>
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