import request from "supertest";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, toEscapedHtml } from "../../../utils";

import { enTranslationText } from "../../../../../test/utils/locales";
import * as enErrors from "../../../../../../locales/en/errors.json";
import * as cyErrors from "../../../../../../locales/cy/errors.json";

import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";

import PageType from "../../../../controller/PageType";

import PostTransitionPageType from "../../../../controller/postTransition/pageType";

import {
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_IDS_URL
} from "../../../../controller/postTransition/url";

import PostTransitionRouting from "../../../../controller/postTransition/routing";

import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";
import {
  CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
} from "../../../../controller/addressLookUp/url/postTransition";

import { runAddGeneralPartnerLegalEntityTests } from "../../shared/generalPartner/addGeneralPartnerLegalEntity";
import { POST_TRANSITION_WITH_ID_URL } from "../../../../../config/constants";

it("should run add general partner legal entity tests for post-transition journey", () => {
  expect(ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL).toContain("update");
});

const config = {
  url: ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  urlWithIds: ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_IDS_URL,
  pageType: {
    addGeneralPartnerLegalEntity: PostTransitionPageType.addGeneralPartnerLegalEntity,
    reviewGeneralPartners: "",
    generalPartnerType: PostTransitionPageType.generalPartnerType
  },
  pageRouting: PostTransitionRouting,
  redirectUrl: TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  confirmRedirectUrl: CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  baseUrlWithIds: POST_TRANSITION_WITH_ID_URL,
  translateExcludeAddOrUpdatePartnerLegalEntityPage: [
    "updateTitle",
    "limitedPartner",
    "errorMessages",
    "dateEffectiveFrom",
    "dateHint",
    "dateDay",
    "dateMonth",
    "dateYear"
  ],
  translateExcludeGeneralPartnersPage: [
    "title",
    "pageInformation",
    "disqualificationStatement",
    "disqualificationStatementLegend"
  ],
  serviceTitleTranslationKey: { serviceName: "addGeneralPartner" },
  partnerKind: PartnerKind.ADD_GENERAL_PARTNER_LEGAL_ENTITY
};

runAddGeneralPartnerLegalEntityTests(config);

describe("Post Add General Partner Legal Entity - validation", () => {
  beforeEach(() => {
    setLocalesEnabled(true);

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
    appDevDependencies.transactionGateway.feedTransactions([]);

    const limitedPartnership = new LimitedPartnershipBuilder().build();
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

    const companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);
  });

  it.each([
    ["English", "en", enErrors],
    ["Welsh", "cy", cyErrors]
  ])("should require confirmation that the general partner is not disqualified in %s", async (_language, language, errors) => {
    const res = await request(app).post(`${getUrl(config.url)}?lang=${language}`).send({
      ...config.pageRouting.get(config.pageType.addGeneralPartnerLegalEntity as PageType),
      legal_entity_name: "My Company ltd - GP",
      legal_form: "Limited Company",
      governing_law: "Act of law",
      legal_entity_register_name: "US Register",
      legal_entity_registration_location: "United States",
      registered_company_number: "12345678",
      "date_effective_from-day": "22",
      "date_effective_from-month": "10",
      "date_effective_from-year": "2024"
    });

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      toEscapedHtml(errors.errorMessages.partners.addPartner.disqualificationStatementMissingGeneralPartner)
    );
  });

  it("should return a validation error when date effective from is invalid", async () => {
    const res = await request(app)
      .post(getUrl(config.url))
      .send({
        ...config.pageRouting.get(config.pageType.addGeneralPartnerLegalEntity as PageType),
        "date_effective_from-day": "222",
        "date_effective_from-month": "10",
        "date_effective_from-year": "2024"
      });

    expect(res.status).toBe(200);
    expect(res.text).toContain(enTranslationText.errorMessages.dateEffectiveFrom.dayInvalidLength);
  });

  it("should return a validation error when date effective from is before registration date", async () => {
    const res = await request(app)
      .post(getUrl(config.url))
      .send({
        ...config.pageRouting.get(config.pageType.addGeneralPartnerLegalEntity as PageType),
        "date_effective_from-day": "22",
        "date_effective_from-month": "10",
        "date_effective_from-year": "2011"
      });

    expect(res.status).toBe(200);
    expect(res.text).toContain(toEscapedHtml(enTranslationText.errorMessages.dateEffectiveFrom.beforeRegistrationDate));
  });
});
