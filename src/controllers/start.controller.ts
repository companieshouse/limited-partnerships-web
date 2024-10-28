import { NextFunction, Request, Response } from "express";
import * as config from "../config";

export const get = (req: Request, res: Response, _next: NextFunction) => {
  return res.render(config.START_TEMPLATE);
};
