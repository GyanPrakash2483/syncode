import { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export default async function gemini(req: Request, res: Response) {
  
  const { username, filename, code, userQuery } = req.body;
  
  const response = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: `
    The user is on a platform called "syncode" which is a development environment with realtime, collaborative, multi language, multi file, terminal and Generative AI support
    Username: ${username}
    File currently opened: ${filename}
    ---BEGIN_FILE_CONTENT---
    ${code}
    ---END_FILE_CONTENT---

    User Query:
    ---BEGIN_USER_QUERY---
    ${userQuery}
    ---END_USER_QUERY---

    Respond to the user as appropriate.
    The code context may or may not be required for the response.
    The response should only contain the reply intended for the user and nothing else.
    `
  })

  res.writeHead(200, {
    "Content-Type": "text/plain",
    "Transfer-Encoding": "chunked",
    "connection": "keep-alive"
  });

  for await (const chunk of response) {
    res.write(chunk.text);
  }

  res.end();
}