import { TERM_CHANGE_CHECK_YOUR_ANSWERS_URL, WHEN_DID_THE_TERM_CHANGE_URL } from "../../../../../controller/postTransition/url";
import PostTransitionPageType from "../../../../../controller/postTransition/pageType";
import { PartnershipKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { getUrl } from "../../../../utils";
import { runDateOfUpdateTests } from "../../../shared/dateOfUpdateTestSuite";

runDateOfUpdateTests({
  url: getUrl(WHEN_DID_THE_TERM_CHANGE_URL),
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
  partnershipKind: PartnershipKind.UPDATE_PARTNERSHIP_TERM,
  dateFieldType: "term",
  getPartnershipDisplay: (lp) =>
    `${lp?.data?.partnership_name?.toUpperCase()} ${lp?.data?.name_ending?.toUpperCase()} (${lp?.data?.partnership_number})`
});
