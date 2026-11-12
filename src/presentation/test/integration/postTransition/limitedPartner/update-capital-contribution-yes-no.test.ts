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
  UPDATE_LIMITED_PARTNER_LEGAL_ENTITY_CAPITAL_CONTRIBUTION_URL,
  UPDATE_LIMITED_PARTNER_LEGAL_ENTITY_CAPITAL_CONTRIBUTION_YES_NO_URL,
  UPDATE_LIMITED_PARTNER_LEGAL_ENTITY_WITH_IDS_URL,
  UPDATE_LIMITED_PARTNER_PERSON_CAPITAL_CONTRIBUTION_URL,
  UPDATE_LIMITED_PARTNER_PERSON_CAPITAL_CONTRIBUTION_YES_NO_URL,
  UPDATE_LIMITED_PARTNER_PERSON_WITH_IDS_URL,
  UPDATE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL,
  UPDATE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL
} from "../../../../controller/postTransition/url";

import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import TransactionBuilder from "../../../builder/TransactionBuilder";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";
import TransactionGeneralPartner from "../../../../../domain/entities/TransactionGeneralPartner";

describe("Update Capital Contribution Yes No Page", () => {
  const config = {
    person: {
      url: getUrl(UPDATE_LIMITED_PARTNER_PERSON_CAPITAL_CONTRIBUTION_YES_NO_URL),
      redirectYes: getUrl(UPDATE_LIMITED_PARTNER_PERSON_CAPITAL_CONTRIBUTION_URL),
      redirectNo: getUrl(UPDATE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL),
      backLink: getUrl(UPDATE_LIMITED_PARTNER_PERSON_WITH_IDS_URL)
    },
    legalEntity: {
      url: getUrl(UPDATE_LIMITED_PARTNER_LEGAL_ENTITY_CAPITAL_CONTRIBUTION_YES_NO_URL),
      redirectYes: getUrl(UPDATE_LIMITED_PARTNER_LEGAL_ENTITY_CAPITAL_CONTRIBUTION_URL),
      redirectNo: getUrl(UPDATE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL),
      backLink: getUrl(UPDATE_LIMITED_PARTNER_LEGAL_ENTITY_WITH_IDS_URL)
    }
  };

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
      ["English LP", PartnershipType.LP, "en", enTranslationText, config.person],
      ["Welsh LP", PartnershipType.LP, "cy", cyTranslationText, config.person],
      ["English SLP", PartnershipType.SLP, "en", enTranslationText, config.person],
      ["Welsh SLP", PartnershipType.SLP, "cy", cyTranslationText, config.person],
      ["English LP", PartnershipType.LP, "en", enTranslationText, config.legalEntity],
      ["Welsh LP", PartnershipType.LP, "cy", cyTranslationText, config.legalEntity],
      ["English SLP", PartnershipType.SLP, "en", enTranslationText, config.legalEntity],
      ["Welsh SLP", PartnershipType.SLP, "cy", cyTranslationText, config.legalEntity]
    ])(
      "should load the update capital contribution yes no page with %s text",
      async (
        description: string,
        partnershipType: PartnershipType,
        lang: string,
        translationText: any,
        partnerConfig: Record<string, any>
      ) => {
        const companyProfile = new CompanyProfileBuilder().withSubtype(partnershipType).build();
        appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

        const res = await request(app).get(`${partnerConfig.url}?lang=${lang}`);

        expect(res.status).toBe(200);

        expect(res.text).toContain(
          `${limitedPartner.data?.forename?.toUpperCase()} ${limitedPartner.data?.surname?.toUpperCase()}`
        );

        testTranslations(res.text, translationText.partner.update.limitedPartnerCapitalContribution);
        expect(countOccurrences(res.text, toEscapedHtml(translationText.serviceName.updateLimitedPartnerPerson))).toBe(2);

        if (lang === "cy") {
          expect(res.text).toContain("WELSH - ");
        } else {
          expect(res.text).not.toContain("WELSH -");
        }

        expect(res.text).toContain(translationText.buttons.continue);

        expect(res.text).toContain(partnerConfig.backLink);
      }
    );

    it.each([
      ["PLP", PartnershipType.PFLP, config.person],
      ["SPFLP", PartnershipType.SPFLP, config.person],
      ["PLP", PartnershipType.PFLP, config.legalEntity],
      ["SPFLP", PartnershipType.SPFLP, config.legalEntity]
    ])(
      "should redirected to usual residential address if type is %s",
      async (description: string, partnershipType: PartnershipType, partnerConfig: Record<string, any>) => {
        const companyProfile = new CompanyProfileBuilder().withSubtype(partnershipType).build();
        appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

        const res = await request(app).get(partnerConfig.url);

        expect(res.status).toBe(302);
        expect(res.text).toContain(`Redirecting to ${partnerConfig.redirectNo}`);
      }
    );

    it.each([
      [true, config.person],
      [false, config.person],
      [true, config.legalEntity],
      [false, config.legalEntity]
    ])(
      "should load the update capital contribution yes no page with %s radio button checked",
      async (radioValue: boolean, partnerConfig: Record<string, any>) => {
        // @ts-expect-error - 'limitedPartner.data' is possibly 'undefined' ts(18048)
        limitedPartner.data.update_capital_contribution_required = radioValue;

        const res = await request(app).get(`${partnerConfig.url}`);

        expect(res.status).toBe(200);

        expect(res.text).toContain(`value="${radioValue}" checked`);
      }
    );
  });

  describe("POST Update Capital Contribution Yes No Page", () => {
    it.each([
      [
        'Capital contribution page when "yes"',
        PostTransitionPageType.updateLimitedPartnerPersonCapitalContributionYesNo,
        "true",
        config.person.url,
        config.person.redirectYes
      ],
      [
        'URA yes no page when "no"',
        PostTransitionPageType.updateLimitedPartnerPersonCapitalContributionYesNo,
        "false",
        config.person.url,
        config.person.redirectNo
      ],
      [
        'Capital contribution page when "yes"',
        PostTransitionPageType.updateLimitedPartnerLegalEntityCapitalContributionYesNo,
        "true",
        config.legalEntity.url,
        config.legalEntity.redirectYes
      ],
      [
        'POA yes no page when "no"',
        PostTransitionPageType.updateLimitedPartnerLegalEntityCapitalContributionYesNo,
        "false",
        config.legalEntity.url,
        config.legalEntity.redirectNo
      ]
    ])(
      "should redirect to %s is selected",
      async (description: string, pageType: PostTransitionPageType, pageValue: string, url: string, redirectUrl: string) => {
        const res = await request(app).post(`${url}`).send({
          pageType,
          update_capital_contribution_required: pageValue
        });

        expect(res.status).toBe(302);
        expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
      }
    );

    it.each([
      [config.person.url, PostTransitionPageType.updateLimitedPartnerPersonCapitalContributionYesNo],
      [config.legalEntity.url, PostTransitionPageType.updateLimitedPartnerLegalEntityCapitalContributionYesNo]
    ])("should return validation error when no option is selected", async (url: string, pageType: PostTransitionPageType) => {
      const res = await request(app).post(`${url}`).send({ pageType });

      expect(res.status).toBe(200);
      const errorMessage = enTranslationText.errorMessages.partners.updateCapitalContributionRequired;
      expect(countOccurrences(res.text, toEscapedHtml(errorMessage))).toBe(2);
    });
  });
});
