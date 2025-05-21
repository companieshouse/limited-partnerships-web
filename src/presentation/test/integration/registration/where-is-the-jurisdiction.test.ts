import request from "supertest";
import { PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { WHERE_IS_THE_JURISDICTION_URL } from "../../../controller/registration/url";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";

describe("Where is the jurisdiction page", () => {
  const URL = getUrl(WHERE_IS_THE_JURISDICTION_URL);

  beforeEach(() => {
    setLocalesEnabled(false);
  });

  describe("GET Where is the jurisdiction page", () => {
    it("should load the jurisdiction page with English text for EnglandWales LP jurisdiction", async () => {
      setLocalesEnabled(true);

      const limitedPartnership = new LimitedPartnershipBuilder()
        .withPartnershipType(PartnershipType.LP)
        .withRegisteredOfficeAddress(null)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.whereIsTheJurisdiction, ["scotland"]);
      expect(res.text).toContain(
        `${enTranslationText.whereIsTheJurisdiction.title} - ${enTranslationText.service} - GOV.UK`
      );
      expect(res.text).toContain(enTranslationText.buttons.saveAndContinue);
    });

    it("should load the jurisdiction page with Welsh text for EnglandWales LP jurisdiction", async () => {
      setLocalesEnabled(true);

      const limitedPartnership = new LimitedPartnershipBuilder()
        .withPartnershipType(PartnershipType.LP)
        .withRegisteredOfficeAddress(null)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${cyTranslationText.whereIsTheJurisdiction.title} - ${cyTranslationText.service} - GOV.UK`
      );
      testTranslations(res.text, cyTranslationText.whereIsTheJurisdiction, ["scotland"]);
      expect(res.text).toContain(cyTranslationText.buttons.saveAndContinue);
    });

    it("should load the jurisdiction page with English text for EnglandWales PFLP jurisdiction", async () => {
      setLocalesEnabled(true);

      const limitedPartnership = new LimitedPartnershipBuilder()
        .withPartnershipType(PartnershipType.PFLP)
        .withRegisteredOfficeAddress(null)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${enTranslationText.whereIsTheJurisdiction.title} - ${enTranslationText.service} - GOV.UK`
      );
      testTranslations(res.text, enTranslationText.whereIsTheJurisdiction, ["scotland"]);
      expect(res.text).toContain(enTranslationText.buttons.saveAndContinue);
    });

    it("should load the jurisdiction page with Welsh text for EnglandWales PFLP jurisdiction", async () => {
      setLocalesEnabled(true);

      const limitedPartnership = new LimitedPartnershipBuilder()
        .withPartnershipType(PartnershipType.PFLP)
        .withRegisteredOfficeAddress(null)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${cyTranslationText.whereIsTheJurisdiction.title} - ${cyTranslationText.service} - GOV.UK`
      );
      testTranslations(res.text, cyTranslationText.whereIsTheJurisdiction, ["scotland"]);
      expect(res.text).toContain(cyTranslationText.buttons.saveAndContinue);
    });

    it("should load the jurisdiction page with English text for Scotland SLP jurisdiction", async () => {
      setLocalesEnabled(false);

      const limitedPartnership = new LimitedPartnershipBuilder()
        .withPartnershipType(PartnershipType.SLP)
        .withRegisteredOfficeAddress(null)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${enTranslationText.whereIsTheJurisdiction.scotland.title} - ${enTranslationText.service} - GOV.UK`
      );
      testTranslations(res.text, enTranslationText.whereIsTheJurisdiction.scotland);
      expect(res.text).toContain(enTranslationText.buttons.saveAndContinue);
    });

    it("should load the jurisdiction page with English text for Scotland SPFLP jurisdiction", async () => {
      setLocalesEnabled(false);

      const limitedPartnership = new LimitedPartnershipBuilder()
        .withPartnershipType(PartnershipType.SPFLP)
        .withRegisteredOfficeAddress(null)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${enTranslationText.whereIsTheJurisdiction.scotland.title} - ${enTranslationText.service} - GOV.UK`
      );
      testTranslations(res.text, enTranslationText.whereIsTheJurisdiction.scotland);
      expect(res.text).toContain(enTranslationText.buttons.saveAndContinue);
    });
  });

  describe("GET Confirm registered office address page - conditional current url", () => {
    it("should redirect to the page CONFIRM_REGISTERED_OFFICE_ADDRESS_URL if the registered office address is already saved", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().withPartnershipType(PartnershipType.LP).build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);

      testTranslations(res.text, enTranslationText.address.confirm.registeredOfficeAddress);

      expect(res.text).toContain("4 Line 1");
      expect(res.text).toContain("Line 2");
      expect(res.text).toContain("Stoke-On-Trent");
      expect(res.text).toContain("Region");
      expect(res.text).toContain("England");
      expect(res.text).toContain("ST6 3LJ");
    });
  });
});
