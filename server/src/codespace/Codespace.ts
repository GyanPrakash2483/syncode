import SyncodeFile from "./File.js";
import crypto from "node:crypto";

function generateCodespaceId() { 
  return crypto.randomBytes(16).toString('base64url');
}

class Codespace {
  codespaceId: string = ""
  files: SyncodeFile[] = [];

  constructor() {
    this.codespaceId = generateCodespaceId();
    const initialFile = new SyncodeFile("index.js", "/*\nHii,\nWelcome to syncode.\nSyncode is a real-time collaborative coding platform that enables multiple users to work together on projects seamlessly.\nIt displays each user's cursor, keeps code synchronized instantly, and provides a terminal and Gemini AI LLM to each user\nfor enhanced productivity.\nGet started by running this file.\n*/\nconsole.log(\"Hello from syncode\")\n");
    this.files.push(initialFile);
  }

  updateFile(filename: string, content: string) {
    const existingfile = this.files.find((file) => file.filename === filename);

    if(existingfile) {
      existingfile.content = content;
    } else {
      const newFile = new SyncodeFile(filename, content);
      this.files.push(newFile);
    }
  }

  deleteFile(filename: string) {
    const fileIndex = this.files.findIndex((file) => file.filename === filename);
    if(fileIndex != -1) {
      this.files.splice(fileIndex, 1);
    }
  }

  renameFile(prevFileName: string, newFileName: string) {
    const existingFile = this.files.find((file) => file.filename === prevFileName);

    if(existingFile) {
      existingFile.filename = newFileName;
    }
  }

}

export default Codespace