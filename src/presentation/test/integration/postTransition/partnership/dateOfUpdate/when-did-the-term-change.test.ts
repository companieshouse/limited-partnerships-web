import {
  TERM_CHANGE_CHECK_YOUR_ANSWERS_URL,
  TERM_WITH_IDS_URL,
  WHEN_DID_THE_TERM_CHANGE_URL
} from "../../../../../controller/postTransition/url";
import PostTransitionPageType from "../../../../../controller/postTransition/pageType";
import { PartnershipKind, LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { getUrl } from "../../../../utils";
import { runDateOfUpdateTests } from "../../../shared/dateOfUpdateTestSuite";

runDateOfUpdateTests({
  url: getUrl(WHEN_DID_THE_TERM_CHANGE_URL),
  backLinkUrl: getUrl(TERM_WITH_IDS_URL),
  pageType: PostTransitionPageType.whenDidTheTermChange,
  redirectUrl: getUrl(TERM_CHANGE_CHECK_YOUR_ANSWERS_URL),
  translateExclude: [
    "registeredOfficeAddress",
    "principalPlaceOfBusinessAddress",
    "partnershipName",
    "generalPartner",
    "limitedPartner"
  ],
  serviceNameTranslationKey: "updateLimitedPartnershipTerm",
  kind: PartnershipKind.UPDATE_PARTNERSHIP_TERM,
  dateFieldType: "term",
  getDisplayedName: (lp: LimitedPartnership) =>
    `${lp?.data?.partnership_name?.toUpperCase()} ${lp?.data?.name_ending?.toUpperCase()} (${lp?.data?.partnership_number})`
});
