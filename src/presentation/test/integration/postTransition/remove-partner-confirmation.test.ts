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

describe("Remove partner confirmation page", () => {
  const URL = getUrl(CONFIRMATION_POST_TRANSITION_URL);

  let companyProfile: { Id: string; data: Partial<CompanyProfile> };

  beforeEach(() => {
    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([]);
    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
  });

  describe("Get remove partner confirmation page", () => {

    it.each([
      [ PartnerKind.REMOVE_LIMITED_PARTNER_PERSON, true, true ],
      [ PartnerKind.REMOVE_LIMITED_PARTNER_LEGAL_ENTITY, true, false ],
      [ PartnerKind.REMOVE_GENERAL_PARTNER_PERSON, false, true ],
      [ PartnerKind.REMOVE_GENERAL_PARTNER_LEGAL_ENTITY, false, false ]
    ])("should load remove partner confirmation page with english text", async (partnerKind, isLimitedPartner, isPerson) => {
      const transaction = new TransactionBuilder().withKind(partnerKind).build();
      appDevDependencies.transactionGateway.feedTransactions([transaction]);

      const { limitedPartner, generalPartner } = setupPartners(isLimitedPartner, isPerson);

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

      expectPartnerData(res, limitedPartner ?? generalPartner ?? {}, isPerson);
    });

    it.each([
      [ PartnerKind.REMOVE_LIMITED_PARTNER_PERSON, true, true ],
      [ PartnerKind.REMOVE_LIMITED_PARTNER_LEGAL_ENTITY, true, false ],
      [ PartnerKind.REMOVE_GENERAL_PARTNER_PERSON, false, true ],
      [ PartnerKind.REMOVE_GENERAL_PARTNER_LEGAL_ENTITY, false, false ]
    ])("should load remove partner confirmation page with welsh text", async (partnerKind, isLimitedPartner, isPerson) => {
      const transaction = new TransactionBuilder().withKind(partnerKind).build();
      appDevDependencies.transactionGateway.feedTransactions([transaction]);

      const { limitedPartner, generalPartner } = setupPartners(isLimitedPartner, isPerson);

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

      expectPartnerData(res, limitedPartner ?? generalPartner ?? {}, isPerson);
    });
  });
});
