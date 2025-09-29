var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/codespace/File.ts
var File_exports = {};
__export(File_exports, {
  default: () => File_default
});
module.exports = __toCommonJS(File_exports);
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
//# sourceMappingURL=File.js.map
