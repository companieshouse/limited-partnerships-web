import { NextFunction, Request, Response } from "express";
import { PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { Session } from "@companieshouse/node-session-handler";

import { NAME_URL } from "../../../controller/registration/url";
import RegistrationPageType from "../../../controller/registration/PageType";
import LimitedPartnershipController from "../../../controller/registration/LimitedPartnershipController";
import LimitedPartnershipService from "../../../../application/service/LimitedPartnershipService";
import RegistrationInMemoryGateway from "../../../../infrastructure/gateway/limitedPartnership/LimitedPartnershipInMemoryGateway";
import CacheRepository from "../../../../infrastructure/repository/CacheRepository";
import CacheService from "../../../../application/service/CacheService";
import TransactionInMemoryGateway from "../../../../infrastructure/gateway/transaction/TransactionInMemoryGateway";
import IncorporationInMemoryGateway from "../../../../infrastructure/gateway/incorporation/IncorporationInMemoryGateway";

describe("Cache", () => {
  let limitedPartnershipController: LimitedPartnershipController;

  beforeAll(() => {
    limitedPartnershipController = new LimitedPartnershipController(
      new LimitedPartnershipService(
        new RegistrationInMemoryGateway(),
        new TransactionInMemoryGateway(),
        new IncorporationInMemoryGateway()
      ),
      new CacheService(new CacheRepository())
    );
  });

  it("should get data from session", async () => {
    const getExtraData = jest.fn().mockImplementation(() => ({
      [RegistrationPageType.whichType]: PartnershipType.LP
    }));
    const setExtraData = jest.fn().mockImplementation(() => {});

    await limitedPartnershipController.redirectAndCacheSelection()(
      {
        path: NAME_URL,
        session: {
          getExtraData,
          setExtraData
        } as unknown as Session,
        params: {},
        body: {
          pageType: RegistrationPageType.whichType,
          parameter: PartnershipType.LP
        }
      } as Request,
      { render: jest.fn() } as unknown as Response,
      jest.fn() as NextFunction
    );

    expect(setExtraData).toHaveBeenCalled();

    await limitedPartnershipController.getPageRouting()(
      {
        path: NAME_URL,
        session: {
          getExtraData,
          setExtraData
        } as unknown as Session,
        params: {}
      } as Request,
      { render: jest.fn() } as unknown as Response,
      jest.fn() as NextFunction
    );

    expect(getExtraData).toHaveBeenCalled();
  });
});
