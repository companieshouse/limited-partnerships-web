import request from "supertest";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, toEscapedHtml } from "../../../utils";

import { enTranslationText } from "../../../../../test/utils/locales";

import GeneralPartnerBuilder from "../../../builder/GeneralPartnerBuilder";

import PageType from "../../../../controller/PageType";

import {
  ADD_GENERAL_PARTNER_PERSON_URL,
  ADD_GENERAL_PARTNER_PERSON_WITH_IDS_URL
} from "../../../../controller/postTransition/url";

import {
  TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "../../../../../presentation/controller/addressLookUp/url/postTransition";

import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import PostTransitionRouting from "../../../../controller/postTransition/routing";

import { POST_TRANSITION_WITH_ID_URL } from "../../../../../config/constants";

import { runAddGeneralPartnerPersonTests } from "../../shared/generalPartner/addGeneralPartnerPerson";

it("should run add general partner person tests for post-transition journey", () => {
  expect(ADD_GENERAL_PARTNER_PERSON_URL).toContain("update");
});

const config = {
  url: ADD_GENERAL_PARTNER_PERSON_URL,
  urlWithIds: ADD_GENERAL_PARTNER_PERSON_WITH_IDS_URL,
  pageType: {
    addGeneralPartnerPerson: PostTransitionPageType.addGeneralPartnerPerson,
    reviewGeneralPartners: "",
    generalPartnerType: PostTransitionPageType.generalPartnerType
  },
  pageRouting: PostTransitionRouting,
  redirectUrl: TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  confirmRedirectUrl: CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  baseUrlWithIds: POST_TRANSITION_WITH_ID_URL,
  translateExcludeAddOrUpdatePartnerPersonPage: ["limitedPartner", "errorMessages"],
  translateExcludeGeneralPartnersPage: [
    "title",
    "pageInformation",
    "disqualificationStatement",
    "disqualificationStatementLegend"
  ],
  serviceTitleTranslationKey: { serviceName: "addGeneralPartner" },
  partnerKind: PartnerKind.ADD_GENERAL_PARTNER_PERSON
};

runAddGeneralPartnerPersonTests(config);

it("should return a validation error when date effective from is %s", async () => {
  const res = await request(app)
    .post(getUrl(config.url))
    .send({
      ...config.pageRouting.get(config.pageType.addGeneralPartnerPerson as PageType),
      "date_effective_from-day": "222",
      "date_effective_from-month": "10",
      "date_effective_from-year": "2024"
    });

  expect(res.status).toBe(200);
  expect(res.text).toContain(enTranslationText.errorMessages.dateEffectiveFrom.dayInvalidLength);
});

it.each([
  ["without ids", false, getUrl(config.url)],
  ["with ids", true, getUrl(config.urlWithIds)]
])(
  "should return a validation error when date effective from is before registration date when %s",
  async (_description, withIds, URL) => {
    if (withIds) {
      const generalPartner = new GeneralPartnerBuilder()
        .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
        .isPerson()
        .withKind(config.partnerKind ?? "")
        .build();

      appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);
    }

    const res = await request(app)
      .post(URL)
      .send({
        ...config.pageRouting.get(config.pageType.addGeneralPartnerPerson as PageType),
        "date_effective_from-day": "22",
        "date_effective_from-month": "10",
        "date_effective_from-year": "2011"
      });

    expect(res.status).toBe(200);
    expect(res.text).toContain(toEscapedHtml(enTranslationText.errorMessages.dateEffectiveFrom.beforeRegistrationDate));
  }
);
