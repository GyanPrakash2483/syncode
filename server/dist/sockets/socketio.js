var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/sockets/socketio.ts
var socketio_exports = {};
__export(socketio_exports, {
  default: () => socketio
});
module.exports = __toCommonJS(socketio_exports);

// src/codespace/File.ts
var SyncodeFile = class {
  filename = "/newfile";
  content = "";
  constructor(filename, content) {
    this.filename = filename;
    this.content = content;
  }
  updateContent(newcontent) {
    this.content = newcontent;
  }
};
var File_default = SyncodeFile;

// src/codespace/Codespace.ts
var import_node_crypto = __toESM(require("node:crypto"));
function generateCodespaceId() {
  return import_node_crypto.default.randomBytes(16).toString("base64url");
}
var Codespace = class {
  codespaceId = "";
  files = [];
  constructor() {
    this.codespaceId = generateCodespaceId();
    const welcomeFile = new File_default("welcome.txt", `
      Welcome to Syncode
      Start by creating a new file  
    `);
    this.files.push(welcomeFile);
    const licenseFile = new File_default("license.txt", `
      License
      No naughty!
    `);
    this.files.push(licenseFile);
    const codeFile = new File_default("src/index.js", `
      console.log("Hello, World!");
    `);
    this.files.push(codeFile);
  }
  updateFile(filename, content) {
    const existingfile = this.files.find((file) => file.filename === filename);
    if (existingfile) {
      existingfile.content = content;
    } else {
      const newFile = new File_default(filename, content);
      this.files.push(newFile);
    }
  }
  deleteFile(filename) {
    const fileIndex = this.files.findIndex((file) => file.filename === filename);
    if (fileIndex != -1) {
      this.files.splice(fileIndex, 1);
    }
  }
  renameFile(prevFileName, newFileName) {
    const existingFile = this.files.find((file) => file.filename === prevFileName);
    if (existingFile) {
      existingFile.filename = newFileName;
    }
  }
};
var Codespace_default = Codespace;

// src/codespace/CodespaceRegistry.ts
var CodespaceRegistryTemplate = class {
  codespaces = {};
  /**
   * Creates a new codespace
   * @returns ID of newly generated codespace.
   */
  createNewCodespace() {
    const newcodespace = new Codespace_default();
    this.codespaces[newcodespace.codespaceId] = newcodespace;
    return newcodespace.codespaceId;
  }
  codespaceExists(codespaceId) {
    return Boolean(this.codespaces[codespaceId]);
  }
  getCodespace(codespaceId) {
    if (this.codespaceExists(codespaceId)) {
      return this.codespaces[codespaceId];
    } else {
      return null;
    }
  }
};
var CodespaceRegistry = new CodespaceRegistryTemplate();
var CodespaceRegistry_default = CodespaceRegistry;

// src/sockets/socketio.ts
function socketio(io, socket) {
  socket.on("reguser", (data) => {
    socket.join(data.codespaceId);
    const codespace = CodespaceRegistry_default.getCodespace(data.codespaceId);
    codespace?.files.forEach((file) => {
      socket.emit("fileupdate", {
        filename: file.filename,
        content: file.content
      });
    });
  });
  socket.on("mousemove", (data) => {
    socket.to(data.codespaceId).emit("mouseupdate", {
      username: data.username,
      mouseX: data.mouseX,
      mouseY: data.mouseY
    });
  });
  socket.on("clientfileupdate", (data) => {
    const codespace = CodespaceRegistry_default.getCodespace(data.codespaceId);
    codespace?.updateFile(data.filename, data.content);
    socket.to(data.codespaceId).emit("fileupdate", {
      filename: data.filename,
      content: data.content
    });
  });
  socket.on("clientfiledelete", (data) => {
    const codespace = CodespaceRegistry_default.getCodespace(data.codespaceId);
    codespace?.deleteFile(data.filename);
    socket.to(data.codespaceId).emit("deletefile", {
      filename: data.filename
    });
  });
  socket.on("clientfilerename", (data) => {
    const codespace = CodespaceRegistry_default.getCodespace(data.codespaceId);
    codespace?.renameFile(data.filename, data.newfilename);
    socket.to(data.codespaceId).emit("filerename", data);
  });
}
//# sourceMappingURL=socketio.js.map
