import request from "supertest";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import app from "../app";
import { appDevDependencies } from "../../../../config/dev-dependencies";
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../utils";

import {
  UPDATE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_YES_NO_URL,
  UPDATE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL,
  UPDATE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL,
  UPDATE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL,
  UPDATE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL,
  WHEN_DID_GENERAL_PARTNER_LEGAL_ENTITY_DETAILS_CHANGE_URL,
  WHEN_DID_LIMITED_PARTNER_LEGAL_ENTITY_DETAILS_CHANGE_URL,
  WHEN_DID_LIMITED_PARTNER_PERSON_DETAILS_CHANGE_URL
} from "../../../controller/postTransition/url";
import {
  ENTER_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  ENTER_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  ENTER_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "../../../controller/addressLookUp/url/postTransition";

import PostTransitionPageType from "../../../controller/postTransition/pageType";
import CompanyProfileBuilder from "../../builder/CompanyProfileBuilder";
import GeneralPartnerBuilder from "../../builder/GeneralPartnerBuilder";
import LimitedPartnerBuilder from "../../builder/LimitedPartnerBuilder";
import TransactionBuilder from "../../builder/TransactionBuilder";
import TransactionGeneralPartner from "../../../../domain/entities/TransactionGeneralPartner";
import TransactionLimitedPartner from "../../../../domain/entities/TransactionLimitedPartner";
import { enTranslationText, cyTranslationText } from "../../../../test/utils/locales";

describe.each(testConfigs())(
  "$description",
  ({ urlConstant, redirectYesConstant, redirectNoConstant, partnerKind, getPartnerId, buildPartner, setupGateway, getPartnerName, getAddressTranslations, getServiceNameTranslation, fieldName, pageType }) => {
    const URL = getUrl(urlConstant);
    const REDIRECT_YES = getUrl(redirectYesConstant);
    const REDIRECT_NO = getUrl(redirectNoConstant);

    let partner: TransactionGeneralPartner | TransactionLimitedPartner;

    beforeEach(() => {
      setLocalesEnabled(false);

      const companyProfile = new CompanyProfileBuilder().build();

      partner = buildPartner(getPartnerId());
      setupGateway(partner);

      appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

      const transaction = new TransactionBuilder().withKind(partnerKind).build();
      appDevDependencies.transactionGateway.feedTransactions([transaction]);
    });

    describe("GET", () => {
      it.each([
        ["English", "en", enTranslationText],
        ["Welsh", "cy", cyTranslationText]
      ])(
        "should load the page with %s text",
        async (description: string, lang: string, translationText: any) => {
          setLocalesEnabled(true);

          const res = await request(app).get(`${URL}?lang=${lang}`);

          expect(res.status).toBe(200);
          expect(res.text).toContain(getPartnerName(partner));
          testTranslations(res.text, getAddressTranslations(translationText));
          expect(countOccurrences(res.text, toEscapedHtml(getServiceNameTranslation(translationText)))).toBe(2);

          if (lang === "cy") {
            expect(res.text).toContain("WELSH - ");
          } else {
            expect(res.text).not.toContain("WELSH -");
          }
        }
      );

      it.each([true, false])(
        "should load the page with %s radio button checked",
        async (radioValue: boolean) => {
          setLocalesEnabled(true);

          // @ts-expect-error - 'partner.data' is possibly 'undefined'
          partner.data[fieldName] = radioValue;

          const res = await request(app).get(`${URL}`);

          expect(res.status).toBe(200);
          expect(res.text).toContain(`value="${radioValue}" checked`);
        }
      );
    });

    describe("POST", () => {
      it.each([
        ['"yes"', "true", REDIRECT_YES],
        ['"no"', "false", REDIRECT_NO]
      ])("should redirect to the correct page when %s is selected", async (description: string, pageValue: string, redirectUrl: string) => {
        const res = await request(app).post(`${URL}`).send({
          pageType,
          [fieldName]: pageValue
        });

        expect(res.status).toBe(302);
        expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
      });
    });
  }
);

function testConfigs() {
  return [
    {
      description: "Update Principal Office Address Yes No Page",
      urlConstant: UPDATE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL,
      redirectYesConstant: ENTER_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
      redirectNoConstant: WHEN_DID_GENERAL_PARTNER_LEGAL_ENTITY_DETAILS_CHANGE_URL,
      partnerKind: PartnerKind.UPDATE_GENERAL_PARTNER_LEGAL_ENTITY,
      getPartnerId: () => appDevDependencies.generalPartnerGateway.generalPartnerId,
      buildPartner: (id: string) => new GeneralPartnerBuilder().withId(id).isLegalEntity().build(),
      setupGateway: (p: TransactionGeneralPartner) => {
        appDevDependencies.generalPartnerGateway.feedGeneralPartners([p]);
        appDevDependencies.generalPartnerGateway.feedErrors();
      },
      getPartnerName: (gp: any) => `${gp.data?.legal_entity_name?.toUpperCase()}`,
      getAddressTranslations: (translationText: typeof enTranslationText | typeof cyTranslationText) => translationText.address.update.principalOfficeAddress,
      getServiceNameTranslation: (translationText: typeof enTranslationText) => translationText.serviceName.updateGeneralPartnerLegalEntity,
      fieldName: "update_principal_office_address_required",
      pageType: PostTransitionPageType.updateGeneralPartnerPrincipalOfficeAddressYesNo
    },
    {
      description: "Update Usual Residential Address Yes No Page",
      urlConstant: UPDATE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL,
      redirectYesConstant: TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
      redirectNoConstant: UPDATE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_YES_NO_URL,
      partnerKind: PartnerKind.UPDATE_GENERAL_PARTNER_PERSON,
      getPartnerId: () => appDevDependencies.generalPartnerGateway.generalPartnerId,
      buildPartner: (id: string) => new GeneralPartnerBuilder().withId(id).isPerson().build(),
      setupGateway: (p: TransactionGeneralPartner) => {
        appDevDependencies.generalPartnerGateway.feedGeneralPartners([p]);
        appDevDependencies.generalPartnerGateway.feedErrors();
      },
      getPartnerName: (gp: any) => `${gp.data?.forename?.toUpperCase()} ${gp.data?.surname?.toUpperCase()}`,
      getAddressTranslations: (translationText: typeof enTranslationText | typeof cyTranslationText) => translationText.address.update.usualResidentialAddress,
      getServiceNameTranslation: (translationText: typeof enTranslationText) => translationText.serviceName.updateGeneralPartnerPerson,
      fieldName: "update_usual_residential_address_required",
      pageType: PostTransitionPageType.updateGeneralPartnerUsualResidentialAddressYesNo
    },
    {
      description: "Update Correspondence Address Yes No Page",
      urlConstant: UPDATE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_YES_NO_URL,
      redirectYesConstant: ENTER_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
      redirectNoConstant: "/",
      partnerKind: PartnerKind.UPDATE_GENERAL_PARTNER_PERSON,
      getPartnerId: () => appDevDependencies.generalPartnerGateway.generalPartnerId,
      buildPartner: (id: string) => new GeneralPartnerBuilder().withId(id).isPerson().build(),
      setupGateway: (p: TransactionGeneralPartner) => {
        appDevDependencies.generalPartnerGateway.feedGeneralPartners([p]);
        appDevDependencies.generalPartnerGateway.feedErrors();
      },
      getPartnerName: (gp: any) => `${gp.data?.forename?.toUpperCase()} ${gp.data?.surname?.toUpperCase()}`,
      getAddressTranslations: (translationText: typeof enTranslationText | typeof cyTranslationText) => translationText.address.update.correspondenceAddress,
      getServiceNameTranslation: (translationText: typeof enTranslationText) => translationText.serviceName.updateGeneralPartnerPerson,
      fieldName: "update_service_address_required",
      pageType: PostTransitionPageType.updateCorrespondenceAddressYesNo
    },
    {
      description: "Update Limited Partner Usual Residential Address Yes No Page",
      urlConstant: UPDATE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL,
      redirectYesConstant: TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
      redirectNoConstant: WHEN_DID_LIMITED_PARTNER_PERSON_DETAILS_CHANGE_URL,
      partnerKind: PartnerKind.UPDATE_LIMITED_PARTNER_PERSON,
      getPartnerId: () => appDevDependencies.limitedPartnerGateway.limitedPartnerId,
      buildPartner: (id: string) => new LimitedPartnerBuilder().withId(id).isPerson().build(),
      setupGateway: (p: TransactionLimitedPartner) => {
        appDevDependencies.limitedPartnerGateway.feedLimitedPartners([p]);
        appDevDependencies.limitedPartnerGateway.feedErrors();
      },
      getPartnerName: (gp: any) => `${gp.data?.forename?.toUpperCase()} ${gp.data?.surname?.toUpperCase()}`,
      getAddressTranslations: (translationText: typeof enTranslationText | typeof cyTranslationText) => translationText.address.update.limitedPartnerUsualResidentialAddress,
      getServiceNameTranslation: (translationText: typeof enTranslationText) => translationText.serviceName.updateLimitedPartnerPerson,
      fieldName: "update_usual_residential_address_required",
      pageType: PostTransitionPageType.updateLimitedPartnerUsualResidentialAddressYesNo
    },
    {
      description: "Update Limited Partner Principal Office Address Yes No Page",
      urlConstant: UPDATE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL,
      redirectYesConstant: ENTER_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
      redirectNoConstant: WHEN_DID_LIMITED_PARTNER_LEGAL_ENTITY_DETAILS_CHANGE_URL,
      partnerKind: PartnerKind.UPDATE_LIMITED_PARTNER_LEGAL_ENTITY,
      getPartnerId: () => appDevDependencies.limitedPartnerGateway.limitedPartnerId,
      buildPartner: (id: string) => new LimitedPartnerBuilder().withId(id).isLegalEntity().build(),
      setupGateway: (p: TransactionLimitedPartner) => {
        appDevDependencies.limitedPartnerGateway.feedLimitedPartners([p]);
        appDevDependencies.limitedPartnerGateway.feedErrors();
      },
      getPartnerName: (gp: any) => `${gp.data?.forename?.toUpperCase()} ${gp.data?.surname?.toUpperCase()}`,
      getAddressTranslations: (translationText: typeof enTranslationText | typeof cyTranslationText) => translationText.address.update.limitedPartnerPrincipalOfficeAddress,
      getServiceNameTranslation: (translationText: typeof enTranslationText) => translationText.serviceName.updateLimitedPartnerLegalEntity,
      fieldName: "update_principal_office_address_required",
      pageType: PostTransitionPageType.updateLimitedPartnerPrincipalOfficeAddressYesNo
    }
  ];
}
