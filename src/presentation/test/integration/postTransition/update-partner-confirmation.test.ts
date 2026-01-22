import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

import request from "supertest";

import enTranslationText from "../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../locales/cy/translations.json";

import app from "../app";
import { expectPartnerData, getUrl, setLocalesEnabled, setupPartners, toEscapedHtml } from "../../utils";
import { appDevDependencies } from "../../../../config/dev-dependencies";

import { CONFIRMATION_POST_TRANSITION_URL } from "../../../controller/global/url";

import CompanyProfileBuilder from "../../builder/CompanyProfileBuilder";
import TransactionBuilder from "../../builder/TransactionBuilder";

describe("Update partner confirmation page", () => {
  const URL = getUrl(CONFIRMATION_POST_TRANSITION_URL);

  let companyProfile: { Id: string; data: Partial<CompanyProfile> };

  beforeEach(() => {
    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
  });

  describe("Get update partner confirmation page", () => {
    it.each([
      [ PartnerKind.UPDATE_GENERAL_PARTNER_PERSON, false, true ],
    ])("should load update partner confirmation page with english text", async (partnerKind, isLimitedPartner, isPerson) => {
      const transaction = new TransactionBuilder().withKind(partnerKind).build();
      appDevDependencies.transactionGateway.feedTransactions([transaction]);

      const { generalPartner } = setupPartners(isLimitedPartner, isPerson);

      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${enTranslationText.confirmationPage.postTransition.title} - ${enTranslationText.servicePostTransition} - GOV.UK`
      );
      expect(res.text).not.toContain("WELSH -");

      expect(res.text).toContain(
        toEscapedHtml(enTranslationText.confirmationPage.postTransition.partner.updatePartner)
      );

      expect(res.text).toContain(companyProfile.data.companyName);
      expect(res.text).toContain(companyProfile.data.companyNumber);

      expectPartnerData(res, generalPartner ?? {}, true);
    });

    it.each([
      [ PartnerKind.UPDATE_GENERAL_PARTNER_PERSON, false, true ]
    ])("should load update partner confirmation page with welsh text", async (partnerKind, isLimitedPartner, isPerson) => {
      const transaction = new TransactionBuilder().withKind(partnerKind).build();
      appDevDependencies.transactionGateway.feedTransactions([transaction]);

      const { generalPartner } = setupPartners(isLimitedPartner, isPerson);

      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      expect(res.text).toContain(
        `${cyTranslationText.confirmationPage.postTransition.title} - ${cyTranslationText.servicePostTransition} - GOV.UK`
      );
      expect(res.text).toContain("WELSH -");

      expect(res.text).toContain(
        toEscapedHtml(cyTranslationText.confirmationPage.postTransition.partner.updatePartner)
      );

      expect(res.text).toContain(companyProfile.data.companyName);
      expect(res.text).toContain(companyProfile.data.companyNumber);

      expectPartnerData(res, generalPartner ?? {}, true);
    });
  });
});
