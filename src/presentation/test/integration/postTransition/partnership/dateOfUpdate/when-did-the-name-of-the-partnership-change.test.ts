import {
  WHEN_DID_THE_PARTNERSHIP_NAME_CHANGE_URL,
  PARTNERSHIP_NAME_CHANGE_CHECK_YOUR_ANSWERS_URL,
  PARTNERSHIP_NAME_WITH_IDS_URL
} from "../../../../../controller/postTransition/url";
import PostTransitionPageType from "../../../../../controller/postTransition/pageType";
import { PartnershipKind, LimitedPartnership } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { getUrl } from "../../../../utils";
import { runDateOfUpdateTests } from "../../../shared/dateOfUpdateTestSuite";

runDateOfUpdateTests({
  url: getUrl(WHEN_DID_THE_PARTNERSHIP_NAME_CHANGE_URL),
  backLinkUrl: getUrl(PARTNERSHIP_NAME_WITH_IDS_URL),
  pageType: PostTransitionPageType.whenDidThePartnershipNameChange,
  redirectUrl: getUrl(PARTNERSHIP_NAME_CHANGE_CHECK_YOUR_ANSWERS_URL),
  translateExclude: ["registeredOfficeAddress", "principalPlaceOfBusinessAddress", "term", "generalPartner", "limitedPartner"],
  serviceNameTranslationKey: "updateLimitedPartnershipName",
  kind: PartnershipKind.UPDATE_PARTNERSHIP_NAME,
  dateFieldType: "name of the partnership",
  getDisplayedName: (lp: LimitedPartnership) =>
    `${lp?.data?.partnership_name?.toUpperCase()} ${lp?.data?.name_ending?.toUpperCase()} (${lp?.data?.partnership_number})`
});
