class SyncodeFile {
  filename: string = "/newfile";
  content: string = ""

  constructor(filename: string, content: string) {
    this.filename = filename;
    this.content = content;
  }

  updateContent(newcontent: string) {
    this.content = newcontent;
  }

}

export default SyncodeFile