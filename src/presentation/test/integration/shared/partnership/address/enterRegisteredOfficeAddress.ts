import request from "supertest";
import { Jurisdiction } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

import app from "../../../app";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../../utils";

import { enTranslationText, cyTranslationText } from "../../../../../../test/utils/locales";

import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import LimitedPartnershipBuilder from "../../../../builder/LimitedPartnershipBuilder";
import CompanyProfileBuilder from "../../../../builder/CompanyProfileBuilder";

import { SERVICE_NAME_KEY_TRANSITION } from "../../../../../../config/constants";
import { isPostTransition } from "../../utils";

type EnterRegisteredOfficeAddressTestConfig = {
  url: string;
  redirectUrl: string;
  translateExclude: string[];
  translateRegisteredOfficeAddressExclude: string[];
  serviceTitleTranslationKey: string | { serviceName: string };
};

export const runEnterRegisteredOfficeAddressTests = (config: EnterRegisteredOfficeAddressTestConfig): void => {
  describe("Enter Registered Office Address Page", () => {
    let companyProfile: { _id: string; data: Partial<CompanyProfile> };

    const URL = getUrl(config.url);

    beforeEach(() => {
      setLocalesEnabled(true);

      companyProfile = new CompanyProfileBuilder().build();
      appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
      appDevDependencies.limitedPartnershipGateway.feedErrors();
    });

    describe("GET Enter Registered Office Address Page", () => {
      it.each(
        [
          ["en", enTranslationText],
          ["cy", cyTranslationText]
        ]
      )("should load the enter registered office address page with English text", async (lang: string, translationText: Record<string, any>) => {

        const res = await request(app).get(`${URL}?lang=${lang}`);

        expect(res.status).toBe(200);

        testTranslations(res.text, translationText.address.enterAddress, config.translateExclude);

        testTranslations(res.text, translationText.address.registeredOffice, config.translateRegisteredOfficeAddressExclude);

        expect(res.text).toContain(
          isPostTransition(config.serviceTitleTranslationKey) ?
            translationText.buttons.continue
            : translationText.buttons.saveAndContinue
        );
      });
    });

    describe("POST Enter Registered Office Address Page", () => {
      it("should redirect to the next page", async () => {
        const limitedPartnership = new LimitedPartnershipBuilder().withJurisdiction(Jurisdiction.ENGLAND_AND_WALES).build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const res = await request(app)
          .post(URL)
          .send({
            pageType: AddressPageType.enterRegisteredOfficeAddress,
            ...limitedPartnership.data?.registered_office_address
          });

        expect(res.status).toBe(302);

        expect(res.text).toContain(`Redirecting to ${getUrl(config.redirectUrl)}`);
      });

      it.each([
        [Jurisdiction.SCOTLAND, "Northern Ireland"],
        [Jurisdiction.NORTHERN_IRELAND, "Scotland"],
        [Jurisdiction.ENGLAND_AND_WALES, "Scotland"]
      ])("should return a validation error when jurisdiction of %s does not match country", async (jurisdiction: Jurisdiction, country: string) => {
        const limitedPartnership = new LimitedPartnershipBuilder().withJurisdiction(jurisdiction).build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const res = await request(app)
          .post(URL)
          .send({
            pageType: AddressPageType.enterRegisteredOfficeAddress,
            ...limitedPartnership.data?.registered_office_address,
            country: country
          });

        expect(res.status).toBe(200);
        expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.jurisdictionCountry);
        expect(res.text).toContain(enTranslationText.govUk.error.title);

        let partnershipName = limitedPartnership?.data?.partnership_name?.toUpperCase();
        if (config.serviceTitleTranslationKey === SERVICE_NAME_KEY_TRANSITION) {
          partnershipName = `${partnershipName} (${limitedPartnership?.data?.partnership_number?.toUpperCase()})`;
        } else if (isPostTransition(config.serviceTitleTranslationKey)) {
          partnershipName = `${companyProfile.data.companyName?.toUpperCase()} (${companyProfile.data.companyNumber?.toUpperCase()})`;
        }

        expect(res.text).toContain(partnershipName);
      });

      it("should return a validation error when postcode format is invalid", async () => {
        const limitedPartnership = new LimitedPartnershipBuilder()
          .withJurisdiction(Jurisdiction.ENGLAND_AND_WALES)
          .build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const res = await request(app)
          .post(URL)
          .send({
            pageType: AddressPageType.enterRegisteredOfficeAddress,
            ...limitedPartnership.data?.registered_office_address,
            postal_code: "here"
          });

        expect(res.status).toBe(200);
        expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.postcodeFormat);
        expect(res.text).toContain(enTranslationText.govUk.error.title);
      });

      it("should not return validation errors when address fields contain valid but non alpha-numeric characters", async () => {
        const limitedPartnership = new LimitedPartnershipBuilder()
          .withJurisdiction(Jurisdiction.ENGLAND_AND_WALES)
          .build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const res = await request(app)
          .post(URL)
          .send({
            pageType: AddressPageType.enterRegisteredOfficeAddress,
            ...limitedPartnership.data?.registered_office_address,
            premises: "-,.:; &@$£¥€'?!/\\řśŝşšţťŧùúûüũūŭůűųŵẁẃẅỳýŷÿźżžñńņňŋòóôõöøōŏőǿœŕŗàáâãäåāăąæǽçćĉċč",
            address_line_1: "()[]{}<>*=#%+ÀÁÂÃÄÅĀĂĄÆǼÇĆĈĊČÞĎÐÈÉÊËĒĔĖĘĚĜĞĠĢ",
            address_line_2: "ĤĦÌÍÎÏĨĪĬĮİĴĶĹĻĽĿŁÑŃŅŇŊÒÓÔÕÖØŌŎŐǾŒŔŖŘŚŜŞŠŢŤŦ",
            locality: "ÙÚÛÜŨŪŬŮŰŲŴẀẂẄỲÝŶŸŹŻŽa-zÀÖØſƒǺẀỲ",
            region: "þďðèéêëēĕėęěĝģğġĥħìíîïĩīĭįĵķĺļľŀł"
          });

        expect(res.status).toBe(302);

        expect(res.text).toContain(`Redirecting to ${getUrl(config.redirectUrl)}`);
      });

      it("should return validation errors when address fields contain invalid characters", async () => {
        const limitedPartnership = new LimitedPartnershipBuilder()
          .withJurisdiction(Jurisdiction.ENGLAND_AND_WALES)
          .build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const res = await request(app)
          .post(URL)
          .send({
            pageType: AddressPageType.enterRegisteredOfficeAddress,
            ...limitedPartnership.data?.registered_office_address,
            premises: "±",
            address_line_1: "±",
            address_line_2: "±",
            locality: "±",
            region: "±",
            postal_code: "±",
            country: "±"
          });

        expect(res.status).toBe(200);
        expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.premisesInvalid);
        expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.addressLine1Invalid);
        expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.addressLine2Invalid);
        expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.localityInvalid);
        expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.regionInvalid);
        expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.postcodeInvalid);

        expect(res.text).toContain(enTranslationText.govUk.error.title);
      });

      it("should return validation errors when address fields exceed character limit", async () => {
        const limitedPartnership = new LimitedPartnershipBuilder()
          .withJurisdiction(Jurisdiction.ENGLAND_AND_WALES)
          .build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const res = await request(app)
          .post(URL)
          .send({
            pageType: AddressPageType.enterRegisteredOfficeAddress,
            ...limitedPartnership.data?.registered_office_address,
            premises: "toomanycharacters".repeat(13),
            address_line_1: "toomanycharacters".repeat(4),
            address_line_2: "toomanycharacters".repeat(4),
            locality: "toomanycharacters".repeat(4),
            region: "toomanycharacters".repeat(4)
          });

        expect(res.status).toBe(200);
        expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.premisesLength);
        expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.addressLine1Length);
        expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.addressLine2Length);
        expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.localityLength);
        expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.regionLength);
      });
    });
  });
};
