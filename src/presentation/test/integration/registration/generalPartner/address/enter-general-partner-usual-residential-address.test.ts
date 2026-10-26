import request from "supertest";

import app from "../../../app";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testCountryDropdown, testTranslations } from "../../../../utils";
import * as config from "../../../../../../config";

import {
  CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  ENTER_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/registration";

import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import GeneralPartnerBuilder, {
  generalPartnerLegalEntity,
  generalPartnerPerson
} from "../../../../builder/GeneralPartnerBuilder";
import TransactionGeneralPartner from "../../../../../../domain/entities/TransactionGeneralPartner";
import { enTranslationText, cyTranslationText } from "../../../../../../test/utils/locales";
describe("Enter Usual Residential Address Page", () => {
  const URL = getUrl(ENTER_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);
  const redirectUrl = getUrl(CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);

  let generalPartner: TransactionGeneralPartner;

  beforeEach(() => {
    setLocalesEnabled(false);

    appDevDependencies.cacheRepository.feedCache(null);

    generalPartner = new GeneralPartnerBuilder()
      .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
      .isPerson()
      .build();

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);
  });

  describe("GET Enter general partners usual residential address", () => {
    it.each([
      ["en", "unitedKingdom"],
      ["cy", "unitedKingdom"],
      ["en", "overseas"],
      ["cy", "overseas"]
    ])(
      "should load enter general partners usual residential address page with %s text and %s territory",
      async (lang: string, territoryChoice: string) => {
        setLocalesEnabled(true);

        const translationText = lang === "en" ? enTranslationText : cyTranslationText;

        appDevDependencies.cacheRepository.feedCache({
          [appDevDependencies.transactionGateway.transactionId]: {
            ura_territory_choice: territoryChoice
          }
        });

        const res = await request(app).get(URL + `?lang=${lang}`);

        expect(res.status).toBe(200);

        testTranslations(res.text, translationText.address.enterAddress, [
          "registeredOfficeAddress",
          "principalPlaceOfBusinessAddress",
          "jurisdictionCountry",
          "correspondenceAddress",
          "principalOfficeAddress",
          "postcodeOptional",
          "limitedPartner",
          "personWithSignificantControl",
          "errorMessages"
        ]);

        if (lang === "cy") {
          expect(res.text).toContain("WELSH -");
        } else {
          expect(res.text).not.toContain("WELSH -");
        }

        expect(res.text).toContain(generalPartnerPerson.forename?.toUpperCase());
        expect(res.text).toContain(generalPartnerPerson.surname?.toUpperCase());
        expect(res.text).not.toContain(generalPartnerLegalEntity.legal_entity_name?.toUpperCase());

        expect(res.text).toContain(translationText.buttons.saveAndContinue);

        const backLinkUrl =
          territoryChoice === "overseas" ?
            getUrl(TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL)
            : getUrl(POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);
        expect(res.text).toContain(backLinkUrl);

        testCountryDropdown(res.text, translationText.countries, {
          territoryChoice,
          isUsualResidentialAddress: true
        });
      }
    );
  });

  describe("POST Enter general partners usual residential address Page", () => {
    it("should redirect and add entered address to the cache", async () => {
      appDevDependencies.addressLookUpGateway.setError(false);
      appDevDependencies.cacheRepository.feedCache({
        [appDevDependencies.transactionGateway.transactionId]: {
          ["usual_residential_address"]: {
            address_line_1: "",
            address_line_2: "",
            country: "",
            locality: "",
            postal_code: "",
            premises: "",
            region: ""
          }
        }
      });
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.enterGeneralPartnerUsualResidentialAddress,
        postal_code: "CF3 2DS",
        premises: "4",
        address_line_1: "DUNCALF STREET",
        address_line_2: "",
        locality: "STOKE-ON-TRENT",
        country: "England"
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);

      const cache = appDevDependencies.cacheRepository.cache;
      expect(cache?.[`${config.APPLICATION_CACHE_KEY}`]).toEqual({
        [appDevDependencies.transactionGateway.transactionId]: {
          usual_residential_address: {
            postal_code: "CF3 2DS",
            premises: "4",
            address_line_1: "DUNCALF STREET",
            address_line_2: "",
            locality: "STOKE-ON-TRENT",
            country: "England",
            region: undefined
          }
        }
      });
    });

    it("should redirect to the confirm general partners usual residential address page", async () => {
      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterGeneralPartnerUsualResidentialAddress,
          ...generalPartner.data?.usual_residential_address
        });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });

    it("should redirect to the error page when error occurs during Post", async () => {
      const res = await request(app).post(URL).send({
        pageType: "Invalid page type",
        country: ""
      });

      expect(res.status).toBe(500);
      expect(res.text).toContain(enTranslationText.errorPage.title);
    });

    it("should redirect if postcode is null", async () => {
      const res = await request(app).post(URL).send({
        pageType: AddressPageType.confirmRegisteredOfficeAddress,
        postal_code: "",
        premises: "4",
        address_line_1: "DUNCALF STREET",
        address_line_2: "",
        locality: "STOKE-ON-TRENT",
        country: "France"
      });

      expect(res.status).toBe(302);
    });

    it("should not return a validation error when an overseas address and postcode does not conform to UK format", async () => {
      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterGeneralPartnerUsualResidentialAddress,
          ...generalPartner.data?.usual_residential_address,
          postal_code: "here",
          country: "Vatican City"
        });

      const redirectUrl = getUrl(CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);
      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });

    it("should return a validation error when a UK address and postcode format is invalid", async () => {
      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterGeneralPartnerUsualResidentialAddress,
          ...generalPartner.data?.usual_residential_address,
          postal_code: "here"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.postcodeFormat);
      expect(res.text).toContain(enTranslationText.govUk.error.title);
      expect(res.text).toContain(
        `${generalPartner.data?.forename?.toUpperCase()} ${generalPartner.data?.surname?.toUpperCase()}`
      );
    });

    it("should not return validation errors when address fields contain valid but non alpha-numeric characters", async () => {
      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterGeneralPartnerUsualResidentialAddress,
          ...generalPartner.data?.usual_residential_address,
          premises: "-,.:; &@$£¥€'?!/\\řśŝşšţťŧùúûüũūŭůűųŵẁẃẅỳýŷÿźżžñńņňŋòóôõöøōŏőǿœŕŗàáâãäåāăąæǽçćĉċč",
          address_line_1: "()[]{}<>*=#%+ÀÁÂÃÄÅĀĂĄÆǼÇĆĈĊČÞĎÐÈÉÊËĒĔĖĘĚĜĞĠĢ",
          address_line_2: "ĤĦÌÍÎÏĨĪĬĮİĴĶĹĻĽĿŁÑŃŅŇŊÒÓÔÕÖØŌŎŐǾŒŔŖŘŚŜŞŠŢŤŦ",
          locality: "ÙÚÛÜŨŪŬŮŰŲŴẀẂẄỲÝŶŸŹŻŽa-zÀÖØſƒǺẀỲ",
          region: "þďðèéêëēĕėęěĝģğġĥħìíîïĩīĭįĵķĺļľŀł"
        });

      const redirectUrl = getUrl(CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);
      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });

    it("should return validation errors when address fields contain invalid characters", async () => {
      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterGeneralPartnerUsualResidentialAddress,
          ...generalPartner.data?.usual_residential_address,
          premises: "±",
          address_line_1: "±",
          address_line_2: "±",
          locality: "±",
          region: "±"
        });

      expect(res.status).toBe(200);
      expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.premisesInvalid);
      expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.addressLine1Invalid);
      expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.addressLine2Invalid);
      expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.localityInvalid);
      expect(res.text).toContain(enTranslationText.errorMessages.address.enterAddress.regionInvalid);
      expect(res.text).toContain(enTranslationText.govUk.error.title);
    });

    it("should return validation errors when address fields exceed character limit", async () => {
      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.enterGeneralPartnerUsualResidentialAddress,
          ...generalPartner.data?.usual_residential_address,
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
