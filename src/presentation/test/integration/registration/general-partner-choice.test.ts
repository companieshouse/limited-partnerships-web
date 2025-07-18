import request from "supertest";
import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";
import app from "../app";
import {
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  ADD_GENERAL_PARTNER_PERSON_URL,
  GENERAL_PARTNER_CHOICE_URL
} from "../../../controller/registration/url";
import RegistrationPageType from "../../../../presentation/controller/registration/PageType";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import LimitedPartnershipBuilder from "../../builder/LimitedPartnershipBuilder";
import { getUrl, setLocalesEnabled, testTranslations } from "../../utils";

describe("General Partner Choice Page", () => {
  const URL = getUrl(GENERAL_PARTNER_CHOICE_URL);

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
    appDevDependencies.limitedPartnershipGateway.feedErrors();
    appDevDependencies.cacheRepository.feedCache(null);
  });

  it("should load the general partner choice page with Welsh text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(URL + "?lang=cy");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${cyTranslationText.generalPartnerChoicePage.title} - ${cyTranslationText.serviceRegistration} - GOV.UK`
    );
    testTranslations(res.text, cyTranslationText.generalPartnerChoicePage);
  });

  it("should load the general partner choice page with English text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(URL + "?lang=en");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${enTranslationText.generalPartnerChoicePage.title} - ${enTranslationText.serviceRegistration} - GOV.UK`
    );
    testTranslations(res.text, enTranslationText.generalPartnerChoicePage);

  });

  it("should redirect to General Partner Person page when person is selected", async () => {
    const res = await request(app).post(URL).send({
      pageType: RegistrationPageType.generalPartnerChoice,
      parameter: "person"
    });

    expect(res.status).toBe(302);
    expect(res.text).toContain(getUrl(ADD_GENERAL_PARTNER_PERSON_URL));
  });

  it("should redirect to General Partner Legal Entity page when legal entity is selected", async () => {
    const res = await request(app).post(URL).send({
      pageType: RegistrationPageType.generalPartnerChoice,
      parameter: "legalEntity"
    });

    expect(res.status).toBe(302);
    expect(res.text).toContain(getUrl(ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL));
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
