import { EMAIL_URL } from "../../../transition/url";
import AddressPageType from "../../PageType";
import * as url from "../../url/transition";

enum AddressCacheKeys {
  addressCacheKey = "addressCacheKey",
  territoryCacheKey = "territoryCacheKey"
}

// Registered Office Address

const registeredOfficeAddressCacheKeys = {
  [AddressCacheKeys.addressCacheKey]: "registered_office_address"
};

const transitionAddressRoutingPostcodeRegisteredOfficeAddress = {
  previousUrl: EMAIL_URL,
  currentUrl: url.POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  nextUrl: url.CHOOSE_REGISTERED_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.postcodeRegisteredOfficeAddress,
  data: {
    ...registeredOfficeAddressCacheKeys,
    confirmAddressUrl: url.CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
    enterManualAddressPageType: AddressPageType.enterRegisteredOfficeAddress
  }
};

const transitionAddressRoutingChooseRegisteredOfficeAddress = {
  previousUrl: url.POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  currentUrl: url.CHOOSE_REGISTERED_OFFICE_ADDRESS_URL,
  nextUrl: url.CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.chooseRegisteredOfficeAddress,
  data: {
    ...registeredOfficeAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterRegisteredOfficeAddress
  }
};

const transitionAddressRoutingEnterRegisteredOfficeAddress = {
  previousUrl: url.POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  currentUrl: url.ENTER_REGISTERED_OFFICE_ADDRESS_URL,
  nextUrl: url.CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.enterRegisteredOfficeAddress,
  data: {
    ...registeredOfficeAddressCacheKeys
  }
};

const transitionAddressRoutingConfirmRegisteredOfficeAddress = {
  previousUrl: url.POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  currentUrl: url.CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  nextUrl: "/", // TODO update to the next URL in the flow
  pageType: AddressPageType.confirmRegisteredOfficeAddress,
  data: {
    ...registeredOfficeAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterRegisteredOfficeAddress
  }
};

const registeredOfficeAddress = [
  transitionAddressRoutingPostcodeRegisteredOfficeAddress,
  transitionAddressRoutingChooseRegisteredOfficeAddress,
  transitionAddressRoutingEnterRegisteredOfficeAddress,
  transitionAddressRoutingConfirmRegisteredOfficeAddress
];

const limitedPartnershipRouting = [...registeredOfficeAddress];

export default limitedPartnershipRouting;
