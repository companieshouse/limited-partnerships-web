import { NextFunction, Request, Response } from "express";
import crypto from "crypto";

import * as config from "../config";
import { createLimitedPartnership } from "../service/limited-partnerships-service";

export const get = (req: Request, res: Response, _next: NextFunction) => {
  return res.render(config.NAME_TEMPLATE);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // will have to change to use transaction service
    const transactionId = crypto.randomUUID().toString();

    await createLimitedPartnership(transactionId);

    // will have to change to use redirect
    return res.render(config.NAME_TEMPLATE);
  } catch (error) {
    next(error);
  }
};
