import SyncodeFile from "./File.js";
import crypto from "node:crypto"

function generateCodespaceId() { 
  return crypto.randomBytes(16).toString('base64url');
}

class Codespace {
  codespaceId: string = ""
  files: SyncodeFile[] = [];

  constructor() {
    this.codespaceId = generateCodespaceId();
    const welcomeFile = new SyncodeFile("welcome.txt", `
      Welcome to Syncode
      Start by creating a new file  
    `)
    this.files.push(welcomeFile);
    const licenseFile = new SyncodeFile("license.txt", `
      License
      No naughty!
    `)
    this.files.push(licenseFile);
    const codeFile = new SyncodeFile("src/index.js", `
      console.log("Hello, World!");
    `)
    this.files.push(codeFile);
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

}

export default Codespace