import { Request, Response, NextFunction } from "express";
import { InvalidAcspNumberError } from "@companieshouse/web-security-node";
import { invalidAcspNumberErrorHandler } from "../../../middlewares/error.middleware";
import { logger } from "../../../utils";

jest.mock("../../../utils/logger");

describe("invalidAcspNumberErrorHandler", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      get: jest.fn(() => "https://example.com"),
      session: { data: { signin_info: { user_email: "test@example.com" } } }
    } as any;

    res = {
      status: jest.fn().mockReturnThis(),
      render: jest.fn(),
      redirect: jest.fn()
    } as any;

    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("when an InvalidAcspNumberError is thrown", () => {
    it("should redirect to the not eligible page with 302 status", () => {
      const error = new InvalidAcspNumberError("Invalid ACSP number");

      invalidAcspNumberErrorHandler(error, req as Request, res as Response, next as NextFunction);

      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining("/not-eligible"));
    });

    it("should log the error with details", () => {
      const error = new InvalidAcspNumberError("Invalid ACSP number 123456");
      const infoSpy = jest.spyOn(logger, "infoRequest");

      invalidAcspNumberErrorHandler(error, req as Request, res as Response, next as NextFunction);

      expect(infoSpy).toHaveBeenCalledWith(
        req,
        expect.stringContaining("Invalid ACSP error received - Invalid ACSP number 123456")
      );
    });

    it("should not call next when InvalidAcspNumberError is handled", () => {
      const error = new InvalidAcspNumberError("Invalid ACSP number");

      invalidAcspNumberErrorHandler(error, req as Request, res as Response, next as NextFunction);

      expect(next).not.toHaveBeenCalled();
    });

    it.each([
      ["en"],
      ["cy"]
    ])("should include lang=%s in the redirect URL when session lang is set", (lang) => {
      (req as any).session.data.lang = lang;
      const error = new InvalidAcspNumberError("Invalid ACSP number");

      invalidAcspNumberErrorHandler(error, req as Request, res as Response, next as NextFunction);

      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining(`lang=${lang}`));
    });

    it("should not include lang in the redirect URL when session lang is not set", () => {
      const error = new InvalidAcspNumberError("Invalid ACSP number");

      invalidAcspNumberErrorHandler(error, req as Request, res as Response, next as NextFunction);

      expect(res.redirect).toHaveBeenCalledWith(expect.not.stringContaining("lang="));
    });
  });

  describe("when a non-InvalidAcspNumberError is thrown", () => {
    it("should pass a generic Error to next", () => {
      const error = new Error("Some other error");

      invalidAcspNumberErrorHandler(error, req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it("should pass a TypeError to next", () => {
      const error = new TypeError("Type error");

      invalidAcspNumberErrorHandler(error, req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(error);
    });

  });
});
