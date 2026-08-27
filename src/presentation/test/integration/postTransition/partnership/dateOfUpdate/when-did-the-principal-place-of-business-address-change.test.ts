import {
  WHEN_DID_THE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_CHANGE_URL,
  PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_CHANGE_CHECK_YOUR_ANSWERS_URL,
  ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_WITH_IDS_URL
} from "../../../../../controller/postTransition/url";
import PostTransitionPageType from "../../../../../controller/postTransition/pageType";
import { PartnershipKind, LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { getUrl } from "../../../../utils";
import { runDateOfUpdateTests } from "../../../shared/dateOfUpdateTestSuite";

runDateOfUpdateTests({
  url: getUrl(WHEN_DID_THE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_CHANGE_URL),
  backLinkUrl: getUrl(ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_WITH_IDS_URL),
  pageType: PostTransitionPageType.whenDidThePrincipalPlaceOfBusinessAddressChange,
  redirectUrl: getUrl(PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_CHANGE_CHECK_YOUR_ANSWERS_URL),
  translateExclude: ["registeredOfficeAddress", "term", "partnershipName", "generalPartner", "limitedPartner"],
  serviceNameTranslationKey: "updateLimitedPartnershipPrincipalPlaceOfBusinessAddress",
  kind: PartnershipKind.UPDATE_PARTNERSHIP_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS,
  dateFieldType: "principal place of business address",
  getDisplayedName: (lp: LimitedPartnership) =>
    `${lp?.data?.partnership_name?.toUpperCase()} ${lp?.data?.name_ending?.toUpperCase()} (${lp?.data?.partnership_number})`
});
