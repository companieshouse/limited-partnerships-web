import { PageRouting, PagesRouting } from "../PageRouting";

import AddressPageType from "./PageType";
import PageType from "../PageType";
import {
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  ADD_GENERAL_PARTNER_PERSON_URL,
  ADD_LIMITED_PARTNER_PERSON_URL,
  REVIEW_GENERAL_PARTNERS_URL,
  TERM_URL,
  WHERE_IS_THE_JURISDICTION_URL,
  CHECK_YOUR_ANSWERS_URL
} from "../registration/url";
import * as url from "./url";

export enum AddressCacheKeys {
  addressCacheKey = "addressCacheKey",
  territoryCacheKey = "territoryCacheKey"
}

// Registered Office Address

const registeredOfficeAddressCacheKeys = {
  [AddressCacheKeys.addressCacheKey]: "registered_office_address"
};

const addressRoutingPostcodeRegisteredOfficeAddress = {
  previousUrl: WHERE_IS_THE_JURISDICTION_URL,
  currentUrl: url.POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  nextUrl: url.CHOOSE_REGISTERED_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.postcodeRegisteredOfficeAddress,
  data: {
    ...registeredOfficeAddressCacheKeys,
    confirmAddressUrl: url.CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
    enterManualAddressPageType: AddressPageType.enterRegisteredOfficeAddress
  }
};

const addressRoutingChooseRegisteredOfficeAddress = {
  previousUrl: url.POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  currentUrl: url.CHOOSE_REGISTERED_OFFICE_ADDRESS_URL,
  nextUrl: url.CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.chooseRegisteredOfficeAddress,
  data: {
    ...registeredOfficeAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterRegisteredOfficeAddress
  }
};

const addressRoutingEnterRegisteredOfficeAddress = {
  previousUrl: url.POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  currentUrl: url.ENTER_REGISTERED_OFFICE_ADDRESS_URL,
  nextUrl: url.CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.enterRegisteredOfficeAddress,
  data: {
    ...registeredOfficeAddressCacheKeys
  }
};

const addressRoutingConfirmRegisteredOfficeAddress = {
  previousUrl: url.POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  currentUrl: url.CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  nextUrl: url.POSTCODE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  pageType: AddressPageType.confirmRegisteredOfficeAddress,
  data: {
    ...registeredOfficeAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterRegisteredOfficeAddress
  }
};

const registeredOfficeAddress = [
  addressRoutingPostcodeRegisteredOfficeAddress,
  addressRoutingChooseRegisteredOfficeAddress,
  addressRoutingEnterRegisteredOfficeAddress,
  addressRoutingConfirmRegisteredOfficeAddress
];

// principal place of business

const principalPlaceOfBusinessAddressCacheKeys = {
  [AddressCacheKeys.addressCacheKey]: "principal_place_of_business_address"
};

const addressRoutingPostcodePrincipalPlaceOfBusinessAddress = {
  previousUrl: url.CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  currentUrl: url.POSTCODE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  nextUrl: url.CHOOSE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  pageType: AddressPageType.postcodePrincipalPlaceOfBusinessAddress,
  data: {
    ...principalPlaceOfBusinessAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterPrincipalPlaceOfBusinessAddress,
    confirmAddressUrl: url.CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL
  }
};

const addressRoutingChoosePrincipalPlaceOfBusinessAddress = {
  previousUrl: url.POSTCODE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  currentUrl: url.CHOOSE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  nextUrl: url.CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  pageType: AddressPageType.choosePrincipalPlaceOfBusinessAddress,
  data: {
    ...principalPlaceOfBusinessAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterPrincipalPlaceOfBusinessAddress
  }
};

const addressRoutingEnterPrincipalPlaceOfBusinessAddress = {
  previousUrl: url.POSTCODE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  currentUrl: url.ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  nextUrl: url.CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  pageType: AddressPageType.enterPrincipalPlaceOfBusinessAddress,
  data: {
    [AddressCacheKeys.addressCacheKey]: "principal_place_of_business_address"
  }
};

const addressRoutingConfirmPrincipalPlaceOfBusinessAddress = {
  previousUrl: url.POSTCODE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  currentUrl: url.CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  nextUrl: TERM_URL,
  pageType: AddressPageType.confirmPrincipalPlaceOfBusinessAddress,
  data: {
    ...principalPlaceOfBusinessAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterPrincipalPlaceOfBusinessAddress
  }
};

const principalPlaceOfBusinessAddress = [
  addressRoutingPostcodePrincipalPlaceOfBusinessAddress,
  addressRoutingChoosePrincipalPlaceOfBusinessAddress,
  addressRoutingEnterPrincipalPlaceOfBusinessAddress,
  addressRoutingConfirmPrincipalPlaceOfBusinessAddress
];

// GENERAL PARTNER

// usual residential address - Person

const usualResidentialAddressCacheKeys = {
  [AddressCacheKeys.addressCacheKey]: "usual_residential_address",
  [AddressCacheKeys.territoryCacheKey]: "ura_territory_choice"
};

const addressRoutingTerritoryChoiceGeneralPartnerUsualResidentialAddress = {
  previousUrl: ADD_GENERAL_PARTNER_PERSON_URL,
  currentUrl: url.TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.territoryChoiceGeneralPartnerUsualResidentialAddress,
  data: {
    ...usualResidentialAddressCacheKeys,
    nextUrlOverseas: url.ENTER_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
  }
};

const addressRoutingPostcodeGeneralPartnerUsualResidentialAddress = {
  previousUrl: url.TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.CHOOSE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.postcodeGeneralPartnerUsualResidentialAddress,
  data: {
    ...usualResidentialAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterGeneralPartnerUsualResidentialAddress,
    confirmAddressUrl: url.CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
  }
};

const addressRoutingEnterGeneralPartnerUsualResidentialAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.ENTER_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.enterGeneralPartnerUsualResidentialAddress,
  data: {
    ...usualResidentialAddressCacheKeys,
    territoryPageType: AddressPageType.territoryChoiceGeneralPartnerUsualResidentialAddress
  }
};

const addressRoutingChooseGeneralPartnerUsualResidentialAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.CHOOSE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.chooseGeneralPartnerUsualResidentialAddress,
  data: {
    ...usualResidentialAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterGeneralPartnerUsualResidentialAddress
  }
};

const addressRoutingConfirmGeneralPartnerUsualResidentialAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.TERRITORY_CHOICE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  pageType: AddressPageType.confirmGeneralPartnerUsualResidentialAddress,
  data: {
    ...usualResidentialAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterGeneralPartnerUsualResidentialAddress
  }
};

const generalPartnerUsualResidentialAddress = [
  addressRoutingTerritoryChoiceGeneralPartnerUsualResidentialAddress,
  addressRoutingPostcodeGeneralPartnerUsualResidentialAddress,
  addressRoutingEnterGeneralPartnerUsualResidentialAddress,
  addressRoutingChooseGeneralPartnerUsualResidentialAddress,
  addressRoutingConfirmGeneralPartnerUsualResidentialAddress
];

// correspondence address - Person

const correspondenceAddressCacheKeys = {
  [AddressCacheKeys.addressCacheKey]: "service_address",
  [AddressCacheKeys.territoryCacheKey]: "sa_territory_choice"
};

const addressRoutingTerritoryChoiceGeneralPartnerCorrespondanceAddress = {
  previousUrl: url.CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.TERRITORY_CHOICE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  nextUrl: url.POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  pageType: AddressPageType.territoryChoiceGeneralPartnerCorrespondenceAddress,
  data: {
    ...correspondenceAddressCacheKeys,
    nextUrlOverseas: url.ENTER_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL
  }
};

const addressRoutingPostcodeGeneralPartnerCorrespondenceAddress = {
  previousUrl: url.TERRITORY_CHOICE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  currentUrl: url.POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  nextUrl: url.CHOOSE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  pageType: AddressPageType.postcodeGeneralPartnerCorrespondenceAddress,
  data: {
    ...correspondenceAddressCacheKeys,
    confirmAddressUrl: url.CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
    enterManualAddressPageType: AddressPageType.enterGeneralPartnerCorrespondenceAddress
  }
};

const addressRoutingChooseGeneralPartnerCorrespondenceAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  currentUrl: url.CHOOSE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  nextUrl: url.CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  pageType: AddressPageType.chooseGeneralPartnerCorrespondenceAddress,
  data: {
    ...correspondenceAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterGeneralPartnerCorrespondenceAddress
  }
};

const addressRoutingEnterGeneralPartnerCorrespondenceAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  currentUrl: url.ENTER_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  nextUrl: url.CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  pageType: AddressPageType.enterGeneralPartnerCorrespondenceAddress,
  data: {
    ...correspondenceAddressCacheKeys,
    territoryPageType: AddressPageType.territoryChoiceGeneralPartnerCorrespondenceAddress
  }
};

const addressRoutingConfirmGeneralPartnerCorrespondenceAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  currentUrl: url.CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  nextUrl: REVIEW_GENERAL_PARTNERS_URL,
  pageType: AddressPageType.confirmGeneralPartnerCorrespondenceAddress,
  data: {
    ...correspondenceAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterGeneralPartnerCorrespondenceAddress
  }
};

const correspondenceAddress = [
  addressRoutingTerritoryChoiceGeneralPartnerCorrespondanceAddress,
  addressRoutingPostcodeGeneralPartnerCorrespondenceAddress,
  addressRoutingChooseGeneralPartnerCorrespondenceAddress,
  addressRoutingEnterGeneralPartnerCorrespondenceAddress,
  addressRoutingConfirmGeneralPartnerCorrespondenceAddress
];

// principal office address - legal entity

const principalOfficeAddressCacheKeys = {
  [AddressCacheKeys.addressCacheKey]: "principal_office_address",
  [AddressCacheKeys.territoryCacheKey]: "poa_territory_choice"
};

const addressRoutingTerritoryChoiceGeneralPartnerPrincipalOfficeAddress = {
  previousUrl: ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  currentUrl: url.TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: url.POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.territoryChoiceGeneralPartnerPrincipalOfficeAddress,
  data: {
    ...principalOfficeAddressCacheKeys,
    nextUrlOverseas: url.ENTER_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
  }
};

const addressRoutingPostcodeGeneralPartnerPrincipalOfficeAddress = {
  previousUrl: url.TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  currentUrl: url.POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: url.CHOOSE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.postcodeGeneralPartnerPrincipalOfficeAddress,
  data: {
    ...principalOfficeAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterGeneralPartnerPrincipalOfficeAddress,
    confirmAddressUrl: url.CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
  }
};

const addressRoutingChooseGeneralPartnerPrincipalOfficeAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  currentUrl: url.CHOOSE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: url.CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.chooseGeneralPartnerPrincipalOfficeAddress,
  data: {
    ...principalOfficeAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterGeneralPartnerPrincipalOfficeAddress
  }
};

const addressRoutingEnterGeneralPartnerPrincipalOfficeAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  currentUrl: url.ENTER_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: url.CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.enterGeneralPartnerPrincipalOfficeAddress,
  data: {
    ...principalOfficeAddressCacheKeys,
    territoryPageType: AddressPageType.territoryChoiceGeneralPartnerPrincipalOfficeAddress
  }
};

const addressRoutingConfirmGeneralPartnerPrincipalOfficeAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  currentUrl: url.CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: REVIEW_GENERAL_PARTNERS_URL,
  pageType: AddressPageType.confirmGeneralPartnerPrincipalOfficeAddress,
  data: {
    ...principalOfficeAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterGeneralPartnerPrincipalOfficeAddress
  }
};

const generalPartnerPrincipalOfficeAddress = [
  addressRoutingTerritoryChoiceGeneralPartnerPrincipalOfficeAddress,
  addressRoutingPostcodeGeneralPartnerPrincipalOfficeAddress,
  addressRoutingEnterGeneralPartnerPrincipalOfficeAddress,
  addressRoutingChooseGeneralPartnerPrincipalOfficeAddress,
  addressRoutingConfirmGeneralPartnerPrincipalOfficeAddress
];

// LIMITED PARTNER

// usual residential address - Person

const limitedPartnerUsualResidentialAddressCacheKeys = {
  [AddressCacheKeys.addressCacheKey]: "usual_residential_address_limited_partner",
  [AddressCacheKeys.territoryCacheKey]: "ura_territory_choice_limited_partner"
};

const addressRoutingTerritoryChoiceLimitedPartnerUsualResidentialAddress = {
  previousUrl: ADD_LIMITED_PARTNER_PERSON_URL,
  currentUrl: url.TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.territoryChoiceLimitedPartnerUsualResidentialAddress,
  data: {
    ...limitedPartnerUsualResidentialAddressCacheKeys,
    nextUrlOverseas: url.ENTER_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
  }
};

const addressRoutingPostcodeLimitedPartnerUsualResidentialAddress = {
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

const addressRoutingChooseLimitedPartnerUsualResidentialAddress = {
  previousUrl: url.POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.CHOOSE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.chooseLimitedPartnerUsualResidentialAddress,
  data: {
    ...limitedPartnerUsualResidentialAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterLimitedPartnerUsualResidentialAddress
  }
};

const addressRoutingEnterLimitedPartnerUsualResidentialAddress = {
  previousUrl: url.POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.ENTER_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: url.CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: AddressPageType.enterLimitedPartnerUsualResidentialAddress,
  data: {
    ...limitedPartnerUsualResidentialAddressCacheKeys,
    territoryPageType: AddressPageType.territoryChoiceLimitedPartnerUsualResidentialAddress
  }
};

const addressRoutingConfirmLimitedPartnerUsualResidentialAddress = {
  previousUrl: url.POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  nextUrl: CHECK_YOUR_ANSWERS_URL, // TODO Change to REVIEW_LIMITED_PARTNERS_URL
  pageType: AddressPageType.confirmLimitedPartnerUsualResidentialAddress,
  data: {
    ...limitedPartnerUsualResidentialAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterLimitedPartnerUsualResidentialAddress
  }
};

const limitedPartnerUsualResidentialAddress = [
  addressRoutingTerritoryChoiceLimitedPartnerUsualResidentialAddress,
  addressRoutingPostcodeLimitedPartnerUsualResidentialAddress,
  addressRoutingChooseLimitedPartnerUsualResidentialAddress,
  addressRoutingEnterLimitedPartnerUsualResidentialAddress,
  addressRoutingConfirmLimitedPartnerUsualResidentialAddress
];

// principal office address - Legal entity

const limitedPartnerPrincipalOfficeAddressCacheKeys = {
  [AddressCacheKeys.addressCacheKey]: "principal_office_address",
  [AddressCacheKeys.territoryCacheKey]: "poa_territory_choice"
};

const addressRoutingTerritoryChoiceLimitedPartnerPrincipalOfficeAddress = {
  previousUrl: ADD_LIMITED_PARTNER_PERSON_URL,
  currentUrl: url.TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: url.POSTCODE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.territoryChoiceLimitedPartnerPrincipalOfficeAddress,
  data: {
    ...limitedPartnerPrincipalOfficeAddressCacheKeys
  }
};

const addressRoutingPostcodeLimitedPartnerPrincipalOfficeAddress = {
  previousUrl: url.TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  currentUrl: url.POSTCODE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: url.CHOOSE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.postcodeLimitedPartnerPrincipalOfficeAddress,
  data: {
    ...limitedPartnerPrincipalOfficeAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterLimitedPartnerPrincipalOfficeAddress,
    confirmAddressUrl: url.CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
  }
};

const addressRoutingChooseLimitedPartnerPrincipalOfficeAddress = {
  previousUrl: url.POSTCODE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  currentUrl: url.CHOOSE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: url.CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.chooseLimitedPartnerPrincipalOfficeAddress,
  data: {
    ...limitedPartnerPrincipalOfficeAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterLimitedPartnerPrincipalOfficeAddress
  }
};

const addressRoutingEnterLimitedPartnerPrincipalOfficeAddress = {
  previousUrl: url.POSTCODE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  currentUrl: url.ENTER_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: url.CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.enterLimitedPartnerPrincipalOfficeAddress,
  data: {
    ...limitedPartnerPrincipalOfficeAddressCacheKeys,
    territoryPageType: AddressPageType.territoryChoiceLimitedPartnerPrincipalOfficeAddress
  }
};

const addressRoutingConfirmLimitedPartnerPrincipalOfficeAddress = {
  previousUrl: url.POSTCODE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  currentUrl: url.CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: CHECK_YOUR_ANSWERS_URL, // TODO Change to REVIEW_LIMITED_PARTNERS_URL
  pageType: AddressPageType.confirmLimitedPartnerPrincipalOfficeAddress,
  data: {
    ...limitedPartnerPrincipalOfficeAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterLimitedPartnerPrincipalOfficeAddress
  }
};

const limitedPartnerPrincipalOfficeAddress = [
  addressRoutingTerritoryChoiceLimitedPartnerPrincipalOfficeAddress,
  addressRoutingPostcodeLimitedPartnerPrincipalOfficeAddress,
  addressRoutingChooseLimitedPartnerPrincipalOfficeAddress,
  addressRoutingEnterLimitedPartnerPrincipalOfficeAddress,
  addressRoutingConfirmLimitedPartnerPrincipalOfficeAddress
];

export const addressLookUpRouting: PagesRouting = new Map<PageType, PageRouting>();
[
  ...registeredOfficeAddress,
  ...principalPlaceOfBusinessAddress,
  ...generalPartnerUsualResidentialAddress,
  ...correspondenceAddress,
  ...generalPartnerPrincipalOfficeAddress,
  ...limitedPartnerUsualResidentialAddress,
  ...limitedPartnerPrincipalOfficeAddress
].forEach((routing) => {
  addressLookUpRouting.set(routing.pageType, routing);
});

export default addressLookUpRouting;
