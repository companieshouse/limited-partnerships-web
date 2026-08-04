import request from "supertest";

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
import { enTranslationText, cyTranslationText } from "../../../../../test/utils/locales";
import { YOUR_COMPANY_OFFICERS_URL } from "../../../../../config";
describe("General Partner Choice Page", () => {
  const URL = getUrl(GENERAL_PARTNER_CHOICE_URL);
  const BACK_LINK = getUrl(YOUR_COMPANY_OFFICERS_URL);

  let companyProfile;

  beforeEach(() => {
    setLocalesEnabled(false);

    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);
  });

  it.each([
    ["en", enTranslationText],
    ["cy", cyTranslationText]
  ])("should load the general partner choice page with %s text", async (lang, translation) => {
    setLocalesEnabled(true);
    const res = await request(app).get(URL + `?lang=${lang}`);

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${translation.partner.generalPartnerChoicePage.title} - ${translation.serviceName.addGeneralPartner} - GOV.UK`
    );
    expect(res.text).toContain(
      `${companyProfile.data.companyName.toUpperCase()} (${companyProfile.data.companyNumber.toUpperCase()})`
    );
    testTranslations(res.text, translation.partner.generalPartnerChoicePage, ["hint"]);
    expect(countOccurrences(res.text, translation.serviceName.addGeneralPartner)).toBe(2);
    expect(res.text).toContain(BACK_LINK);
  });

  it.each([
    ["person", getUrl(ADD_GENERAL_PARTNER_PERSON_URL)],
    ["legal entity", getUrl(ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL)]
  ])("should redirect to the General Partner %s page when %s is selected", async (partnerType, expectedUrl) => {
    const res = await request(app).post(URL).send({
      pageType: PostTransitionPageType.generalPartnerType,
      parameter: partnerType
    });

    expect(res.status).toBe(302);
    expect(res.text).toContain(expectedUrl);
  });

  it.each([
    ["en", enTranslationText],
    ["cy", cyTranslationText]
  ])("%s: should trigger GDS validation error when no option is selected", async (lang, errors) => {
    setLocalesEnabled(true);
    const res = await request(app).post(URL + `?lang=${lang}`).send({
      pageType: PostTransitionPageType.generalPartnerType
    });

    const errorMessage = errors.errorMessages.choosePartnerType.generalPartner;

    expect(res.status).toBe(200);
    expect(countOccurrences(res.text, errorMessage)).toBe(2);
  });
});
