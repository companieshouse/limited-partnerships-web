import request from "supertest";
import { Jurisdiction } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import { appDevDependencies } from "../../../../../config/dev-dependencies";
import app from "../../app";

import {
  CHOOSE_REGISTERED_OFFICE_ADDRESS_URL,
  POSTCODE_REGISTERED_OFFICE_ADDRESS_URL
} from "../../../../controller/addressLookUp/url";
import AddressPageType from "../../../../controller/addressLookUp/PageType";
import { getUrl, setLocalesEnabled } from "../../../utils";
import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";

describe("Jurisdiction validation", () => {
  const URL = getUrl(POSTCODE_REGISTERED_OFFICE_ADDRESS_URL);
  const REDIRECT_URL = getUrl(CHOOSE_REGISTERED_OFFICE_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.cacheRepository.feedCache(null);

    const limitedPartnership = new LimitedPartnershipBuilder()
      .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
      .build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);
  });

  it("should redirect if jurisdiction is in Border", async () => {
    const limitedPartnership = new LimitedPartnershipBuilder()
      .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
      .build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    const res = await request(app).post(URL).send({
      pageType: AddressPageType.postcodeRegisteredOfficeAddress,
      premises: null,
      postal_code: appDevDependencies.addressLookUpGateway.borderAddresses[0].postcode
    });

    expect(res.status).toBe(302);
    expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
  });

  describe("England and Wales", () => {
    const limitedPartnership = new LimitedPartnershipBuilder()
      .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
      .withJurisdiction(Jurisdiction.ENGLAND_AND_WALES)
      .build();

    it("should redirect if jurisdiction is in England", async () => {
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.postcodeRegisteredOfficeAddress,
        premises: null,
        postal_code: appDevDependencies.addressLookUpGateway.englandAddresses[0].postcode
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it("should redirect if jurisdiction is in Wales", async () => {
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.postcodeRegisteredOfficeAddress,
        premises: null,
        postal_code: appDevDependencies.addressLookUpGateway.walesAddresses[0].postcode
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it("should return an error if the postcode is in Scotland", async () => {
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.postcodeRegisteredOfficeAddress,
        premises: null,
        postal_code: appDevDependencies.addressLookUpGateway.scotlandAddresses[0].postcode
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("You must enter a postcode which is in England or Wales");

      expect(appDevDependencies.cacheRepository.cache).toEqual(null);
    });

    it("should return an error if the postcode is in Scotland - WELSH", async () => {
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      setLocalesEnabled(true);

      const res = await request(app)
        .post(URL + "?lang=cy")
        .send({
          pageType: AddressPageType.postcodeRegisteredOfficeAddress,
          premises: null,
          postal_code: appDevDependencies.addressLookUpGateway.scotlandAddresses[0].postcode
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain("WELSH - You must enter a postcode which is in England or Wales");

      expect(appDevDependencies.cacheRepository.cache).toEqual(null);
    });
  });

  describe("Scotland", () => {
    const limitedPartnership = new LimitedPartnershipBuilder()
      .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
      .withJurisdiction(Jurisdiction.SCOTLAND)
      .build();

    it("should redirect if jurisdiction is in Scotland", async () => {
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.postcodeRegisteredOfficeAddress,
        premises: null,
        postal_code: appDevDependencies.addressLookUpGateway.scotlandAddresses[0].postcode
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it("should return an error if the postcode is in Wales", async () => {
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.postcodeRegisteredOfficeAddress,
        premises: null,
        postal_code: appDevDependencies.addressLookUpGateway.walesAddresses[0].postcode
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("You must enter a postcode which is in Scotland");

      expect(appDevDependencies.cacheRepository.cache).toEqual(null);
    });
  });

  describe("Northern Ireland", () => {
    const limitedPartnership = new LimitedPartnershipBuilder()
      .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
      .withJurisdiction(Jurisdiction.NORTHERN_IRELAND)
      .build();

    it("should redirect if jurisdiction is in Northern Ireland", async () => {
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.postcodeRegisteredOfficeAddress,
        premises: null,
        postal_code: appDevDependencies.addressLookUpGateway.northernIrelandAddresses[0].postcode
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it("should return an error if the postcode is in Wales", async () => {
      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.postcodeRegisteredOfficeAddress,
        premises: null,
        postal_code: appDevDependencies.addressLookUpGateway.walesAddresses[0].postcode
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("You must enter a postcode which is in Northern Ireland");

      expect(appDevDependencies.cacheRepository.cache).toEqual(null);
    });
  });
});
