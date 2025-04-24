import request from "supertest";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import {
  LIMITED_PARTNER_CHOICE_URL,
  ADD_LIMITED_PARTNER_PERSON_URL,
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL
} from "../../../controller/registration/url";
import RegistrationPageType from "../../../controller/registration/PageType";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";

describe("Limited Partner Choice Page", () => {
  const URL = getUrl(LIMITED_PARTNER_CHOICE_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
    appDevDependencies.limitedPartnershipGateway.feedErrors();
    appDevDependencies.cacheRepository.feedCache(null);
  });

  it("should load the limited partner choice page with Welsh text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(URL + "?lang=cy");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${cyTranslationText.limitedPartnerChoicePage.isPersonOrLegalEntity} - ${cyTranslationText.service} - GOV.UK`
    );
    testTranslations(res.text, cyTranslationText.limitedPartnerChoicePage);
  });

  it("should load the limited partner choice page with English text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(URL + "?lang=en");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${enTranslationText.limitedPartnerChoicePage.isPersonOrLegalEntity} - ${enTranslationText.service} - GOV.UK`
    );
    testTranslations(res.text, enTranslationText.limitedPartnerChoicePage);
  });

  it("should redirect to Limited Partner Person page when person is selected", async () => {
    const res = await request(app).post(URL).send({
      pageType: RegistrationPageType.limitedPartnerChoice,
      parameter: "person"
    });
    expect(res.status).toBe(302);
    expect(res.text).toContain(getUrl(ADD_LIMITED_PARTNER_PERSON_URL));
  });

  it("should redirect to Limited Partner Legal Entity page when legal entity is selected", async () => {
    const res = await request(app).post(URL).send({
      pageType: RegistrationPageType.limitedPartnerChoice,
      parameter: "legalEntity"
    });
    expect(res.status).toBe(302);
    expect(res.text).toContain(getUrl(ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL));
  });

  it("should contain the proposed name - data from api", async () => {
    const limitedPartnership = new LimitedPartnershipBuilder().build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([
      limitedPartnership
    ]);

    const res = await request(app).get(URL);

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${limitedPartnership?.data?.partnership_name?.toUpperCase()} ${limitedPartnership?.data?.name_ending?.toUpperCase()}`
    );
  });
});
