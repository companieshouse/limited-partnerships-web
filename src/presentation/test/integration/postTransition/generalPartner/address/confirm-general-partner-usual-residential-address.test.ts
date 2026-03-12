import request from "supertest";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import app from "../../../app";
import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";
import enErrorMessages from "../../../../../../../locales/en/errors.json";
import cyErrorMessages from "../../../../../../../locales/cy/errors.json";

import { countOccurrences, feedTransactionAndPartner, getUrl, setLocalesEnabled, testTranslations, toEscapedHtml } from "../../../../utils";
import {
  CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  ENTER_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  TERRITORY_CHOICE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/postTransition";
import { UPDATE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_YES_NO_URL } from "../../../../../controller/postTransition/url";

import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import GeneralPartnerBuilder, { generalPartnerPerson } from "../../../../builder/GeneralPartnerBuilder";
import TransactionBuilder from "../../../../builder/TransactionBuilder";

describe("Confirm General Partner Usual Residential Address Page", () => {
  const URL = getUrl(CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(true);
    appDevDependencies.cacheRepository.feedCache({
      [appDevDependencies.transactionGateway.transactionId]: {
        ["usual_residential_address"]: {
          postal_code: "ST6 3LJ",
          premises: "4",
          address_line_1: "line 1",
          address_line_2: "line 2",
          locality: "stoke-on-trent",
          region: "region",
          country: "England"
        }
      }
    });

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
    appDevDependencies.transactionGateway.feedTransactions([]);
    appDevDependencies.generalPartnerGateway.feedErrors();
  });

  describe("GET Confirm Usual Residential Address Page", () => {
    it.each([
      ["add", "en"],
      ["add", "cy"],
      ["update", "en"],
      ["update", "cy"]
    ])("should load the confirm usual residential address page with English text", async (journey: string, lang: string) => {
      const translationText = lang === "en" ? enTranslationText : cyTranslationText;
      const partnerKind = journey === "add" ? PartnerKind.ADD_GENERAL_PARTNER_PERSON : PartnerKind.UPDATE_GENERAL_PARTNER_PERSON;
      feedTransactionAndPartner(partnerKind);

      const res = await request(app).get(URL + `?lang=${lang}`);

      expect(res.status).toBe(200);
      testTranslations(res.text, translationText.address.confirm.usualResidentialAddress);
      if (lang === "en") {
        expect(res.text).not.toContain("WELSH -");
      } else {
        expect(res.text).toContain("WELSH -");
      }

      expect(res.text).toContain("4 Line 1");
      expect(res.text).toContain("Line 2");
      expect(res.text).toContain("Stoke-On-Trent");
      expect(res.text).toContain("Region");
      expect(res.text).toContain(lang === "en" ? enTranslationText.countries.england : cyTranslationText.countries.england);
      expect(res.text).toContain("ST6 3LJ");
      expect(res.text).toContain(generalPartnerPerson.forename?.toUpperCase() + " " + generalPartnerPerson.surname?.toUpperCase());

      const expectedServiceName = journey === "add" ? translationText.serviceName.addGeneralPartner : translationText.serviceName.updateGeneralPartnerPerson;
      expect(countOccurrences(res.text, toEscapedHtml(expectedServiceName))).toBe(2);
    });

    it.each([
      ["add", "overseas", getUrl(ENTER_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL)],
      ["add", "unitedKingdom", getUrl(POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL)],
      ["update", "overseas", getUrl(ENTER_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL)],
      ["update", "unitedKingdom", getUrl(POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL)]
    ])("should have the correct back link", async (journey: string, territory: string, backLink: string) => {
      const partnerKind = journey === "add" ? PartnerKind.ADD_GENERAL_PARTNER_PERSON : PartnerKind.UPDATE_GENERAL_PARTNER_PERSON;
      feedTransactionAndPartner(partnerKind);

      appDevDependencies.cacheRepository.feedCache({
        [appDevDependencies.transactionGateway.transactionId]: {
          ura_territory_choice: territory
        }
      });

      const res = await request(app).get(URL);

      expect(res.text).toContain(backLink);
    });
  });

  describe("POST Confirm Usual Residential Address Page", () => {
    it.each([
      ["add"],
      ["update"]
    ])("should redirect to the next page", async (journey: string) => {
      const partnerKind = journey === "add" ? PartnerKind.ADD_GENERAL_PARTNER_PERSON : PartnerKind.UPDATE_GENERAL_PARTNER_PERSON;
      feedTransactionAndPartner(partnerKind);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.confirmGeneralPartnerUsualResidentialAddress,
          address: `{
            "postal_code": "ST6 3LJ",
            "premises": "4",
            "address_line_1": "DUNCALF STREET",
            "address_line_2": "",
            "locality": "STOKE-ON-TRENT",
            "country": "England"
          }`
        });

      const REDIRECT_URL = journey === "add" ?
        getUrl(TERRITORY_CHOICE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL) :
        getUrl(UPDATE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_YES_NO_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT_URL}`);
    });

    it("should show error message if address is not provided", async () => {
      appDevDependencies.cacheRepository.feedCache({});

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.confirmGeneralPartnerUsualResidentialAddress
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain("You must provide an address");
    });

    it.each([
      [ "en", enErrorMessages ],
      [ "cy", cyErrorMessages ]
    ])("should show validation error message if validation error occurs when saving address with lang %s", async (lang: string, errorMessagesJson: any) => {
      setLocalesEnabled(true);
      const res = await request(app).post(`${URL}?lang=${lang}`).send({
        pageType: AddressPageType.confirmGeneralPartnerUsualResidentialAddress,
        address: `{"postal_code": "ST6 3LJ","premises": "4","address_line_1": "DUNCALF STREET","address_line_2": "","locality": "STOKE-ON-TRENT","country": ""}`
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(errorMessagesJson.errorMessages.address.confirm.countryMissing);
    });

    it("should redirect to the confirm correspondance address if already saved", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .withServiceAddress()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

      const transaction = new TransactionBuilder().withKind(PartnerKind.ADD_GENERAL_PARTNER_PERSON).build();
      appDevDependencies.transactionGateway.feedTransactions([transaction]);

      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.confirmGeneralPartnerUsualResidentialAddress,
          address: `{
            "postal_code": "ST6 3LJ",
            "premises": "4",
            "address_line_1": "DUNCALF STREET",
            "address_line_2": "",
            "locality": "STOKE-ON-TRENT",
            "country": "England"
          }`
        });

      const redirectUrl = getUrl(CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });
  });
});
