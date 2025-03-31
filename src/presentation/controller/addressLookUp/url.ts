import * as template from "./template";

import {
  BASE_WITH_IDS_URL,
  GENERAL_PARTNER_WITH_ID_URL
} from "../../../config/constants";

// LIMITED PARTNERSHIP

// registered office address
export const POSTCODE_REGISTERED_OFFICE_ADDRESS_URL = `${BASE_WITH_IDS_URL}/${template.POSTCODE_REGISTERED_OFFICE_ADDRESS_TEMPLATE}`;
export const CHOOSE_REGISTERED_OFFICE_ADDRESS_URL = `${BASE_WITH_IDS_URL}/${template.CHOOSE_REGISTERED_OFFICE_ADDRESS_TEMPLATE}`;
export const ENTER_REGISTERED_OFFICE_ADDRESS_URL = `${BASE_WITH_IDS_URL}/${template.ENTER_REGISTERED_OFFICE_ADDRESS_TEMPLATE}`;
export const CONFIRM_REGISTERED_OFFICE_ADDRESS_URL = `${BASE_WITH_IDS_URL}/${template.CONFIRM_REGISTERED_OFFICE_ADDRESS_TEMPLATE}`;

// principal place of business
export const POSTCODE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL = `${BASE_WITH_IDS_URL}/${template.POSTCODE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_TEMPLATE}`;
export const CHOOSE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL = `${BASE_WITH_IDS_URL}/${template.CHOOSE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_TEMPLATE}`;
export const ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL = `${BASE_WITH_IDS_URL}/${template.ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_TEMPLATE}`;
export const CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL = `${BASE_WITH_IDS_URL}/${template.CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_TEMPLATE}`;

// GENERAL PARTNER

// usual residential address
export const POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL = `${GENERAL_PARTNER_WITH_ID_URL}/${template.POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_TEMPLATE}`;
export const ENTER_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL = `${GENERAL_PARTNER_WITH_ID_URL}/${template.ENTER_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_TEMPLATE}`;
export const TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL = `${GENERAL_PARTNER_WITH_ID_URL}/${template.TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_TEMPLATE}`;
export const CHOOSE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL = `${GENERAL_PARTNER_WITH_ID_URL}/${template.CHOOSE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_TEMPLATE}`;
export const CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL = `${GENERAL_PARTNER_WITH_ID_URL}/${template.CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_TEMPLATE}`;
export const POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL = `${GENERAL_PARTNER_WITH_ID_URL}/${template.POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRES_TEMPLATE}`;
export const CHOOSE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL = `${GENERAL_PARTNER_WITH_ID_URL}`;
