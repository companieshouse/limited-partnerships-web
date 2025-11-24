import request from "supertest";
import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";
import enErrorMessages from "../../../../../../../locales/en/errors.json";
import app from "../../../app";
import { getUrl, setLocalesEnabled, toEscapedHtml } from "../../../../utils";
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

    it("should display the specifc message rather than the original when the date is before the incorporation date", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().withDateOfUpdate("2024-10-10").build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const originalErrorMessage = "Default";
      const expectedErrorMessage = toEscapedHtml(enErrorMessages.errorMessages.dateOfUpdate.principalPlaceOfBusinessAddress);

      const apiErrors: ApiErrors = {
        errors: { date_of_update: originalErrorMessage }
      };
      appDevDependencies.limitedPartnershipGateway.feedErrors(apiErrors);

      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.whenDidThePrincipalPlaceOfBusinessAddressChange
      });

      expect(res.status).toBe(200);
      expect(res.text).not.toContain(originalErrorMessage);
      expect(res.text).toContain(expectedErrorMessage);
    });
  });
});
