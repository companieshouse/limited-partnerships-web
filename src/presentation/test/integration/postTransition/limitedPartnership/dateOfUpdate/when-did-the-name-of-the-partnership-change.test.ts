import request from "supertest";
import { LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";
import enErrorMessages from "../../../../../../../locales/en/errors.json";

import app from "../../../app";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, toEscapedHtml } from "../../../../utils";
import { ApiErrors } from "../../../../../../domain/entities/UIErrors";

import {
  PARTNERSHIP_NAME_CHANGE_CHECK_YOUR_ANSWERS_URL,
  WHEN_DID_THE_PARTNERSHIP_NAME_CHANGE_URL
} from "../../../../../controller/postTransition/url";
import PostTransitionPageType from "../../../../../controller/postTransition/pageType";
import LimitedPartnershipBuilder from "../../../../builder/LimitedPartnershipBuilder";

describe("Partnership name change date page", () => {
  const URL = getUrl(WHEN_DID_THE_PARTNERSHIP_NAME_CHANGE_URL);

  let partnership: LimitedPartnership;

  beforeEach(() => {
    appDevDependencies.companyGateway.setError(false);
    appDevDependencies.cacheRepository.feedCache(null);

    partnership = new LimitedPartnershipBuilder().build();
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([partnership]);
  });

  describe("GET partnership name change date page", () => {
    it("should load partnership name change date page with english text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(`${enTranslationText.dateOfUpdate.partnershipName.title}`);
      expect(res.text).not.toContain("WELSH -");

      expect(res.text).toContain(
        `${partnership.data?.partnership_name?.toUpperCase()} ${partnership.data?.name_ending?.toUpperCase()} (${partnership.data?.partnership_number?.toUpperCase()})`
      );
    });

    it("should load partnership name change date page with welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(`${cyTranslationText.dateOfUpdate.partnershipName.title}`);
      expect(res.text).toContain("WELSH -");

      expect(res.text).toContain(
        `${partnership.data?.partnership_name?.toUpperCase()} ${partnership.data?.name_ending?.toUpperCase()} (${partnership.data?.partnership_number?.toUpperCase()})`
      );
    });
  });

  describe("POST partnership name change date page", () => {
    it("should navigate to next page with date of update", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().withDateOfUpdate("2024-10-10").build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.whenDidThePartnershipNameChange
      });

      const REDIRECT_URL = getUrl(PARTNERSHIP_NAME_CHANGE_CHECK_YOUR_ANSWERS_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });
  });

  it("should display the specifc message rather than the original when the date is before the incorporation date", async () => {
    const limitedPartnership = new LimitedPartnershipBuilder().withDateOfUpdate("2024-10-10").build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    const originalErrorMessage = "Default";
    const expectedErrorMessage = toEscapedHtml(enErrorMessages.errorMessages.dateOfUpdate.partnershipName);
    const apiErrors: ApiErrors = {
      errors: { date_of_update: originalErrorMessage }
    };
    appDevDependencies.limitedPartnershipGateway.feedErrors(apiErrors);

    const res = await request(app).post(URL).send({
      pageType: PostTransitionPageType.whenDidThePartnershipNameChange
    });

    expect(res.status).toBe(200);
    expect(res.text).not.toContain(originalErrorMessage);
    expect(res.text).toContain(expectedErrorMessage);
  });
});
