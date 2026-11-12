import request from "supertest";
import { PartnerKind, PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import {

  countOccurrences,
  getUrl,
  setLocalesEnabled,
  testTranslations,
  toEscapedHtml,
} from "../../../utils";

import { enTranslationText, cyTranslationText } from "../../../../../test/utils/locales";

import {
  UPDATE_LIMITED_PARTNER_PERSON_CAPITAL_CONTRIBUTION_URL,
  UPDATE_LIMITED_PARTNER_PERSON_CAPITAL_CONTRIBUTION_YES_NO_URL,
  UPDATE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL
} from "../../../../controller/postTransition/url";

import TransactionGeneralPartner from "../../../../../domain/entities/TransactionGeneralPartner";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";
import TransactionBuilder from "../../../builder/TransactionBuilder";
import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import postTransitionRouting from "../../../../controller/postTransition/routing";

describe("Update Capital Contribution Yes No Page", () => {
  const URL = getUrl(UPDATE_LIMITED_PARTNER_PERSON_CAPITAL_CONTRIBUTION_URL);
  const REDIRECT = getUrl(UPDATE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL);
  const BACK_URL = getUrl(UPDATE_LIMITED_PARTNER_PERSON_CAPITAL_CONTRIBUTION_YES_NO_URL);

  let limitedPartner: TransactionGeneralPartner;

  beforeEach(() => {
    setLocalesEnabled(true);

    const companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    limitedPartner = new LimitedPartnerBuilder()
      .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
      .isPerson()
      .build();

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);
    appDevDependencies.limitedPartnerGateway.feedErrors();

    const transaction = new TransactionBuilder().withKind(PartnerKind.UPDATE_LIMITED_PARTNER_PERSON).build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);
  });

  describe("GET Update Capital Contribution Yes No Page", () => {
    it.each([
      ["English LP", PartnershipType.LP, "en", enTranslationText],
      ["Welsh LP", PartnershipType.LP, "cy", cyTranslationText],
      ["English SLP", PartnershipType.SLP, "en", enTranslationText],
      ["Welsh SLP", PartnershipType.SLP, "cy", cyTranslationText]
    ])(
      "should load the update capital contribution page with %s text",
      async (description: string, partnershipType: PartnershipType, lang: string, translationText: any) => {
        const companyProfile = new CompanyProfileBuilder().withSubtype(partnershipType).build();
        appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

        const res = await request(app).get(`${URL}?lang=${lang}`);

        expect(res.status).toBe(200);

        expect(res.text).toContain(
          `${limitedPartner.data?.forename?.toUpperCase()} ${limitedPartner.data?.surname?.toUpperCase()}`
        );

        testTranslations(res.text, translationText.partner.capitalContribution);
        expect(countOccurrences(res.text, toEscapedHtml(translationText.serviceName.updateLimitedPartnerPerson))).toBe(
          2
        );

        expect(res.text).toContain(translationText.buttons.continue);

        expect(res.text).toContain(getUrl(BACK_URL));
      }
    );

    it.each([
      ["PLP", PartnershipType.PFLP],
      ["SPFLP", PartnershipType.SPFLP]
    ])(
      "should redirected to usual residential address if type is %s",
      async (description: string, partnershipType: PartnershipType) => {
        const companyProfile = new CompanyProfileBuilder().withSubtype(partnershipType).build();
        appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

        const res = await request(app).get(URL);

        expect(res.status).toBe(302);
        expect(res.text).toContain(`Redirecting to ${REDIRECT}`);
      }
    );
  });

  describe("POST Update Capital Contribution Page", () => {
    it("should redirect to URA yes no", async () => {
      const res = await request(app)
        .post(`${URL}`)
        .send({
          pageType: PostTransitionPageType.updateLimitedPartnerPersonCapitalContribution,
          contribution_currency_type: "Pound Sterling (GBP)",
          contribution_currency_value: "100.00",
          contribution_sub_types: ["MONEY"]
        });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${REDIRECT}`);
    });

    it("should return validation error when no data", async () => {
      const res = await request(app)
        .post(URL)
        .send({
          ...postTransitionRouting.get(PostTransitionPageType.updateLimitedPartnerPersonCapitalContribution),
          partnershipType: PartnershipType.LP
        });

      expect(res.status).toBe(200);

      expect(res.text).toContain(enTranslationText.errorMessages.capitalContribution.currencyRequired);
      expect(res.text).toContain(enTranslationText.errorMessages.capitalContribution.valueRequired);
      expect(res.text).toContain(enTranslationText.errorMessages.capitalContribution.atLeastOneType);
    });
  });
});
