import request from "supertest";
import { Jurisdiction } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl } from "../../../utils";

import {
  ENTER_REGISTERED_OFFICE_ADDRESS_URL,
  ENTER_REGISTERED_OFFICE_ADDRESS_WITH_IDS_URL,
  WHEN_DID_THE_REGISTERED_OFFICE_ADDRESS_CHANGE_URL
} from "../../../../controller/postTransition/url";

import { enTranslationText } from "../../../../../test/utils/locales";

import LimitedPartnershipBuilder from "../../../builder/LimitedPartnershipBuilder";
import PostTransitionPageType from "../../../../controller/postTransition/pageType";

import { runEnterRegisteredOfficeAddressTests } from "../../shared/partnership/address/enterRegisteredOfficeAddress";

it("should run enter registered office address tests for post-transition journey", () => {
  expect(ENTER_REGISTERED_OFFICE_ADDRESS_URL).toContain("update");
});

runEnterRegisteredOfficeAddressTests({
  url: ENTER_REGISTERED_OFFICE_ADDRESS_URL,
  redirectUrl: WHEN_DID_THE_REGISTERED_OFFICE_ADDRESS_CHANGE_URL,
  translateExclude: [
    "jurisdictionCountry",
    "usualResidentialAddress",
    "correspondenceAddress",
    "principalPlaceOfBusinessAddress",
    "principalOfficeAddress",
    "errorMessages"
  ],
  translateRegisteredOfficeAddressExclude: ["newRequirement", "provideNext"],
  serviceTitleTranslationKey: { serviceName: "updateLimitedPartnershipRegisteredOfficeAddress" }
});

describe("Enter Registered Office Address Page", () => {
  describe("POST Enter Registered Office Address Page", () => {
    it.each([[getUrl(ENTER_REGISTERED_OFFICE_ADDRESS_URL)], [getUrl(ENTER_REGISTERED_OFFICE_ADDRESS_WITH_IDS_URL)]])(
      "should redirect to the When did the ROA change page",
      async (url: string) => {
        const limitedPartnership = new LimitedPartnershipBuilder().withJurisdiction(Jurisdiction.ENGLAND_AND_WALES).build();

        appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([limitedPartnership]);

        const res = await request(app)
          .post(url)
          .send({
            pageType: PostTransitionPageType.enterRegisteredOfficeAddress,
            ...limitedPartnership.data?.registered_office_address
          });

        const redirectUrl = getUrl(WHEN_DID_THE_REGISTERED_OFFICE_ADDRESS_CHANGE_URL);
        expect(res.status).toBe(302);
        expect(res.text).toContain(`Redirecting to ${redirectUrl}`);
        expect(appDevDependencies.transactionGateway.transactions[0].description).toEqual(
          enTranslationText.serviceName.updateLimitedPartnershipRegisteredOfficeAddress
        );
      }
    );
  });
});
