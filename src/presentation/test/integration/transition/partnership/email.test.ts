import { EMAIL_URL } from "../../../../controller/transition/url";
import TransitionPageType from "../../../../controller/transition/PageType";
import {
  POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  CONFIRM_REGISTERED_OFFICE_ADDRESS_URL
} from "../../../../controller/addressLookUp/url/transition";
import { JOURNEY_TYPE_PARAM, SERVICE_NAME_KEY_TRANSITION } from "../../../../../config/constants";
import { Journey } from "../../../../../domain/entities/journey";
import { getUrl } from "../../../utils";
import { runEmailTests } from "../../shared/emailTestSuite";

runEmailTests({
  emailUrl: getUrl(EMAIL_URL),
  pageType: TransitionPageType.email,
  defaultRedirectUrl: getUrl(POSTCODE_REGISTERED_OFFICE_ADDRESS_URL).replace(JOURNEY_TYPE_PARAM, Journey.transition),
  confirmAddressRedirectUrl: getUrl(CONFIRM_REGISTERED_OFFICE_ADDRESS_URL).replace(JOURNEY_TYPE_PARAM, Journey.transition),
  serviceTitleTranslationKey: SERVICE_NAME_KEY_TRANSITION,
  translateExclude: ["registration"],
  getPartnershipDisplay: (lp) => `${lp?.data?.partnership_name?.toUpperCase()} (${lp?.data?.partnership_number?.toUpperCase()})`
});
