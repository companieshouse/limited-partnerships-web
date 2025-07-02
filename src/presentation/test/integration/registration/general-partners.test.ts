import request from "supertest";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import { GENERAL_PARTNERS_URL } from "../../../controller/registration/url";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";
import { PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { REGISTRATION_BASE_URL } from "../../../../config/constants";

describe("General Partners Page", () => {
  const URL = getUrl(GENERAL_PARTNERS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
  });

  it("should load the general partners page with Welsh text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(URL + "?lang=cy");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${cyTranslationText.generalPartnersPage.title} - ${cyTranslationText.serviceRegistration} - GOV.UK`
    );
    testTranslations(res.text, cyTranslationText.generalPartnersPage);
  });

  it("should load the general partners page with English text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(URL + "?lang=en");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${enTranslationText.generalPartnersPage.title} - ${enTranslationText.serviceRegistration} - GOV.UK`
    );
    testTranslations(res.text, enTranslationText.generalPartnersPage);
  });

  it("should contain the proposed name - data from api", async () => {
    const limitedPartnership = new LimitedPartnershipBuilder().build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    const res = await request(app).get(URL);

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${limitedPartnership?.data?.partnership_name?.toUpperCase()} ${limitedPartnership?.data?.name_ending?.toUpperCase()}`
    );
  });

  it.each([
    [PartnershipType.LP, "standard-industrial-classification-code"],
    [PartnershipType.SLP, "standard-industrial-classification-code"],
    [PartnershipType.PFLP, "confirm-principal-place-of-business-address"],
    [PartnershipType.SPFLP, "confirm-principal-place-of-business-address"]
  ])(
    "should contain the correct back link based on partnership type",
    async (partnershipType: PartnershipType, backLink: string) => {
      setLocalesEnabled(true);
      const limitedPartnership = new LimitedPartnershipBuilder().withPartnershipType(partnershipType).build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      const regex = new RegExp(`${REGISTRATION_BASE_URL}/transaction/.*?/submission/.*?/${backLink}`);
      expect(res.text).toMatch(regex);
    }
  );
});
