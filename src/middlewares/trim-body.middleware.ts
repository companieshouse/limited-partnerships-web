import { NextFunction, Request, Response } from "express";

const trimValues = (value: unknown): unknown => {
  if (typeof value === "string") {
    return value.trim();
  }
  if (Array.isArray(value)) {
    return value.map(trimValues);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, trimValues(val)]));
  }
  return value;
};

export const trimBodyMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === "object") {
    req.body = trimValues(req.body);
  }
  next();
};
