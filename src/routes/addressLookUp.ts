import { Router } from "express";

import { authentication } from "../middlewares";

import { IDependencies } from "../config/IDependencies";

import {
  CHOOSE_REGISTERED_OFFICE_ADDRESS_URL,
  CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  ENTER_REGISTERED_OFFICE_ADDRESS_URL,
  POSTCODE_PRINCIPLE_PLACE_OF_BUSINESS_URL,
  POSTCODE_REGISTERED_OFFICE_ADDRESS_URL
} from "../presentation/controller/addressLookUp/url";

export const addressLookUpEndpoints = (
  router: Router,
  dependencies: IDependencies
): void => {
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

  router.get(
    POSTCODE_PRINCIPLE_PLACE_OF_BUSINESS_URL,
    authentication,
    dependencies.addressLookUpController.getPageRouting()
  );
};

export default addressLookUpEndpoints;
