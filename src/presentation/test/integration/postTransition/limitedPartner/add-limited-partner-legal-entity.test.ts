import request from "supertest";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, toEscapedHtml } from "../../../utils";

import {
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_IDS_URL,
  LIMITED_PARTNER_CHOICE_URL
} from "../../../../controller/postTransition/url";

import {
  CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
} from "../../../../controller/addressLookUp/url/postTransition";

import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";

import { enTranslationText } from "../../../../../test/utils/locales";

import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import PostTransitionRouting from "../../../../controller/postTransition/routing";

import { POST_TRANSITION_WITH_ID_URL } from "../../../../../config/constants";

import { runAddLimitedPartnerLegalEntityTests } from "../../shared/limitedPartner/addLimitedPartnerLegalEntity";

it("should run add limited partner legal entity tests for post-transition journey", () => {
  expect(ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL).toContain("update");
});

const config = {
  url: ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  urlWithIds: ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_IDS_URL,
  pageType: {
    addLimitedPartnerLegalEntity: PostTransitionPageType.addLimitedPartnerLegalEntity,
    reviewLimitedPartners: "",
    limitedPartnerType: PostTransitionPageType.limitedPartnerType
  },
  pageRouting: PostTransitionRouting,
  redirectUrl: TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  confirmRedirectUrl: CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  baseUrlWithIds: POST_TRANSITION_WITH_ID_URL,
  translateExclude: ["errorMessages", "generalPartner", "updateTitle", "dateEffectiveFrom", "capitalContribution"],
  serviceTitleTranslationKey: { serviceName: "addLimitedPartner" },
  partnerKind: PartnerKind.ADD_LIMITED_PARTNER_LEGAL_ENTITY
};

runAddLimitedPartnerLegalEntityTests(config);

describe("Post Add Limited Partner Legal Entity", () => {
  let companyProfile: {
    _id: string;
    data: Partial<CompanyProfile>;
  };

  const limitedPartner = new LimitedPartnerBuilder()
    .isLegalEntity()
    .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
    .withAppointmentId(appDevDependencies.limitedPartnerGateway.limitedPartnerAppointmentId)
    .withKind(config.partnerKind ?? "")
    .build();

  const datesBody = { "date_effective_from-day": "01", "date_effective_from-month": "11", "date_effective_from-year": "2024" };

  beforeEach(() => {
    setLocalesEnabled(true);
    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

    appDevDependencies.transactionGateway.feedTransactions([]);
  });

  it("should contain a back link to the choice page when limited partners are not present", async () => {
    const res = await request(app).get(getUrl(config.urlWithIds));

    expect(res.status).toBe(200);

    expect(res.text).toContain(getUrl(LIMITED_PARTNER_CHOICE_URL));
  });

  it("should send the limited partner legal entity details", async () => {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, "0");
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const year = today.getFullYear().toString();

    const res = await request(app)
      .post(getUrl(config.url))
      .send({
        ...PostTransitionRouting.get(PostTransitionPageType.addLimitedPartnerLegalEntity),
        ...limitedPartner.data,
        "date_effective_from-day": day,
        "date_effective_from-month": month,
        "date_effective_from-year": year
      });

    expect(res.status).toBe(302);
    expect(res.text).toContain(`Redirecting to ${getUrl(config.redirectUrl)}`);

    expect(appDevDependencies.transactionGateway.transactions).toHaveLength(1);
    expect(appDevDependencies.transactionGateway.transactions[0].description).toBe("Add a limited partner (legal entity)");

    expect(appDevDependencies.limitedPartnerGateway.limitedPartners).toHaveLength(2);
    expect(appDevDependencies.limitedPartnerGateway.limitedPartners[0].data?.kind).toEqual(
      PartnerKind.ADD_LIMITED_PARTNER_LEGAL_ENTITY
    );
  });

  it("should return a validation error when date effective from is before registration date", async () => {
    const res = await request(app)
      .post(getUrl(config.url))
      .send({
        ...PostTransitionRouting.get(PostTransitionPageType.addLimitedPartnerLegalEntity),
        ...limitedPartner.data,
        ...datesBody,
        "date_effective_from-year": "2011"
      });

    expect(res.status).toBe(200);
    expect(res.text).toContain(toEscapedHtml(enTranslationText.errorMessages.dateEffectiveFrom.beforeRegistrationDate));
  });

  it("should send the limited partner details and go to confirm principal office address page if already saved", async () => {
    const res = await request(app)
      .post(getUrl(config.urlWithIds))
      .send({
        pageType: PostTransitionPageType.addLimitedPartnerLegalEntity,
        ...limitedPartner.data,
        ...datesBody
      });

    expect(res.status).toBe(302);

    expect(res.text).toContain(`Redirecting to ${getUrl(config.confirmRedirectUrl)}`);
  });
});
