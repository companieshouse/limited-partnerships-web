import {
  WHEN_DID_GENERAL_PARTNER_PERSON_DETAILS_CHANGE_URL,
  UPDATE_GENERAL_PARTNER_PERSON_CHECK_YOUR_ANSWERS_URL,
  UPDATE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_YES_NO_URL
} from "../../../../../presentation/controller/postTransition/url";
import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { getUrl } from "../../../utils";
import { runDateOfUpdateTests } from "../../shared/dateOfUpdateTestSuite";
import GeneralPartnerBuilder from "../../../builder/GeneralPartnerBuilder";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import TransactionGeneralPartner from "../../../../../domain/entities/TransactionGeneralPartner";

runDateOfUpdateTests({
  url: getUrl(WHEN_DID_GENERAL_PARTNER_PERSON_DETAILS_CHANGE_URL),
  backLinkUrl: getUrl(UPDATE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_YES_NO_URL),
  pageType: PostTransitionPageType.whenDidGeneralPartnerPersonDetailsChange,
  redirectUrl: getUrl(UPDATE_GENERAL_PARTNER_PERSON_CHECK_YOUR_ANSWERS_URL),
  translateExclude: ["registeredOfficeAddress", "principalPlaceOfBusinessAddress", "term", "partnershipName", "limitedPartner"],
  serviceNameTranslationKey: "updateGeneralPartnerPerson",
  kind: PartnerKind.UPDATE_GENERAL_PARTNER_PERSON,
  changeTypeKey: "generalPartnerPerson",
  getDisplayedName: (entity) => {
    const generalPartner = entity as TransactionGeneralPartner;
    return `${generalPartner?.data?.forename?.toUpperCase()} ${generalPartner?.data?.surname?.toUpperCase()}`;
  },
  additionalSetup: () => {
    const generalPartner = new GeneralPartnerBuilder()
      .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
      .isPerson()
      .withKind(PartnerKind.UPDATE_GENERAL_PARTNER_PERSON)
      .withAppointmentId("AP123456P")
      .withDateOfUpdate("2024-10-10")
      .build();

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

    return generalPartner;
  }
});
