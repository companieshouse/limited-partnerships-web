import { Request, Response, NextFunction } from "express";
import { InvalidAcspNumberError } from "@companieshouse/web-security-node";
import { invalidAcspNumberErrorHandler } from "../../../middlewares/error.middleware";
import { logger } from "../../../utils";
import { NOT_ELIGIBLE_TEMPLATE } from "../../controller/global/template";

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
      render: jest.fn()
    } as any;

    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("when an InvalidAcspNumberError is thrown", () => {
    it("should render the NOT_ELIGIBLE_TEMPLATE with 403 status", () => {
      const error = new InvalidAcspNumberError("Invalid ACSP number");

      invalidAcspNumberErrorHandler(error, req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.render).toHaveBeenCalledWith(NOT_ELIGIBLE_TEMPLATE);
    });

    it("should log the error with details", () => {
      const error = new InvalidAcspNumberError("Invalid ACSP number");
      const errorSpy = jest.spyOn(logger, "errorRequest");

      invalidAcspNumberErrorHandler(error, req as Request, res as Response, next as NextFunction);

      expect(errorSpy).toHaveBeenCalledWith(
        req,
        expect.stringContaining("Invalid ACSP number error occurred")
      );
    });

    it("should not call next when InvalidAcspNumberError is handled", () => {
      const error = new InvalidAcspNumberError("Invalid ACSP number");

      invalidAcspNumberErrorHandler(error, req as Request, res as Response, next as NextFunction);

      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("when a non-InvalidAcspNumberError is thrown", () => {
    it("should pass a generic Error to next", () => {
      const error = new Error("Some other error");

      invalidAcspNumberErrorHandler(error, req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.render).not.toHaveBeenCalled();
    });

    it("should pass a TypeError to next", () => {
      const error = new TypeError("Type error");

      invalidAcspNumberErrorHandler(error, req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(error);
    });

  });
});
