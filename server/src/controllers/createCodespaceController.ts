import { Request, Response } from "express";
import CodespaceRegistry from "../codespace/CodespaceRegistry";
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

  const codespace: Codespace | null = CodespaceRegistry.getCodespace(codespaceId);

  if(!codespace) {
    res.status(200).send({
      success: false
    })
    return;
  }

  res.status(200).send({
    success: true,
    codespaceId
  })

}