import request from "supertest";
import app from "../../app";

import { countOccurrences, getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../utils";
import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import GeneralPartnerBuilder from "../../../builder/GeneralPartnerBuilder";
import { UPDATE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_YES_NO_URL } from "../../../../controller/postTransition/url";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import { ENTER_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL } from "../../../../controller/addressLookUp/url/postTransition";
import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import TransactionBuilder from "../../../builder/TransactionBuilder";

describe("Update Correspondence Address Yes No Page", () => {
  const URL = getUrl(UPDATE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_YES_NO_URL);
  const REDIRECT_YES = getUrl(ENTER_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL);
  const REDIRECT_NO = "/";

  let generalPartner;

  beforeEach(() => {
    setLocalesEnabled(false);

    const companyProfile = new CompanyProfileBuilder().build();

    generalPartner = new GeneralPartnerBuilder()
      .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
      .isPerson()
      .build();

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([
      generalPartner,
    ]);
    appDevDependencies.generalPartnerGateway.feedErrors();

    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    const transaction = new TransactionBuilder().withKind(PartnerKind.UPDATE_GENERAL_PARTNER_PERSON).build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);
  });

  describe("GET Update Correspondence Address Yes No Page", () => {

    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])("should load the update correspondence address yes no page with %s text", async (_description: string, lang: string, translationText: any) => {
      setLocalesEnabled(true);

      const res = await request(app).get(`${URL}?lang=${lang}`);

      expect(res.status).toBe(200);

      expect(res.text).toContain(
        `${generalPartner.data?.forename?.toUpperCase()} ${generalPartner.data?.surname?.toUpperCase()}`
      );

      testTranslations(res.text, translationText.address.update.correspondenceAddress);
      expect(countOccurrences(res.text, toEscapedHtml(translationText.serviceName.updateGeneralPartnerPerson))).toBe(2);

      if (lang === "cy") {
        expect(res.text).toContain("WELSH - ");
      } else {
        expect(res.text).not.toContain("WELSH -");
      }
    });

    it.each([
      true,
      false
    ])("should load the update correspondence address yes no page with %s radio button checked", async (radioValue: boolean) => {
      setLocalesEnabled(true);

      generalPartner.data.update_service_address_required = radioValue;

      const res = await request(app).get(`${URL}`);

      expect(res.status).toBe(200);

      expect(res.text).toContain(`value="${radioValue}" checked`);
    });
  });

  describe("POST Update Correspondence Address Yes No Page", () => {

    it.each([
      ['enter correspondence address page when "yes"', "true", REDIRECT_YES],
      ['the next page when "no"', "false", REDIRECT_NO]
    ])('should redirect to %s is selected', async (_description: string, pageValue: string, redirectUrl: string) => {
      const res = await request(app).post(`${URL}`).send({
        pageType: PostTransitionPageType.updateCorrespondenceAddressYesNo,
        update_service_address_required: pageValue
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });

  });

});
