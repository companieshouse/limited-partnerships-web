import { Request, Response } from "express";

export const get = (req: Request, res: Response) => {
  const a = [100];
  for (let i = 0; i < a.length; i++) {
    a[i] = i;
  }
  res.status(200).json({ status: "OK" });
};
