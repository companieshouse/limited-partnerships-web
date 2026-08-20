import {
  REGISTERED_OFFICE_ADDRESS_CHANGE_CHECK_YOUR_ANSWERS_URL,
  WHEN_DID_THE_REGISTERED_OFFICE_ADDRESS_CHANGE_URL
} from "../../../../../controller/postTransition/url";
import PostTransitionPageType from "../../../../../controller/postTransition/pageType";
import { PartnershipKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { getUrl } from "../../../../utils";
import { runDateOfUpdateTests } from "../../../shared/dateOfUpdateTestSuite";

runDateOfUpdateTests({
  url: getUrl(WHEN_DID_THE_REGISTERED_OFFICE_ADDRESS_CHANGE_URL),
  pageType: PostTransitionPageType.whenDidTheRegisteredOfficeAddressChange,
  redirectUrl: getUrl(REGISTERED_OFFICE_ADDRESS_CHANGE_CHECK_YOUR_ANSWERS_URL),
  translateExclude: ["principalPlaceOfBusinessAddress", "term", "partnershipName", "generalPartner", "limitedPartner"],
  serviceNameTranslationKey: "updateLimitedPartnershipRegisteredOfficeAddress",
  partnershipKind: PartnershipKind.UPDATE_PARTNERSHIP_REGISTERED_OFFICE_ADDRESS,
  dateFieldType: "registeredOfficeAddress",
  getPartnershipDisplay: (lp) =>
    `${lp?.data?.partnership_name?.toUpperCase()} ${lp?.data?.name_ending?.toUpperCase()} (${lp?.data?.partnership_number})`
});
