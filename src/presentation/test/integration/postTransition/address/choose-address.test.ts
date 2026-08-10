import request from "supertest";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations, toEscapedHtml, countOccurrences } from "../../../utils";
import * as config from "../../../../../config";
import {
  CHOOSE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  CHOOSE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  CHOOSE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  CHOOSE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  CHOOSE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "../../../../controller/addressLookUp/url/postTransition";

import AddressPageType from "../../../../../presentation/controller/addressLookUp/PageType";
import TransactionBuilder from "../../../builder/TransactionBuilder";
import GeneralPartnerBuilder from "../../../builder/GeneralPartnerBuilder";
import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";
import { enTranslationText, cyTranslationText } from "../../../../../test/utils/locales";

const testConfigs = [
  {
    description: "general partner correspondence address",
    partnerType: "general",
    addressType: "correspondence",
    urlConstant: CHOOSE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
    redirectUrlConstant: CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
    postcodeKey: "sa_postcode",
    addressKey: "service_address",
    pageType: AddressPageType.chooseGeneralPartnerCorrespondenceAddress,
    partnerKinds: [
      {
        kind: PartnerKind.ADD_GENERAL_PARTNER_PERSON,
        enServiceName: enTranslationText.serviceName.addGeneralPartner,
        cyServiceName: cyTranslationText.serviceName.addGeneralPartner
      },
      {
        kind: PartnerKind.UPDATE_GENERAL_PARTNER_PERSON,
        enServiceName: enTranslationText.serviceName.updateGeneralPartnerPerson,
        cyServiceName: cyTranslationText.serviceName.updateGeneralPartnerPerson
      }
    ],
    getAddressTranslations: (translationText: typeof enTranslationText | typeof cyTranslationText) =>
      translationText.address.chooseAddress.generalPartnerCorrespondenceAddress
  },
  {
    description: "general partner principal office address",
    partnerType: "general",
    addressType: "principalOffice",
    urlConstant: CHOOSE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    redirectUrlConstant: CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    postcodeKey: "poa_postcode",
    addressKey: "principal_office_address",
    pageType: AddressPageType.chooseGeneralPartnerPrincipalOfficeAddress,
    partnerKinds: [
      {
        kind: PartnerKind.ADD_GENERAL_PARTNER_LEGAL_ENTITY,
        enServiceName: enTranslationText.serviceName.addGeneralPartner,
        cyServiceName: cyTranslationText.serviceName.addGeneralPartner
      },
      {
        kind: PartnerKind.UPDATE_GENERAL_PARTNER_LEGAL_ENTITY,
        enServiceName: enTranslationText.serviceName.updateGeneralPartnerLegalEntity,
        cyServiceName: cyTranslationText.serviceName.updateGeneralPartnerLegalEntity
      }
    ],
    getAddressTranslations: (translationText: typeof enTranslationText | typeof cyTranslationText) =>
      translationText.address.chooseAddress.generalPartnerPrincipalOfficeAddress
  },
  {
    description: "general partner usual residential address",
    partnerType: "general",
    addressType: "usualResidential",
    urlConstant: CHOOSE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    redirectUrlConstant: CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    postcodeKey: "ura_postcode",
    addressKey: "usual_residential_address",
    pageType: AddressPageType.chooseGeneralPartnerUsualResidentialAddress,
    partnerKinds: [
      {
        kind: PartnerKind.ADD_GENERAL_PARTNER_PERSON,
        enServiceName: enTranslationText.serviceName.addGeneralPartner,
        cyServiceName: cyTranslationText.serviceName.addGeneralPartner
      },
      {
        kind: PartnerKind.UPDATE_GENERAL_PARTNER_PERSON,
        enServiceName: enTranslationText.serviceName.updateGeneralPartnerPerson,
        cyServiceName: cyTranslationText.serviceName.updateGeneralPartnerPerson
      }
    ],
    getAddressTranslations: (translationText: typeof enTranslationText | typeof cyTranslationText) =>
      translationText.address.chooseAddress.generalPartnerUsualResidentialAddress
  },
  {
    description: "limited partner principal office address",
    partnerType: "limited",
    addressType: "principalOffice",
    urlConstant: CHOOSE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    redirectUrlConstant: CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    postcodeKey: "poa_postcode",
    addressKey: "principal_office_address",
    pageType: AddressPageType.chooseLimitedPartnerPrincipalOfficeAddress,
    partnerKinds: [
      {
        kind: PartnerKind.ADD_LIMITED_PARTNER_LEGAL_ENTITY,
        enServiceName: enTranslationText.serviceName.addLimitedPartner,
        cyServiceName: cyTranslationText.serviceName.addLimitedPartner
      },
      {
        kind: PartnerKind.UPDATE_LIMITED_PARTNER_LEGAL_ENTITY,
        enServiceName: enTranslationText.serviceName.updateLimitedPartnerLegalEntity,
        cyServiceName: cyTranslationText.serviceName.updateLimitedPartnerLegalEntity
      }
    ],
    getAddressTranslations: (translationText: typeof enTranslationText | typeof cyTranslationText) =>
      translationText.address.chooseAddress.limitedPartnerPrincipalOfficeAddress
  },
  {
    description: "limited partner usual residential address",
    partnerType: "limited",
    addressType: "usualResidential",
    urlConstant: CHOOSE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    redirectUrlConstant: CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    postcodeKey: "ura_postcode",
    addressKey: "usual_residential_address",
    pageType: AddressPageType.chooseLimitedPartnerUsualResidentialAddress,
    partnerKinds: [
      {
        kind: PartnerKind.ADD_LIMITED_PARTNER_PERSON,
        enServiceName: enTranslationText.serviceName.addLimitedPartner,
        cyServiceName: cyTranslationText.serviceName.addLimitedPartner
      },
      {
        kind: PartnerKind.UPDATE_LIMITED_PARTNER_PERSON,
        enServiceName: enTranslationText.serviceName.updateLimitedPartnerPerson,
        cyServiceName: cyTranslationText.serviceName.updateLimitedPartnerPerson
      }
    ],
    getAddressTranslations: (translationText: typeof enTranslationText | typeof cyTranslationText) =>
      translationText.address.chooseAddress.limitedPartnerUsualResidentialAddress
  }
];

describe.each(testConfigs)(
  "Choose $description page",
  ({
    partnerType,
    addressType,
    urlConstant,
    redirectUrlConstant,
    postcodeKey,
    addressKey,
    pageType,
    partnerKinds,
    getAddressTranslations
  }) => {
    const URL = getUrl(urlConstant);
    const REDIRECT_URL = getUrl(redirectUrlConstant);

    beforeEach(() => {
      setLocalesEnabled(false);
      appDevDependencies.addressLookUpGateway.setError(false);
      appDevDependencies.cacheRepository.feedCache({
        [appDevDependencies.transactionGateway.transactionId]: {
          [postcodeKey]: "ST6 3LJ"
        }
      });

      const firstPartnerKind = partnerKinds[0].kind;
      const isLegalEntity =
        firstPartnerKind === PartnerKind.ADD_GENERAL_PARTNER_LEGAL_ENTITY ||
        firstPartnerKind === PartnerKind.UPDATE_GENERAL_PARTNER_LEGAL_ENTITY ||
        firstPartnerKind === PartnerKind.ADD_LIMITED_PARTNER_LEGAL_ENTITY ||
        firstPartnerKind === PartnerKind.UPDATE_LIMITED_PARTNER_LEGAL_ENTITY;

      if (partnerType === "general") {
        const builder = new GeneralPartnerBuilder().withId(appDevDependencies.generalPartnerGateway.generalPartnerId);
        const generalPartner = (isLegalEntity ? builder.isLegalEntity() : builder.isPerson()).build();
        appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);
      } else {
        const builder = new LimitedPartnerBuilder().withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId);
        const limitedPartner = (isLegalEntity ? builder.isLegalEntity() : builder.isPerson()).build();
        appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);
      }
    });

    describe("GET", () => {
      it.each(
        partnerKinds.flatMap((pk) => [
          [
            `with Welsh text (${pk.kind})`,
            pk.kind,
            "cy",
            pk.cyServiceName,
            cyTranslationText
          ],
          [
            `with English text (${pk.kind})`,
            pk.kind,
            "en",
            pk.enServiceName,
            enTranslationText
          ]
        ])
      )(
        "should load the page %s",
        async (
          description: string,
          partnerKind: PartnerKind,
          lang: string,
          serviceName: string,
          translationText: any
        ) => {
          setLocalesEnabled(true);

          const transaction = new TransactionBuilder().withKind(partnerKind).build();
          appDevDependencies.transactionGateway.feedTransactions([transaction]);

          const res = await request(app).get(`${URL}?lang=${lang}`);

          expect(res.status).toBe(200);
          testTranslations(res.text, getAddressTranslations(translationText));
          expect(countOccurrences(res.text, toEscapedHtml(serviceName))).toBe(2);
        }
      );

      it("should populate the address list", async () => {
        const res = await request(app).get(URL);

        expect(res.status).toBe(200);
        expect(res.text).toContain("2 Duncalf Street, Stoke-On-Trent, ST6 3LJ");
        expect(res.text).toContain("The Lodge Duncalf&#39;s Street, Castle Hill, Stoke-On-Trent, ST6 3LJ");
        expect(res.text).toContain("4 Duncalf Street, Stoke-On-Trent, ST6 3LJ");
        expect(res.text).toContain("6 Duncalf Street, Stoke-On-Trent, ST6 3LJ");
      });

      it("should return error page when gateway getListOfValidPostcodeAddresses throws an error", async () => {
        appDevDependencies.addressLookUpGateway.setError(true);

        const res = await request(app).get(URL);

        expect(res.status).toBe(500);
        expect(res.text).toContain(enTranslationText.errorPage.title);
      });
    });

    describe("POST", () => {
      it("should redirect to the next page and add select address to cache", async () => {
        const countryValue = addressType === "usualResidential" ? "England" : "GB-ENG";

        const res = await request(app)
          .post(URL)
          .send({
            pageType,
            selected_address: `{
            "postal_code": "ST6 3LJ",
            "premises": "4",
            "address_line_1": "DUNCALF STREET",
            "address_line_2": "",
            "locality": "STOKE-ON-TRENT",
            "country": "${countryValue}"
          }`
          });

        expect(res.status).toBe(302);
        expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);

        const cache = appDevDependencies.cacheRepository.cache;
        expect(cache?.[`${config.APPLICATION_CACHE_KEY}`]).toEqual({
          [appDevDependencies.transactionGateway.transactionId]: {
            [postcodeKey]: "ST6 3LJ",
            [addressKey]: {
              postal_code: "ST6 3LJ",
              premises: "4",
              address_line_1: "DUNCALF STREET",
              address_line_2: "",
              locality: "STOKE-ON-TRENT",
              country: countryValue
            }
          }
        });
      });

      it("should redirect to the error page if address can't be deserialised", async () => {
        const res = await request(app).post(URL).send({
          pageType,
          selected_address: `some address`
        });

        expect(res.status).toBe(500);
        expect(res.text).toContain(enTranslationText.errorPage.title);

        const cache = appDevDependencies.cacheRepository.cache;
        expect(cache?.[`${config.APPLICATION_CACHE_KEY}`]).not.toHaveProperty(
          `${config.APPLICATION_CACHE_KEY_PREFIX_POST_TRANSITION}${pageType}`
        );
      });

      it("should trigger GDS validation error when no address is selected", async () => {
        const res = await request(app).post(URL).send({
          pageType
        });

        const errorMessage = enTranslationText.errorMessages.address.chooseAddress.selectionRequired;

        expect(res.status).toBe(200);
        expect(countOccurrences(res.text, errorMessage)).toBe(2);
      });
    });
  }
);
