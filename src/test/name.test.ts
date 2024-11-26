import request from "supertest";
import { Request, Response } from "express";

import app from "../app";
import * as config from "../config";
import { get, post } from "../controllers/name.controller";
import { createLimitedPartnership } from "../service/limited-partnerships-service";

jest.mock("../service/limited-partnerships-service");

const mockReq = {} as Request;
const mockRes = {
  render: jest.fn() as any,
  redirect: jest.fn() as any,
} as Response;
const mockNext = jest.fn();

describe("Name page", () => {
  describe("GET", () => {
    it("should return the name page", async () => {
      const response = await request(app).get(config.NAME_URL);
      expect(response.status).toBe(200);
      expect(response.text).toContain(
        "Which limited partnership name ending would you prefer to go on the public record?"
      );
    });

    it(`should return the ${config.NAME_TEMPLATE} page`, async () => {
      await get(mockReq, mockRes, mockNext);

      expect(mockRes.redirect).not.toHaveBeenCalled();
      expect(mockRes.render).toHaveBeenCalledTimes(1);
      expect(mockRes.render).toHaveBeenCalledWith(config.NAME_TEMPLATE);
    });
  });

  describe("POST", () => {
    it("should return the name page", async () => {
      await post(mockReq, mockRes, mockNext);

      expect(createLimitedPartnership).toHaveBeenCalledTimes(1);
    });
  });
});
