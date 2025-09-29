import SyncodeFile from "./File.js";
import User from "./User.js";
import crypto from "node:crypto"

function generateCodespaceId() { 
  return crypto.randomBytes(16).toString('base64url');
}

class Codespace {
  codespaceId: string = ""
  private users: Record<string, User> = {};
  private files: SyncodeFile[] = [];

  constructor() {
    this.codespaceId = generateCodespaceId();
  }

  addUser(user: User) {
    this.users[user.username] = user;
  }
}

export default Codespace