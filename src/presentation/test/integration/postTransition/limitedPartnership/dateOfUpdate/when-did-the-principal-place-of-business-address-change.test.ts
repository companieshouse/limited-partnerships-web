import request from "supertest";
import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";
import app from "../../../app";
import { getUrl, setLocalesEnabled } from "../../../../utils";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import LimitedPartnershipBuilder from "../../../../builder/LimitedPartnershipBuilder";
import PostTransitionPageType from "../../../../../controller/postTransition/pageType";
import {
  PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_CHANGE_CHECK_YOUR_ANSWERS_URL,
  WHEN_DID_THE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_CHANGE_URL
} from "../../../../../../presentation/controller/postTransition/url";
import { ApiErrors } from "domain/entities/UIErrors";

describe("Partnership principal place of business address change date page", () => {
  const URL = getUrl(WHEN_DID_THE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_CHANGE_URL);

  describe("GET principal place of business address change date page", () => {
    it("should load principal place of business address change date page with english text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(`${enTranslationText.dateOfUpdate.principalPlaceOfBusinessAddress.title}`);
      expect(res.text).not.toContain("WELSH -");
    });

    it("should load principal place of business address change date page with welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(`${cyTranslationText.dateOfUpdate.principalPlaceOfBusinessAddress.title}`);
      expect(res.text).toContain("WELSH -");
    });
  });

  describe("POST principal place of business address change date page", () => {
    it("should navigate to next page with date of update", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().withDateOfUpdate("2024-10-10").build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.whenDidThePrincipalPlaceOfBusinessAddressChange
      });

      const redirectUrl = getUrl(PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_CHANGE_CHECK_YOUR_ANSWERS_URL);
      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
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
        pageType: PostTransitionPageType.whenDidThePrincipalPlaceOfBusinessAddressChange
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(errorMessage);
    });
  });
});
