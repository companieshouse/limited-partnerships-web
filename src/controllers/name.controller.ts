import { NextFunction, Request, Response } from "express";
import crypto from "crypto";

import * as config from "../config";
import { createLimitedPartnership } from "../service/limited-partnerships-service";

export const get = (req: Request, res: Response, _next: NextFunction) => {
  return res.render(config.NAME_TEMPLATE);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = crypto.randomUUID().toString();

    await createLimitedPartnership(transactionId);

    return res.render(config.NAME_TEMPLATE);
  } catch (error) {
    next(error);
  }
};
