class User {
  username: string = "unknown"
  mouseX: number = 0.5;
  mouseY: number = 0.5;

  constructor(username: string, mouseX: number, mouseY: number) {
    this.username = username;
    this.mouseX = mouseX;
    this.mouseY = mouseY;
  }

  setMousePos(mouseX: number, mouseY: number) {
    this.mouseX = mouseX;
    this.mouseY = mouseY;
  }
}

export default User;