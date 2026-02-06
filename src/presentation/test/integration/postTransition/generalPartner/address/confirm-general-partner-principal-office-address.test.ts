import request from "supertest";

import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";
import enErrorMessages from "../../../../../../../locales/en/errors.json";
import cyErrorMessages from "../../../../../../../locales/cy/errors.json";

import app from "../../../app";
import { countOccurrences, getUrl, setLocalesEnabled, testTranslations } from "../../../../utils";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";

import {
  CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  ENTER_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/postTransition";

import GeneralPartnerBuilder from "../../../../builder/GeneralPartnerBuilder";
import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import {
  GENERAL_PARTNER_CHECK_YOUR_ANSWERS_URL,
  UPDATE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL,
  WHEN_DID_GENERAL_PARTNER_DETAILS_CHANGE_URL
} from "../../../../../controller/postTransition/url";
import TransactionBuilder from "../../../../builder/TransactionBuilder";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

describe("Confirm General Partner Principal Office Address Page", () => {
  const URL = getUrl(CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);
    appDevDependencies.cacheRepository.feedCache({
      [appDevDependencies.transactionGateway.transactionId]: {
        ["principal_office_address"]: {
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

    const generalPartner = new GeneralPartnerBuilder()
      .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
      .isPerson()
      .build();

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

    const transaction = new TransactionBuilder().withKind(PartnerKind.ADD_GENERAL_PARTNER_LEGAL_ENTITY).build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);
  });

  describe("GET Confirm Principal Office Address Page", () => {
    it("should load the confirm principal office address page with English text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.address.confirm.principalOfficeAddress);
      expect(res.text).not.toContain("WELSH -");

      expect(res.text).toContain("4 Line 1");
      expect(res.text).toContain("Line 2");
      expect(res.text).toContain("Stoke-On-Trent");
      expect(res.text).toContain("Region");
      expect(res.text).toContain(enTranslationText.countries.england);
      expect(res.text).toContain("ST6 3LJ");
      expect(countOccurrences(res.text, enTranslationText.serviceName.addGeneralPartner)).toBe(2);
    });

    it("should load the confirm principal office address page with Welsh text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      testTranslations(res.text, cyTranslationText.address.confirm.principalOfficeAddress);

      expect(res.text).toContain("4 Line 1");
      expect(res.text).toContain("Line 2");
      expect(res.text).toContain("Stoke-On-Trent");
      expect(res.text).toContain("Region");
      expect(res.text).toContain(cyTranslationText.countries.england);
      expect(res.text).toContain("ST6 3LJ");
      expect(countOccurrences(res.text, cyTranslationText.serviceName.addGeneralPartner)).toBe(2);
    });

    it.each([
      ["overseas", getUrl(ENTER_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL)],
      ["unitedKingdom", getUrl(POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL)]
    ])("should have the correct back link", async (territory, backLink) => {
      appDevDependencies.cacheRepository.feedCache({
        [appDevDependencies.transactionGateway.transactionId]: {
          poa_territory_choice: territory
        }
      });

      const res = await request(app).get(URL);

      expect(res.text).toContain(backLink);
    });

    it("should have back link to yes/no page when partner kind is UPDATE_GENERAL_PARTNER_LEGAL_ENTITY", async () => {
      const updateGeneralPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isLegalEntity()
        .withKind(PartnerKind.UPDATE_GENERAL_PARTNER_LEGAL_ENTITY)
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([updateGeneralPartner]);

      const backLinkUrl = getUrl(UPDATE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL);
      const res = await request(app).get(URL);

      expect(res.status).toBe(200);
      expect(res.text).toContain(backLinkUrl);
    });
  });

  describe("POST confirm Principal Office Address Page", () => {
    it("should redirect to the next page", async () => {
      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.confirmGeneralPartnerPrincipalOfficeAddress,
          address: `{
            "postal_code": "ST6 3LJ",
            "premises": "4",
            "address_line_1": "DUNCALF STREET",
            "address_line_2": "",
            "locality": "STOKE-ON-TRENT",
            "country": "England"
          }`
        });

      const redirectUrl = getUrl(GENERAL_PARTNER_CHECK_YOUR_ANSWERS_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });

    it("should redirect to the when did details change page for the update journey", async () => {
      const generalPartnerUpdate = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isLegalEntity()
        .withKind(PartnerKind.UPDATE_GENERAL_PARTNER_LEGAL_ENTITY)
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartnerUpdate]);
      const res = await request(app)
        .post(URL)
        .send({
          pageType: AddressPageType.confirmGeneralPartnerPrincipalOfficeAddress,
          address: `{
            "postal_code": "ST6 3LJ",
            "premises": "4",
            "address_line_1": "DUNCALF STREET",
            "address_line_2": "",
            "locality": "STOKE-ON-TRENT",
            "country": "England"
          }`
        });

      const redirectUrl = getUrl(WHEN_DID_GENERAL_PARTNER_DETAILS_CHANGE_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });

    it("should show error message if address is not provided", async () => {
      appDevDependencies.cacheRepository.feedCache({});

      const res = await request(app).post(URL).send({
        pageType: AddressPageType.confirmGeneralPartnerPrincipalOfficeAddress
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
        pageType: AddressPageType.confirmGeneralPartnerPrincipalOfficeAddress,
        address: `{"postal_code": "ST6 3LJ","premises": "4","address_line_1": "DUNCALF STREET","address_line_2": "","locality": "STOKE-ON-TRENT","country": ""}`
      });

      expect(res.status).toBe(200);
      expect(res.text).toContain(errorMessagesJson.errorMessages.address.confirm.countryMissing);
    });
  });
});
