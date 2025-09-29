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

// src/controllers/createCodespaceController.ts
var createCodespaceController_exports = {};
__export(createCodespaceController_exports, {
  default: () => createCodespace
});
module.exports = __toCommonJS(createCodespaceController_exports);

// src/codespace/Codespace.ts
var import_node_crypto = __toESM(require("node:crypto"));
function generateCodespaceId() {
  return import_node_crypto.default.randomBytes(16).toString("base64url");
}
var Codespace = class {
  codespaceId = "";
  users = {};
  files = [];
  constructor() {
    this.codespaceId = generateCodespaceId();
  }
  addUser(user) {
    this.users[user.username] = user;
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

// src/codespace/User.ts
var User = class {
  username = "unknown";
  mouseX = 0.5;
  mouseY = 0.5;
  constructor(username, mouseX, mouseY) {
    this.username = username;
    this.mouseX = mouseX;
    this.mouseY = mouseY;
  }
  setMousePos(mouseX, mouseY) {
    this.mouseX = mouseX;
    this.mouseY = mouseY;
  }
};
var User_default = User;

// src/controllers/createCodespaceController.ts
function createCodespace(req, res) {
  const { username } = req.body;
  if (!username || typeof username !== "string") {
    res.status(200).send({
      success: false
    });
    return;
  }
  const codespaceId = CodespaceRegistry_default.createNewCodespace();
  const user = new User_default(username, 500, 500);
  const codespace = CodespaceRegistry_default.getCodespace(codespaceId);
  if (!codespace) {
    res.status(200).send({
      success: false
    });
    return;
  }
  codespace.addUser(user);
  res.status(200).send({
    success: true,
    codespaceId
  });
}
//# sourceMappingURL=createCodespaceController.js.map
