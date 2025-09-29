import { Request, Response } from "express";
import CodespaceRegistry from "../codespace/CodespaceRegistry";
import User from "../codespace/User";
import Codespace from "../codespace/Codespace";

export default function createCodespace(req: Request, res: Response) {
  const { username } = req.body;

  if(!username || typeof username !== "string") {
    res.status(200).send({
      success: false
    })
    return;
  }

  const codespaceId: string = CodespaceRegistry.createNewCodespace();
  const user: User = new User(username, 500, 500);

  const codespace: Codespace | null = CodespaceRegistry.getCodespace(codespaceId);

  if(!codespace) {
    res.status(200).send({
      success: false
    })
    return;
  }

  codespace.addUser(user);

  res.status(200).send({
    success: true,
    codespaceId
  })

}