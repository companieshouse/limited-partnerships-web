import {
  WHEN_DID_LIMITED_PARTNER_PERSON_DETAILS_CHANGE_URL,
  UPDATE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL,
  UPDATE_LIMITED_PARTNER_PERSON_CHECK_YOUR_ANSWERS_URL
} from "../../../../../presentation/controller/postTransition/url";
import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { getUrl } from "../../../utils";
import { runDateOfUpdateTests } from "../../shared/dateOfUpdateTestSuite";
import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import TransactionLimitedPartner from "../../../../../domain/entities/TransactionLimitedPartner";

runDateOfUpdateTests({
  url: getUrl(WHEN_DID_LIMITED_PARTNER_PERSON_DETAILS_CHANGE_URL),
  backLinkUrl: getUrl(UPDATE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_YES_NO_URL),
  pageType: PostTransitionPageType.whenDidLimitedPartnerPersonDetailsChange,
  redirectUrl: getUrl(UPDATE_LIMITED_PARTNER_PERSON_CHECK_YOUR_ANSWERS_URL),
  translateExclude: ["registeredOfficeAddress", "principalPlaceOfBusinessAddress", "term", "partnershipName", "limitedPartner"],
  serviceNameTranslationKey: "updateLimitedPartnerPerson",
  kind: PartnerKind.UPDATE_LIMITED_PARTNER_PERSON,
  changeTypeKey: "limitedPartnerPerson",
  getDisplayedName: (entity) => {
    const limitedPartner = entity as TransactionLimitedPartner;
    return `${limitedPartner?.data?.forename?.toUpperCase()} ${limitedPartner?.data?.surname?.toUpperCase()}`;
  },
  additionalSetup: () => {
    const limitedPartner = new LimitedPartnerBuilder()
      .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
      .isPerson()
      .withKind(PartnerKind.UPDATE_LIMITED_PARTNER_PERSON)
      .withAppointmentId("AP123456P")
      .withDateOfUpdate("2024-10-10")
      .build();

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

    return limitedPartner;
  }
});
