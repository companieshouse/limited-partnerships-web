import request from "supertest";
import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";
import app from "../../app";
import {
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  ADD_LIMITED_PARTNER_PERSON_URL,
  LIMITED_PARTNER_CHOICE_URL
} from "../../../../controller/postTransition/url";
import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";

describe("Limited Partner Choice Page", () => {
  const URL = getUrl(LIMITED_PARTNER_CHOICE_URL);

  let companyProfile;

  beforeEach(() => {
    setLocalesEnabled(false);

    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);
  });

  it("should load the limited partner choice page with Welsh text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(URL + "?lang=cy");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${cyTranslationText.limitedPartnerChoicePage.title} - ${cyTranslationText.servicePostTransition} - GOV.UK`
    );
    testTranslations(res.text, cyTranslationText.limitedPartnerChoicePage, ["hint"]);
  });

  it("should load the limited partner choice page with English text", async () => {
    setLocalesEnabled(true);
    const res = await request(app).get(URL + "?lang=en");

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${enTranslationText.limitedPartnerChoicePage.title} - ${enTranslationText.servicePostTransition} - GOV.UK`
    );
    testTranslations(res.text, enTranslationText.limitedPartnerChoicePage, ["hint"]);
  });

  it("should redirect to limitedPartner Person page when person is selected", async () => {
    const res = await request(app).post(URL).send({
      pageType: PostTransitionPageType.limitedPartnerChoice,
      parameter: "person"
    });

    expect(res.status).toBe(302);
    expect(res.text).toContain(getUrl(ADD_LIMITED_PARTNER_PERSON_URL));
  });

  it("should redirect to limited Partner Legal Entity page when legal entity is selected", async () => {
    const res = await request(app).post(URL).send({
      pageType: PostTransitionPageType.limitedPartnerChoice,
      parameter: "legalEntity"
    });

    expect(res.status).toBe(302);
    expect(res.text).toContain(getUrl(ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL));
  });

  it("should contain the proposed name - data from api", async () => {
    const res = await request(app).get(URL);

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${companyProfile.data.companyName.toUpperCase()} (${companyProfile.data.companyNumber.toUpperCase()})`
    );
  });
});
