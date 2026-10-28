import { Request, Response, NextFunction } from "express";

import { trimBodyMiddleware } from "../../../../middlewares/trim-body.middleware";

describe("trimBodyMiddleware", () => {
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    res = {};
    next = jest.fn();
  });

  it("trims leading and trailing whitespace from string values", () => {
    const req = { body: { forename: "  Joe ", surname: "\tBloggs\n", middle: "   " } } as Partial<Request>;

    trimBodyMiddleware(req as Request, res as Response, next as NextFunction);

    expect(req.body).toEqual({ forename: "Joe", surname: "Bloggs", middle: "" });
    expect(next).toHaveBeenCalled();
  });

  it("does not remove internal whitespace", () => {
    const req = { body: { name: "  Joe   Bloggs  " } } as Partial<Request>;

    trimBodyMiddleware(req as Request, res as Response, next as NextFunction);

    expect(req.body).toEqual({ name: "Joe   Bloggs" });
  });

  it("trims strings within nested objects and arrays", () => {
    const req = {
      body: {
        sic_codes: [" 12345 ", "67890 "],
        address: { premises: " 1 ", lines: [" a ", { inner: " b " }] }
      }
    } as Partial<Request>;

    trimBodyMiddleware(req as Request, res as Response, next as NextFunction);

    expect(req.body).toEqual({
      sic_codes: ["12345", "67890"],
      address: { premises: "1", lines: ["a", { inner: "b" }] }
    });
  });

  it("leaves non-string values unchanged", () => {
    const req = { body: { count: 5, flag: true, empty: null, missing: undefined } } as Partial<Request>;

    trimBodyMiddleware(req as Request, res as Response, next as NextFunction);

    expect(req.body).toEqual({ count: 5, flag: true, empty: null, missing: undefined });
  });

  it("calls next when there is no body", () => {
    const req = {} as Partial<Request>;

    trimBodyMiddleware(req as Request, res as Response, next as NextFunction);

    expect(req.body).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });
});
