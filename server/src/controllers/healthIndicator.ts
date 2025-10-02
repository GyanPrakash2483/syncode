import { Request, Response } from "express";

export default function healthIndicator(req: Request, res: Response) {
  res.status(200).send("Service Online");
}