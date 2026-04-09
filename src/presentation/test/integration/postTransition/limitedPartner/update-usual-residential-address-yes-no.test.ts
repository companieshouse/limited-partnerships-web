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
  UPDATE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL,
  WHEN_DID_LIMITED_PARTNER_PERSON_DETAILS_CHANGE_URL
} from "../../../../controller/postTransition/url";
import { TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL } from "../../../../../presentation/controller/addressLookUp/url/postTransition";

import PostTransitionPageType from "../../../../../presentation/controller/postTransition/pageType";
import TransactionBuilder from "../../../builder/TransactionBuilder";
import CompanyProfileBuilder from "../../../../../presentation/test/builder/CompanyProfileBuilder";
import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";
import TransactionGeneralPartner from "../../../../../domain/entities/TransactionGeneralPartner";

describe("Update Usual Residential Address Yes No Page", () => {
  const enTranslationText = { ...enGeneralTranslationText, ...enAddressTranslationText };
  const cyTranslationText = { ...cyGeneralTranslationText, ...cyAddressTranslationText };
  const URL = getUrl(UPDATE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL);
  const REDIRECT_YES = getUrl(TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);
  const REDIRECT_NO = getUrl(WHEN_DID_LIMITED_PARTNER_PERSON_DETAILS_CHANGE_URL);

  let limitedPartner: TransactionGeneralPartner;

  beforeEach(() => {
    setLocalesEnabled(false);

    const companyProfile = new CompanyProfileBuilder().build();

    limitedPartner = new LimitedPartnerBuilder()
      .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
      .isPerson()
      .build();

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);
    appDevDependencies.limitedPartnerGateway.feedErrors();

    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    const transaction = new TransactionBuilder().withKind(PartnerKind.UPDATE_LIMITED_PARTNER_PERSON).build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);
  });

  describe("GET Update Usual Residential Address Yes No Page", () => {
    it.each([
      ["English", "en", enTranslationText],
      ["Welsh", "cy", cyTranslationText]
    ])(
      "should load the update usual residential address yes no page with %s text",
      async (description: string, lang: string, translationText: any) => {
        setLocalesEnabled(true);

        const res = await request(app).get(`${URL}?lang=${lang}`);

        expect(res.status).toBe(200);

        expect(res.text).toContain(
          `${limitedPartner.data?.forename?.toUpperCase()} ${limitedPartner.data?.surname?.toUpperCase()}`
        );

        testTranslations(res.text, translationText.address.update.limitedPartnerUsualResidentialAddress);
        expect(countOccurrences(res.text, toEscapedHtml(translationText.serviceName.updateLimitedPartnerPerson))).toBe(
          2
        );

        if (lang === "cy") {
          expect(res.text).toContain("WELSH - ");
        } else {
          expect(res.text).not.toContain("WELSH -");
        }
      }
    );

    it.each([true, false])(
      "should load the update usual residential address yes no page with %s radio button checked",
      async (radioValue: boolean) => {
        setLocalesEnabled(true);

        // @ts-expect-error - 'limitedPartner.data' is possibly 'undefined' ts(18048)
        limitedPartner.data.update_usual_residential_address_required = radioValue;

        const res = await request(app).get(`${URL}`);

        expect(res.status).toBe(200);

        expect(res.text).toContain(`value="${radioValue}" checked`);
      }
    );
  });

  describe("POST Update Usual Residential Address Yes No Page", () => {
    it.each([
      ['URA territory choice page when "yes"', "true", REDIRECT_YES],
      ['the when did the limited partner person details change page when "no"', "false", REDIRECT_NO]
    ])("should redirect to %s is selected", async (description: string, pageValue: string, redirectUrl: string) => {
      const res = await request(app).post(`${URL}`).send({
        pageType: PostTransitionPageType.updateLimitedPartnerUsualResidentialAddressYesNo,
        update_usual_residential_address_required: pageValue
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });
  });
});
