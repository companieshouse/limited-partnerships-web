import request from "supertest";
import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";
import enErrorMessages from "../../../../../../../locales/en/errors.json";
import app from "../../../app";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, toEscapedHtml } from "../../../../utils";
import { REGISTERED_OFFICE_ADDRESS_CHANGE_CHECK_YOUR_ANSWERS_URL, WHEN_DID_THE_REGISTERED_OFFICE_ADDRESS_CHANGE_URL } from "../../../../../controller/postTransition/url";
import CompanyProfileBuilder from "../../../../builder/CompanyProfileBuilder";
import PostTransitionPageType from "../../../../../controller/postTransition/pageType";
import LimitedPartnershipBuilder from "../../../../builder/LimitedPartnershipBuilder";
import { ApiErrors } from "../../../../../../domain/entities/UIErrors";
import TransactionBuilder from "../../../../builder/TransactionBuilder";
import { PartnershipKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

describe("Registered office address change date page", () => {
  const URL = getUrl(WHEN_DID_THE_REGISTERED_OFFICE_ADDRESS_CHANGE_URL);

  beforeEach(() => {
    appDevDependencies.companyGateway.setError(false);
    appDevDependencies.cacheRepository.feedCache(null);

    const companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    const transaction = new TransactionBuilder().withKind(PartnershipKind.UPDATE_PARTNERSHIP_REGISTERED_OFFICE_ADDRESS).build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);
  });

  describe("GET registered office address change date page", () => {
    it("should load registered office address change date page with english text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(`${enTranslationText.dateOfUpdate.registeredOfficeAddress.title}`);
      expect(res.text).not.toContain("WELSH -");
      const occurrences = res.text.split(enTranslationText.serviceName.updateLimitedPartnershipRegisteredOfficeAddress).length - 1;
      expect(occurrences).toBe(2);
    });

    it("should load registered office address change date page with welsh text", async () => {
      setLocalesEnabled(true);
      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(`${cyTranslationText.dateOfUpdate.registeredOfficeAddress.title}`);
      expect(res.text).toContain("WELSH -");
      const occurrences = res.text.split(cyTranslationText.serviceName.updateLimitedPartnershipRegisteredOfficeAddress).length - 1;
      expect(occurrences).toBe(2);
    });
  });

  describe("POST registered office address change date page", () => {
    it("should navigate to next page with date of update", async () => {
      const limitedPartnership = new LimitedPartnershipBuilder().withDateOfUpdate("2024-10-10").build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

      const res = await request(app).post(URL).send({
        pageType: PostTransitionPageType.whenDidTheRegisteredOfficeAddressChange
      });

      const redirectUrl = getUrl(REGISTERED_OFFICE_ADDRESS_CHANGE_CHECK_YOUR_ANSWERS_URL);
      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });
  });

  it("should display the specifc error message rather than the original when the date is before the incorporation date", async () => {
    const limitedPartnership = new LimitedPartnershipBuilder().withDateOfUpdate("2024-10-10").build();

    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    const originalErrorMessage = "Default";
    const expectedErrorMessage = toEscapedHtml(enErrorMessages.errorMessages.dateOfUpdate.registeredOfficeAddress);
    const apiErrors: ApiErrors = {
      errors: { date_of_update: originalErrorMessage }
    };
    appDevDependencies.limitedPartnershipGateway.feedErrors(apiErrors);

    const res = await request(app).post(URL).send({
      pageType: PostTransitionPageType.whenDidTheRegisteredOfficeAddressChange
    });

    expect(res.status).toBe(200);
    expect(res.text).not.toContain(originalErrorMessage);
    expect(res.text).toContain(expectedErrorMessage);
  });
});
