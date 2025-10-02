import { Request, Response } from "express";

export default function gemini(req: Request, res: Response) {
  
  console.log(req.body)
  
  res.send("Hello");
}