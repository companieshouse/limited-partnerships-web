import request from "supertest";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import app from "../../../app";
import enTranslationText from "../../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../../locales/cy/translations.json";
import enErrorMessages from "../../../../../../../locales/en/errors.json";
import cyErrorMessages from "../../../../../../../locales/cy/errors.json";

import { getUrl, setLocalesEnabled, testTranslations } from "../../../../utils";
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
import GeneralPartnerBuilder from "../../../../builder/GeneralPartnerBuilder";

describe("Confirm General Partner Usual Residential Address Page", () => {
  const URL = getUrl(CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL);

  beforeEach(() => {
    setLocalesEnabled(false);
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

    const generalPartner = new GeneralPartnerBuilder()
      .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
      .isPerson()
      .build();

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);
    appDevDependencies.generalPartnerGateway.feedErrors();
  });

  describe("GET Confirm Usual Residential Address Page", () => {
    it("should load the confirm usual residential address page with English text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=en");

      expect(res.status).toBe(200);
      testTranslations(res.text, enTranslationText.address.confirm.usualResidentialAddress);
      expect(res.text).not.toContain("WELSH -");

      expect(res.text).toContain("4 Line 1");
      expect(res.text).toContain("Line 2");
      expect(res.text).toContain("Stoke-On-Trent");
      expect(res.text).toContain("Region");
      expect(res.text).toContain(enTranslationText.countries.england);
      expect(res.text).toContain("ST6 3LJ");
    });

    it("should load the confirm usual residential address page with Welsh text", async () => {
      setLocalesEnabled(true);

      const res = await request(app).get(URL + "?lang=cy");

      expect(res.status).toBe(200);
      testTranslations(res.text, cyTranslationText.address.confirm.usualResidentialAddress);

      expect(res.text).toContain("4 Line 1");
      expect(res.text).toContain("Line 2");
      expect(res.text).toContain("Stoke-On-Trent");
      expect(res.text).toContain("Region");
      expect(res.text).toContain(cyTranslationText.countries.england);
      expect(res.text).toContain("ST6 3LJ");
    });

    it.each([
      ["overseas", getUrl(ENTER_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL)],
      ["unitedKingdom", getUrl(POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL)]
    ])("should have the correct back link", async (territory, backLink) => {
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
    it("should redirect to the next page", async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

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

      const redirectUrl = getUrl(TERRITORY_CHOICE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
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

    it(`should redirect to the ${UPDATE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_YES_NO_URL} url if kind is ${PartnerKind.UPDATE_GENERAL_PARTNER_PERSON}`, async () => {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .withKind(PartnerKind.UPDATE_GENERAL_PARTNER_PERSON)
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

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

      const redirectUrl = getUrl(UPDATE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_YES_NO_URL);

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });
  });
});
