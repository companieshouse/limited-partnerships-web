import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import app from "../../app";
import { getUrl, setLocalesEnabled, toEscapedHtml } from "../../../utils";
import { appDevDependencies } from "../../../../../config/dev-dependencies";

import { CONFIRMATION_POST_TRANSITION_URL } from "../../../../controller/global/url";

import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import TransactionBuilder from "../../../builder/TransactionBuilder";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import LimitedPartnerBuilder from "../../../../../presentation/test/builder/LimitedPartnerBuilder";

describe("Remove limited partner person confirmation page", () => {
  const URL = getUrl(CONFIRMATION_POST_TRANSITION_URL);

  let companyProfile;
  let limitedPartner;

  beforeEach(() => {
    const transaction = new TransactionBuilder().withKind(PartnerKind.REMOVE_LIMITED_PARTNER_PERSON).build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);

    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    limitedPartner = new LimitedPartnerBuilder().isPerson().build();
    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);
  });

  describe("Get remove limited partner person confirmation page", () => {
    it("should load remove limited partner person confirmation page with english text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${enTranslationText.confirmationPage.postTransition.title} - ${enTranslationText.servicePostTransition} - GOV.UK`
      );
      expect(res.text).not.toContain("WELSH -");

      expect(res.text).toContain(
        toEscapedHtml(enTranslationText.confirmationPage.postTransition.partner.removePartner)
      );

      expect(res.text).toContain(companyProfile.data.companyName);
      expect(res.text).toContain(companyProfile.data.companyNumber);

      expect(res.text).toContain(limitedPartner.data.forename);
      expect(res.text).toContain(limitedPartner.data.surname);
    });

    it("should load remove limited partner person confirmation page with welsh text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${cyTranslationText.confirmationPage.postTransition.title} - ${cyTranslationText.servicePostTransition} - GOV.UK`
      );
      expect(res.text).toContain("WELSH -");

      expect(res.text).toContain(
        toEscapedHtml(cyTranslationText.confirmationPage.postTransition.partner.removePartner)
      );

      expect(res.text).toContain(companyProfile.data.companyName);
      expect(res.text).toContain(companyProfile.data.companyNumber);

      expect(res.text).toContain(limitedPartner.data.forename);
      expect(res.text).toContain(limitedPartner.data.surname);
    });
  });
});
