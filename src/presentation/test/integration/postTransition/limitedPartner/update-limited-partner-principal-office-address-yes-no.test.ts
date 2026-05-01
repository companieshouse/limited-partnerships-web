import request from "supertest";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import enGeneralTranslationText from "../../../../../../locales/en/translations.json";
import cyGeneralTranslationText from "../../../../../../locales/cy/translations.json";
import enAddressTranslationText from "../../../../../../locales/en/address.json";
import cyAddressTranslationText from "../../../../../../locales/cy/address.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import {
  countOccurrences,
  getUrl,
  setLocalesEnabled,
  testTranslations,
  toEscapedHtml
} from "../../../../../presentation/test/utils";

import {
  UPDATE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL,
  WHEN_DID_LIMITED_PARTNER_LEGAL_ENTITY_DETAILS_CHANGE_URL
} from "../../../../controller/postTransition/url";
import { ENTER_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL } from "../../../../controller/addressLookUp/url/postTransition";

import PostTransitionPageType from "../../../../../presentation/controller/postTransition/pageType";
import CompanyProfileBuilder from "../../../../../presentation/test/builder/CompanyProfileBuilder";
import TransactionBuilder from "../../../builder/TransactionBuilder";
import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";
import TransactionLimitedPartner from "../../../../../domain/entities/TransactionLimitedPartner";

describe("Update Principal Office Address Yes No Page", () => {
  const enTranslationText = { ...enGeneralTranslationText, ...enAddressTranslationText };
  const cyTranslationText = { ...cyGeneralTranslationText, ...cyAddressTranslationText };
  const URL = getUrl(UPDATE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL);
  const REDIRECT_YES = getUrl(ENTER_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);
  const REDIRECT_NO = getUrl(WHEN_DID_LIMITED_PARTNER_LEGAL_ENTITY_DETAILS_CHANGE_URL);

  let limitedPartner: TransactionLimitedPartner;

  beforeEach(() => {
    setLocalesEnabled(false);

    const companyProfile = new CompanyProfileBuilder().build();

    limitedPartner = new LimitedPartnerBuilder()
      .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
      .isLegalEntity()
      .build();

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);
    appDevDependencies.limitedPartnerGateway.feedErrors();

    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    const transaction = new TransactionBuilder().withKind(PartnerKind.UPDATE_LIMITED_PARTNER_LEGAL_ENTITY).build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);
  });

  describe("GET Update Principal Office Address Yes No Page", () => {
    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])(
      "should load the update principal office address yes no page with %s text",
      async (description: string, lang: string, translationText: any) => {
        setLocalesEnabled(true);

        const res = await request(app).get(`${URL}?lang=${lang}`);

        expect(res.status).toBe(200);

        expect(res.text).toContain(
          `${limitedPartner.data?.forename?.toUpperCase()} ${limitedPartner.data?.surname?.toUpperCase()}`
        );

        testTranslations(res.text, translationText.address.update.limitedPartnerPrincipalOfficeAddress);
        expect(
          countOccurrences(res.text, toEscapedHtml(translationText.serviceName.updateLimitedPartnerLegalEntity))
        ).toBe(2);

        if (lang === "cy") {
          expect(res.text).toContain("WELSH - ");
        } else {
          expect(res.text).not.toContain("WELSH -");
        }
      }
    );

    it.each([true, false])(
      "should load the update principal office address yes no page with %s radio button checked",
      async (radioValue: boolean) => {
        setLocalesEnabled(true);

        // @ts-expect-error - 'limitedPartner.data' is possibly 'undefined'. ts(18048)
        limitedPartner.data.update_principal_office_address_required = radioValue;

        const res = await request(app).get(`${URL}`);

        expect(res.status).toBe(200);

        expect(res.text).toContain(`value="${radioValue}" checked`);
      }
    );
  });

  describe("POST Update Principal Office Address Yes No Page", () => {
    it.each([
      ['URA territory choice page when "yes"', "true", REDIRECT_YES],
      ['the when did the limited partner legal entity details change page when "no"', "false", REDIRECT_NO]
    ])("should redirect to %s is selected", async (description: string, pageValue: string, redirectUrl: string) => {
      const res = await request(app).post(`${URL}`).send({
        pageType: PostTransitionPageType.updateLimitedPartnerPrincipalOfficeAddressYesNo,
        update_principal_office_address_required: pageValue
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });
  });
});
