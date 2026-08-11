import { EMAIL_URL, WHERE_IS_THE_JURISDICTION_URL } from "../../../controller/registration/url";
import RegistrationPageType from "../../../controller/registration/PageType";
import { CONFIRM_REGISTERED_OFFICE_ADDRESS_URL } from "../../../controller/addressLookUp/url/registration";
import { getUrl } from "../../utils";
import { runEmailTests } from "../shared/emailTestSuite";

runEmailTests({
  emailUrl: getUrl(EMAIL_URL),
  pageType: RegistrationPageType.email,
  defaultRedirectUrl: getUrl(WHERE_IS_THE_JURISDICTION_URL),
  confirmAddressRedirectUrl: getUrl(CONFIRM_REGISTERED_OFFICE_ADDRESS_URL),
  serviceTitleTranslationKey: "serviceRegistration",
  translateExclude: ["transition"],
  getPartnershipDisplay: (lp) =>
    `${lp?.data?.partnership_name?.toUpperCase()} ${lp?.data?.name_ending?.toUpperCase()}`
});
