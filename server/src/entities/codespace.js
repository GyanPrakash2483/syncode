

class Codespace {

  id= null
  users = [];
  files = [];

  constructor(codespaceId) {
    this.id = codespaceId
  }

  addUser(user) {
    this.users.push(user);
  }

  addFile(file) {
    this.files.push(file);
  }
}