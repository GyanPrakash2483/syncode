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

// src/codespace/User.ts
var User_exports = {};
__export(User_exports, {
  default: () => User_default
});
module.exports = __toCommonJS(User_exports);
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
//# sourceMappingURL=User.js.map
