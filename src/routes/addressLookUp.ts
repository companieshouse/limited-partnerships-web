import { Router } from "express";

import { authentication } from "../middlewares";

import { IDependencies } from "../config/IDependencies";

import {
  CHOOSE_REGISTERED_OFFICE_ADDRESS_URL,
  CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  ENTER_REGISTERED_OFFICE_ADDRESS_URL,
  POSTCODE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  CHOOSE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL
} from "../presentation/controller/addressLookUp/url";

export const addressLookUpEndpoints = (
  router: Router,
  dependencies: IDependencies
): void => {
  // Registered Office Address
  router.get(
    POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.postcodeValidation()
  );

  router.get(
    CHOOSE_REGISTERED_OFFICE_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    CHOOSE_REGISTERED_OFFICE_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.selectAddress()
  );

  router.get(
    ENTER_REGISTERED_OFFICE_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    ENTER_REGISTERED_OFFICE_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.sendManualAddress()
  );

  router.get(
    CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.confirmAddress()
  );

  // principal place of business
  router.get(
    POSTCODE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    POSTCODE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.postcodeValidation()
  );

  router.get(
    CHOOSE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    CHOOSE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.selectAddress()
  );

  router.get(
    CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.confirmAddress()
  );
};

export default addressLookUpEndpoints;
