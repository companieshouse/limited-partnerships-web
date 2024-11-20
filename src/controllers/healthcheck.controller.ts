import { Request, Response } from "express";

export const get = (req: Request, res: Response) => {
  const ok = "OK";
  res.status(200).json({ status: ok });
};
