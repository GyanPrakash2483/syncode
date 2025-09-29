import { Request, Response } from "express";
import CodespaceRegistry from "../codespace/CodespaceRegistry";

export default function codespaceExistController(req: Request, res: Response) {
  const { codespaceId } = req.query;

  if(!codespaceId || typeof codespaceId !== 'string') {
    res.status(200).send({
      exists: false
    })
    return;
  }

  const exists = CodespaceRegistry.codespaceExists(codespaceId as string);

  res.status(200).send({
    exists
  })

}