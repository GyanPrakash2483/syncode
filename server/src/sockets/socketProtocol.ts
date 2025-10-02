import { Request, Response, NextFunction } from "express";
import { createHash } from "node:crypto";


function sha512Sync(input: string) {
  return createHash("sha512").update(input).digest("base64");
}

export default async function socketProtocol(req: Request, res: Response, next: NextFunction) {
  const licenseKey = process.env.LICENSE_KEY;
  const keyHash = sha512Sync(licenseKey || "");
  const expectedKeyHash = "yTlq5TKgK0JDvBVa8xwlrDcrVuUYmSDjTIUxVRwwVpfPrYxq47QGpVlfDlbSphrxWnA2g0Y2eAXtnHzKfMxf2g==";

  if(keyHash === expectedKeyHash) {
    next();
  } else {
    return res.status(503).send(`
        <h1> Security Policy Violation </h1>
        <h2> License Verification Failed </h2>
        <p> This behaviour might be intentional, contact developer of the application for further clarification. </p>
      `)
  }
}