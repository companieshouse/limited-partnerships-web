import AddressPageType from "../../PageType";
import {
  ADD_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_WITH_IDS_URL,
  PERSON_WITH_SIGNIFICANT_CONTROL_CHOICE_URL
} from "../../../registration/url";
import * as url from "../../url/registration";

enum AddressCacheKeys {
  addressCacheKey = "addressCacheKey",
  territoryCacheKey = "territoryCacheKey"
}

// principal office address - Relevant Legal Entity

const personWithSignificantControlPrincipalOfficeAddressCacheKeys = {
  [AddressCacheKeys.addressCacheKey]: "principal_office_address",
  [AddressCacheKeys.territoryCacheKey]: "poa_territory_choice"
};

const registrationAddressRoutingTerritoryChoicePersonWithSignificantControlPrincipalOfficeAddress = {
  previousUrl: ADD_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_WITH_IDS_URL,
  currentUrl: url.TERRITORY_CHOICE_PERSON_WITH_SIGNIFICANT_CONTROL_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: url.POSTCODE_PERSON_WITH_SIGNIFICANT_CONTROL_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.territoryChoicePersonWithSignificantControlPrincipalOfficeAddress,
  data: {
    ...personWithSignificantControlPrincipalOfficeAddressCacheKeys,
    nextUrlOverseas: url.ENTER_PERSON_WITH_SIGNIFICANT_CONTROL_PRINCIPAL_OFFICE_ADDRESS_URL
  }
};

const registrationAddressRoutingPostcodePersonWithSignificantControlPrincipalOfficeAddress = {
  previousUrl: url.TERRITORY_CHOICE_PERSON_WITH_SIGNIFICANT_CONTROL_PRINCIPAL_OFFICE_ADDRESS_URL,
  currentUrl: url.POSTCODE_PERSON_WITH_SIGNIFICANT_CONTROL_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: url.CHOOSE_PERSON_WITH_SIGNIFICANT_CONTROL_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.postcodePersonWithSignificantControlPrincipalOfficeAddress,
  data: {
    ...personWithSignificantControlPrincipalOfficeAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterPersonWithSignificantControlPrincipalOfficeAddress,
    confirmAddressUrl: url.CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_PRINCIPAL_OFFICE_ADDRESS_URL
  }
};

const registrationAddressRoutingChoosePersonWithSignificantControlPrincipalOfficeAddress = {
  previousUrl: url.POSTCODE_PERSON_WITH_SIGNIFICANT_CONTROL_PRINCIPAL_OFFICE_ADDRESS_URL,
  currentUrl: url.CHOOSE_PERSON_WITH_SIGNIFICANT_CONTROL_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: url.CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.choosePersonWithSignificantControlPrincipalOfficeAddress,
  data: {
    ...personWithSignificantControlPrincipalOfficeAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterPersonWithSignificantControlPrincipalOfficeAddress
  }
};

const registrationAddressRoutingEnterPersonWithSignificantControlPrincipalOfficeAddress = {
  previousUrl: url.POSTCODE_PERSON_WITH_SIGNIFICANT_CONTROL_PRINCIPAL_OFFICE_ADDRESS_URL,
  currentUrl: url.ENTER_PERSON_WITH_SIGNIFICANT_CONTROL_PRINCIPAL_OFFICE_ADDRESS_URL,
  nextUrl: url.CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: AddressPageType.enterPersonWithSignificantControlPrincipalOfficeAddress,
  data: {
    ...personWithSignificantControlPrincipalOfficeAddressCacheKeys,
    territoryPageType: AddressPageType.territoryChoicePersonWithSignificantControlPrincipalOfficeAddress
  }
};

const registrationAddressRoutingConfirmPersonWithSignificantControlPrincipalOfficeAddress = {
  previousUrl: url.POSTCODE_PERSON_WITH_SIGNIFICANT_CONTROL_PRINCIPAL_OFFICE_ADDRESS_URL,
  currentUrl: url.CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_PRINCIPAL_OFFICE_ADDRESS_URL,
  // LP-1778: Replace with PSC summary page URL when implemented
  nextUrl: PERSON_WITH_SIGNIFICANT_CONTROL_CHOICE_URL,
  pageType: AddressPageType.confirmPersonWithSignificantControlPrincipalOfficeAddress,
  data: {
    ...personWithSignificantControlPrincipalOfficeAddressCacheKeys,
    enterManualAddressPageType: AddressPageType.enterPersonWithSignificantControlPrincipalOfficeAddress
  }
};

const personWithSignificantControlRouting = [
  registrationAddressRoutingTerritoryChoicePersonWithSignificantControlPrincipalOfficeAddress,
  registrationAddressRoutingPostcodePersonWithSignificantControlPrincipalOfficeAddress,
  registrationAddressRoutingChoosePersonWithSignificantControlPrincipalOfficeAddress,
  registrationAddressRoutingEnterPersonWithSignificantControlPrincipalOfficeAddress,
  registrationAddressRoutingConfirmPersonWithSignificantControlPrincipalOfficeAddress
];

export default personWithSignificantControlRouting;
