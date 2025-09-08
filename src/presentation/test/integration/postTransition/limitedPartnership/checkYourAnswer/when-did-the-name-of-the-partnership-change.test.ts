import request from "supertest";

import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";

import app from "../../../app";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled } from "../../../../utils";
import { ApiErrors } from "../../../../../../domain/entities/UIErrors";

import { WHEN_DID_THE_PARTNERSHIP_NAME_CHANGE_URL } from "../../../../../controller/postTransition/url";
import PostTransitionPageType from "../../../../../controller/postTransition/pageType";
import CompanyProfileBuilder from "../../../../builder/CompanyProfileBuilder";
import LimitedPartnershipBuilder from "../../../../builder/LimitedPartnershipBuilder";

describe("Partnership name change date page", () => {
  const URL = getUrl(WHEN_DID_THE_PARTNERSHIP_NAME_CHANGE_URL);

  beforeEach(() => {
    appDevDependencies.companyGateway.setError(false);
    appDevDependencies.cacheRepository.feedCache(null);

    const companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);
  });

  describe("GET partnership name change date page", () => {
    it("should load partnership name change date page with english text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(`${enTranslationText.dateOfUpdate.partnershipName.title}`);
      expect(res.text).not.toContain("WELSH -");
    });

    it("should load partnership name change date page with welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(`${cyTranslationText.dateOfUpdate.partnershipName.title}`);
      expect(res.text).toContain("WELSH -");
    });
  });

  describe("POST partnership name change date page", () => {
    it("should navigate to next page with date of update", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().withDateOfUpdate("2024-10-10").build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.whenDidThePartnershipNameChange
      });

      expect(res.status).toBe(302);
      // expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`); TODO - the check your answers page
    });
  });

  it("should replay entered data when invalid date of update is entered and a validation error occurs", async () => {
    const limitedPartnership = new LimitedPartnershipBuilder().withDateOfUpdate("2024-10-10").build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    const errorMessage = "The date is invalid";
    const apiErrors: ApiErrors = {
      errors: { date_of_update: errorMessage }
    };
    appDevDependencies.limitedPartnershipGateway.feedErrors(apiErrors);

    const res = await request(app).post(URL).send({
      pageType: PostTransitionPageType.whenDidThePartnershipNameChange
    });

    expect(res.status).toBe(200);
    expect(res.text).toContain(errorMessage);
  });
});
