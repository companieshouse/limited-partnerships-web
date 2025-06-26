import AddressPageType from "../../PageType";
import {
  ADD_LIMITED_PARTNER_PERSON_URL
} from "../../../transition/url";
import * as url from "../../url/transition";

enum AddressCacheKeys {
  addressCacheKey = "addressCacheKey",
  territoryCacheKey = "territoryCacheKey"
}

// usual residential address - Person

const limitedPartnerUsualResidentialAddressCacheKeys = {
  [AddressCacheKeys.addressCacheKey]: "usual_residential_address",
  [AddressCacheKeys.territoryCacheKey]: "ura_territory_choice"
};

const transitionAddressRoutingTerritoryChoiceLimitedPartnerUsualResidentialAddress = {
  previousUrl: ADD_LIMITED_PARTNER_PERSON_URL,
  currentUrl: url.TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.territoryChoiceLimitedPartnerUsualResidentialAddress,
  data: {
    ...limitedPartnerUsualResidentialAddressCacheKeys,
    nextUrlOverseas: url.ENTER_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
  }
};

const transitionAddressRoutingPostcodeLimitedPartnerUsualResidentialAddress = {
  previousUrl: url.TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.CHOOSE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.postcodeLimitedPartnerUsualResidentialAddress,
  data: {
    ...limitedPartnerUsualResidentialAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterLimitedPartnerUsualResidentialAddress,
    confirmAddressUrl: url.CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
  }
};

const transitionAddressRoutingChooseLimitedPartnerUsualResidentialAddress = {
  previousUrl: url.POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.CHOOSE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.chooseLimitedPartnerUsualResidentialAddress,
  data: {
    ...limitedPartnerUsualResidentialAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterLimitedPartnerUsualResidentialAddress
  }
};

const transitionAddressRoutingEnterLimitedPartnerUsualResidentialAddress = {
  previousUrl: url.POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.ENTER_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.enterLimitedPartnerUsualResidentialAddress,
  data: {
    ...limitedPartnerUsualResidentialAddressCacheKeys,
    territoryPageType: AddressPageType.territoryChoiceLimitedPartnerUsualResidentialAddress
  }
};

const transitionAddressRoutingConfirmLimitedPartnerUsualResidentialAddress = {
  previousUrl: url.POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: "/", // TODO change to review page when ready
  pageType: AddressPageType.confirmLimitedPartnerUsualResidentialAddress,
  data: {
    ...limitedPartnerUsualResidentialAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterLimitedPartnerUsualResidentialAddress
  }
};

const usualResidentialAddress = [
  transitionAddressRoutingTerritoryChoiceLimitedPartnerUsualResidentialAddress,
  transitionAddressRoutingPostcodeLimitedPartnerUsualResidentialAddress,
  transitionAddressRoutingChooseLimitedPartnerUsualResidentialAddress,
  transitionAddressRoutingEnterLimitedPartnerUsualResidentialAddress,
  transitionAddressRoutingConfirmLimitedPartnerUsualResidentialAddress
];

const limitedPartnerRouting = [...usualResidentialAddress];

export default limitedPartnerRouting;
