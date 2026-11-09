import request from "supertest";
import { PartnerKind, PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import {
  countOccurrences,
  getUrl,
  setLocalesEnabled,
  testTranslations,
  toEscapedHtml
} from "../../../utils";
import { enTranslationText, cyTranslationText } from "../../../../../test/utils/locales";

import {
  UPDATE_LIMITED_PARTNER_CAPITAL_CONTRIBUTION_URL,
  UPDATE_LIMITED_PARTNER_CAPITAL_CONTRIBUTION_YES_NO_URL,
  UPDATE_LIMITED_PARTNER_PERSON_WITH_IDS_URL,
  UPDATE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL
} from "../../../../controller/postTransition/url";

import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import TransactionBuilder from "../../../builder/TransactionBuilder";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";
import TransactionGeneralPartner from "../../../../../domain/entities/TransactionGeneralPartner";

describe("Update Capital Contribution Yes No Page", () => {
  const URL = getUrl(UPDATE_LIMITED_PARTNER_CAPITAL_CONTRIBUTION_YES_NO_URL);
  const REDIRECT_YES = getUrl(UPDATE_LIMITED_PARTNER_CAPITAL_CONTRIBUTION_URL);
  const REDIRECT_NO = getUrl(UPDATE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL);

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
      "should load the update capital contribution yes no page with %s text",
      async (description: string, partnershipType: PartnershipType, lang: string, translationText: any) => {
        const companyProfile = new CompanyProfileBuilder().withSubtype(partnershipType).build();
        appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

        const res = await request(app).get(`${URL}?lang=${lang}`);

        expect(res.status).toBe(200);

        expect(res.text).toContain(
          `${limitedPartner.data?.forename?.toUpperCase()} ${limitedPartner.data?.surname?.toUpperCase()}`
        );

        testTranslations(res.text, translationText.partner.update.limitedPartnerCapitalContribution);
        expect(countOccurrences(res.text, toEscapedHtml(translationText.serviceName.updateLimitedPartnerPerson))).toBe(
          2
        );

        if (lang === "cy") {
          expect(res.text).toContain("WELSH - ");
        } else {
          expect(res.text).not.toContain("WELSH -");
        }

        expect(res.text).toContain(translationText.buttons.continue);

        expect(res.text).toContain(getUrl(UPDATE_LIMITED_PARTNER_PERSON_WITH_IDS_URL));
      }
    );

    it.each([
      ["PLP", PartnershipType.PFLP],
      ["SPFLP", PartnershipType.SPFLP]
    ])(
      "should redicted to usual residential address if type is %s",
      async (description: string, partnershipType: PartnershipType) => {
        const companyProfile = new CompanyProfileBuilder().withSubtype(partnershipType).build();
        appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

        const res = await request(app).get(URL);

        expect(res.status).toBe(302);
        expect(res.text).toContain(`Redirecting to ${REDIRECT_NO}`);
      }
    );

    it.each([true, false])(
      "should load the update capital contribution yes no page with %s radio button checked",
      async (radioValue: boolean) => {

        // @ts-expect-error - 'limitedPartner.data' is possibly 'undefined' ts(18048)
        limitedPartner.data.update_capital_contribution_required = radioValue;

        const res = await request(app).get(`${URL}`);

        expect(res.status).toBe(200);

        expect(res.text).toContain(`value="${radioValue}" checked`);
      }
    );
  });

  describe("POST Update Capital Contribution Yes No Page", () => {
    it.each([
      ['Capital contribution page when "yes"', "true", REDIRECT_YES],
      ['URA yes no page when "no"', "false", REDIRECT_NO]
    ])("should redirect to %s is selected", async (description: string, pageValue: string, redirectUrl: string) => {
      const res = await request(app).post(`${URL}`).send({
        pageType: PostTransitionPageType.updateLimitedPartnerCapitalContributionYesNo,
        update_capital_contribution_required: pageValue
      });

      expect(res.status).toBe(302);
      expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
    });

    it("should return validation error when no option is selected", async () => {
      const res = await request(app).post(`${URL}`).send({
        pageType: PostTransitionPageType.updateLimitedPartnerCapitalContributionYesNo
      });

      expect(res.status).toBe(200);
      const errorMessage = enTranslationText.errorMessages.partners.updateCapitalContributionRequired;
      expect(countOccurrences(res.text, toEscapedHtml(errorMessage))).toBe(2);
    });
  });
});
