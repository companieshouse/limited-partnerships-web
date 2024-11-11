import { NextFunction, Request, Response } from "express";

jest.mock("ioredis");

jest.mock("../middlewares/authentication.middleware", () => ({
  authentication: (req: Request, res: Response, next: NextFunction) => next()
}));
