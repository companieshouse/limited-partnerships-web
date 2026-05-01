import request from "supertest";
import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";
import app from "../../app";
import {
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  ADD_GENERAL_PARTNER_PERSON_URL,
  GENERAL_PARTNER_CHOICE_URL
} from "../../../../controller/postTransition/url";
import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";

describe("General Partner Choice Page", () => {
  const URL = getUrl(GENERAL_PARTNER_CHOICE_URL);

  let companyProfile;

  beforeEach(() => {
    setLocalesEnabled(false);

    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);
  });

  it("should load the general partner choice page with Welsh text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(URL + "?lang=cy");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${cyTranslationText.generalPartnerChoicePage.title} - ${cyTranslationText.serviceName.addGeneralPartner} - GOV.UK`
    );
    testTranslations(res.text, cyTranslationText.generalPartnerChoicePage, ["hint"]);
    expect(countOccurrences(res.text, cyTranslationText.serviceName.addGeneralPartner)).toBe(2);
  });

  it("should load the general partner choice page with English text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(URL + "?lang=en");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${enTranslationText.generalPartnerChoicePage.title} - ${enTranslationText.serviceName.addGeneralPartner} - GOV.UK`
    );
    testTranslations(res.text, enTranslationText.generalPartnerChoicePage, ["hint"]);
    expect(countOccurrences(res.text, enTranslationText.serviceName.addGeneralPartner)).toBe(2);
  });

  it("should redirect to General Partner Person page when person is selected", async () => {
    const res = await request(app).post(URL).send({
      pageType: PostTransitionPageType.generalPartnerType,
      parameter: "person"
    });

    expect(res.status).toBe(302);
    expect(res.text).toContain(getUrl(ADD_GENERAL_PARTNER_PERSON_URL));
  });

  it("should redirect to General Partner Legal Entity page when legal entity is selected", async () => {
    const res = await request(app).post(URL).send({
      pageType: PostTransitionPageType.generalPartnerType,
      parameter: "legalEntity"
    });

    expect(res.status).toBe(302);
    expect(res.text).toContain(getUrl(ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL));
  });

  it("should contain the proposed name - data from api", async () => {
    const res = await request(app).get(URL);

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${companyProfile.data.companyName.toUpperCase()} (${companyProfile.data.companyNumber.toUpperCase()})`
    );
  });
});
