import request from "supertest";

import app from "../../../app";
import { appDevDependencies } from "../../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../../utils";

import { enTranslationText, cyTranslationText } from "../../../../../../test/utils/locales";

import AddressPageType from "../../../../../controller/addressLookUp/PageType";
import LimitedPartnershipBuilder from "../../../../builder/LimitedPartnershipBuilder";

type ConfirmRegisteredOfficeAddressTestConfig = {
  url: string;
  redirectUrl: string;
  confirmRedirectUrl?: string;
  translateExclude: string[];
  serviceTitleTranslationKey: string | { serviceName: string };
  customerFeedbackUrl: string;
};

export const runConfirmRegisteredOfficeAddressTests = (config: ConfirmRegisteredOfficeAddressTestConfig): void => {
  describe("Confirm Registered Office Address Page", () => {
    const URL = getUrl(config.url);

    beforeEach(() => {
      setLocalesEnabled(true);

      appDevDependencies.cacheRepository.feedCache({
        [appDevDependencies.transactionGateway.transactionId]: {
          ["registered_office_address"]: {
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

      const limitedPartnership = new LimitedPartnershipBuilder()
        .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
        .withPrincipalPlaceOfBusinessAddress(null)
        .build();

      appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);
    });

    describe("GET Confirm Registered Office Address Page", () => {
      it.each([
        ["en", enTranslationText],
        ["cy", cyTranslationText]
      ])("should load the confirm registered office address page with English text", async (lang: string, translationText: Record<string, any>) => {

        const res = await request(app).get(`${URL}?lang=${lang}`);

        expect(res.status).toBe(200);

        testTranslations(res.text, translationText.address.confirm.registeredOfficeAddress);

        expect(res.text).toContain("4 Line 1");
        expect(res.text).toContain("Line 2");
        expect(res.text).toContain("Stoke-On-Trent");
        expect(res.text).toContain("Region");
        expect(res.text).toContain("ST6 3LJ");
        expect(res.text).toContain(translationText.countries.england);

        expect(res.text).toContain(config.customerFeedbackUrl);
      });

      describe("Map Country Code", () => {
        it.each([
          ["Wales", {
            postal_code: "CF3 0AD",
            premises: "261",
            address_line_1: "OAKLANDS CLOSE",
            address_line_2: "",
            locality: "CARDIFF",
            country: "Wales"
          }],
          ["Scotland", {
            postal_code: "IV18 0JT",
            premises: "1",
            address_line_1: "MAIN AVENUE",
            address_line_2: "",
            locality: "INVERGORDON",
            country: "Scotland"
          }],
          ["Northern Ireland", {
            postal_code: "BT12 6QH",
            premises: "11E",
            address_line_1: "GLENMACHAN CLOSE",
            address_line_2: "",
            locality: "BELFAST",
            country: "Northern Ireland"
          }]
        ])("should return Wales if country code is %s", async (country: string, address: Record<string, any>) => {
          appDevDependencies.cacheRepository.feedCache({
            [appDevDependencies.transactionGateway.transactionId]: {
              ["registered_office_address"]: address
            }
          });

          const res = await request(app).get(URL);

          expect(res.status).toBe(200);

          expect(res.text).toContain(country);
        });
      });

      it.each([
        ["en", enTranslationText],
        ["cy", cyTranslationText]
      ])("should load the confirm registered office address page with Welsh text", async (lang: string, translationText: Record<string, any>) => {

        const res = await request(app).get(`${URL}?lang=${lang}`);

        expect(res.status).toBe(200);

        testTranslations(res.text, translationText.address.confirm.registeredOfficeAddress, ["newRequirement"]);
        expect(res.text).toContain(translationText.countries.england);

        expect(res.text).toContain(config.customerFeedbackUrl);
      });
    });

    describe("POST Confirm Registered Office Address Page", () => {
      it("should redirect to the next page", async () => {
        const res = await request(app).post(URL).send({
          pageType: AddressPageType.confirmRegisteredOfficeAddress,
          address: `{"postal_code": "ST6 3LJ","premises": "4","address_line_1": "DUNCALF STREET","address_line_2": "","locality": "STOKE-ON-TRENT","country": "England"}`
        });

        expect(res.status).toBe(302);

        expect(res.text).toContain(`Redirecting to ${getUrl(config.redirectUrl)}`);
      });

      if (config.confirmRedirectUrl) {
        it("should redirect to confirm principal place of business if address already saved", async () => {
          const limitedPartnership = new LimitedPartnershipBuilder()
            .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
            .build();

          appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

          const res = await request(app).post(URL).send({
            pageType: AddressPageType.confirmRegisteredOfficeAddress,
            address: `{"postal_code": "ST6 3LJ","premises": "4","address_line_1": "DUNCALF STREET","address_line_2": "","locality": "STOKE-ON-TRENT","country": "England"}`
          });

          expect(res.status).toBe(302);

          expect(res.text).toContain(`Redirecting to ${getUrl(config.confirmRedirectUrl ?? "fallback")}`);
        });
      }

      it("should show error message if address is not provided", async () => {
        appDevDependencies.cacheRepository.feedCache({});

        const res = await request(app).post(URL).send({
          pageType: AddressPageType.confirmRegisteredOfficeAddress
        });

        expect(res.status).toBe(200);

        expect(res.text).toContain("You must provide an address");
      });

      it("should show validation error message if validation error occurs when saving address", async () => {
        const limitedPartnership = new LimitedPartnershipBuilder()
          .withId(appDevDependencies.limitedPartnershipGateway.submissionId)
          .build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const res = await request(app).post(URL).send({
          pageType: AddressPageType.confirmRegisteredOfficeAddress,
          address: `{"postal_code": "ST6 3LJ","premises": "4","address_line_1": "DUNCALF STREET","address_line_2": "","locality": "STOKE-ON-TRENT","country": ""}`
        });

        expect(res.status).toBe(200);
        expect(res.text).toContain(enTranslationText.errorMessages.address.confirm.countryMissing);
      });
    });
  });
};
