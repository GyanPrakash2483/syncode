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

// src/codespace/CodespaceRegistry.ts
var CodespaceRegistry_exports = {};
__export(CodespaceRegistry_exports, {
  default: () => CodespaceRegistry_default
});
module.exports = __toCommonJS(CodespaceRegistry_exports);

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
//# sourceMappingURL=CodespaceRegistry.js.map
