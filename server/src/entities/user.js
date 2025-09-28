export class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

export class User {

  name = "Unknown User";
  cursor_pos = new Vector2(500, 500);
  color = '#888888'
  socketId = null

  #randomColor() {
    const randomInt = Math.floor(Math.random() * 0xffffff);
    const hex = randomInt.toString(16).padStart(6, "0");
    return `#${hex}`
  }

  constructor(name, cursor_pos, socketId) {
    this.name = name
    this.cursor_pos = cursor_pos
    this.color = this.#randomColor()
    this.socketId = socketId
  }

  setCursorPos(cursor_pos) {
    this.cursor_pos = cursor_pos
  }
}