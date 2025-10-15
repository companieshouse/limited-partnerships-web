import request from "supertest";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import app from "../../app";
import { getUrl, setLocalesEnabled, toEscapedHtml } from "../../../utils";
import { appDevDependencies } from "../../../../../config/dev-dependencies";

import { CONFIRMATION_POST_TRANSITION_URL } from "../../../../controller/global/url";

import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import GeneralPartnerBuilder from "../../../builder/GeneralPartnerBuilder";
import TransactionBuilder from "../../../builder/TransactionBuilder";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

describe("Remove General partner confirmation page", () => {
  const URL = getUrl(CONFIRMATION_POST_TRANSITION_URL);

  let companyProfile;
  let generalPartner;

  beforeEach(() => {
    const transaction = new TransactionBuilder().withKind(PartnerKind.REMOVE_GENERAL_PARTNER_PERSON).build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);

    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    generalPartner = new GeneralPartnerBuilder().isPerson().build();
    appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);
  });

  describe("Get remove General partner confirmation page", () => {
    it("should load remove General partner confirmation page with english text", async () => {
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

      expect(res.text).toContain(generalPartner.data.forename);
      expect(res.text).toContain(generalPartner.data.surname);
    });

    it("should load remove General partner confirmation page with english welsh", async () => {
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

      expect(res.text).toContain(generalPartner.data.forename);
      expect(res.text).toContain(generalPartner.data.surname);
    });
  });
});
