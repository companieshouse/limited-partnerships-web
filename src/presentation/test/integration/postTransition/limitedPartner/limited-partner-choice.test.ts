import request from "supertest";

import app from "../../app";
import {
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  ADD_LIMITED_PARTNER_PERSON_URL,
  LIMITED_PARTNER_CHOICE_URL
} from "../../../../controller/postTransition/url";
import { YOUR_COMPANY_URL } from "../../../../../config";
import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations } from "../../../utils";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import { enTranslationText, cyTranslationText } from "../../../../../test/utils/locales";
describe("Limited Partner Choice Page", () => {
  const URL = getUrl(LIMITED_PARTNER_CHOICE_URL);
  const BACK_LINK = getUrl(YOUR_COMPANY_URL);

  let companyProfile;

  beforeEach(() => {
    setLocalesEnabled(false);

    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);
  });

  it.each([
    ["en", enTranslationText],
    ["cy", cyTranslationText]
  ])("should load the limited partner choice page with %s text", async (lang, translation) => {
    setLocalesEnabled(true);
    const res = await request(app).get(URL + `?lang=${lang}`);

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      `${translation.limitedPartnerChoicePage.isPersonOrLegalEntity} - ${translation.serviceName.addLimitedPartner} - GOV.UK`
    );
    expect(res.text).toContain(
      `${companyProfile.data.companyName.toUpperCase()} (${companyProfile.data.companyNumber.toUpperCase()})`
    );
    testTranslations(res.text, translation.limitedPartnerChoicePage, ["isPersonOrLegalEntityHint"]);
    expect(res.text).not.toContain(translation.limitedPartnerChoicePage.isPersonOrLegalEntityHint);
    expect(countOccurrences(res.text, translation.serviceName.addLimitedPartner)).toBe(2);
    expect(res.text).toContain(BACK_LINK);
  });

  it.each([
    ["person", getUrl(ADD_LIMITED_PARTNER_PERSON_URL)],
    ["legal entity", getUrl(ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL)]
  ])("should redirect to the Limited Partner %s page when %s is selected", async (partnerType, expectedUrl) => {
    const res = await request(app).post(URL).send({
      pageType: PostTransitionPageType.limitedPartnerType,
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
      pageType: PostTransitionPageType.limitedPartnerType
    });

    const errorMessage = errors.errorMessages.choosePartnerType.limitedPartner;

    expect(res.status).toBe(200);
    expect(countOccurrences(res.text, errorMessage)).toBe(2);
  });
});
