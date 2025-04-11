import { PageRouting, PagesRouting } from "../PageRouting";

import AddressPageType from "./PageType";
import PageType from "../PageType";
import {
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  ADD_GENERAL_PARTNER_PERSON_URL,
  LIMITED_PARTNERS_URL,
  TERM_URL,
  WHERE_IS_THE_JURISDICTION_URL
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
    ...usualResidentialAddressCacheKeys
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
    ...usualResidentialAddressCacheKeys
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

const usualResidentialAddress = [
  addressRoutingTerritoryChoiceGeneralPartnerUsualResidentialAddress,
  addressRoutingPostcodeGeneralPartnerUsualResidentialAddress,
  addressRoutingEnterGeneralPartnerUsualResidentialAddress,
  addressRoutingChooseGeneralPartnerUsualResidentialAddress,
  addressRoutingConfirmGeneralPartnerUsualResidentialAddress
];

// correspondence address - Person

const correspondenceAddressCacheKeys = {
  [AddressCacheKeys.addressCacheKey]: "correspondence_address",
  [AddressCacheKeys.territoryCacheKey]: "ca_territory_choice"
};

const addressRoutingTerritoryChoiceGeneralPartnerCorrespondanceAddress = {
  previousUrl: url.CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  currentUrl: url.TERRITORY_CHOICE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  nextUrl: url.POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  pageType: AddressPageType.territoryChoiceGeneralPartnerCorrespondenceAddress,
  data: {
    ...correspondenceAddressCacheKeys
  }
};

const addressRoutingPostcodeGeneralPartnerCorrespondenceAddress = {
  previousUrl: url.TERRITORY_CHOICE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  currentUrl: url.POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
  nextUrl: LIMITED_PARTNERS_URL,
  pageType: AddressPageType.postcodeGeneralPartnerCorrespondenceAddress
};

const correspondenceAddress = [
  addressRoutingTerritoryChoiceGeneralPartnerCorrespondanceAddress,
  addressRoutingPostcodeGeneralPartnerCorrespondenceAddress
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
    ...principalOfficeAddressCacheKeys
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
    ...principalOfficeAddressCacheKeys
  }
};

const addressRoutingConfirmGeneralPartnerPrincipalOfficeAddress = {
  previousUrl: url.POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  currentUrl: url.CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: LIMITED_PARTNERS_URL,
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

export const addressLookUpRouting: PagesRouting = new Map<PageType, PageRouting>();
[
  ...registeredOfficeAddress,
  ...principalPlaceOfBusinessAddress,
  ...usualResidentialAddress,
  ...correspondenceAddress,
  ...generalPartnerPrincipalOfficeAddress
].forEach((routing) => {
  addressLookUpRouting.set(routing.pageType, routing);
});

export default addressLookUpRouting;
