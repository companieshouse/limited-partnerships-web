import { Router } from "express";

import { authentication } from "../middlewares";

import { IDependencies } from "../config/IDependencies";

import * as url from "../presentation/controller/addressLookUp/url/transition";

export const addressLookUpEndpoints = (router: Router, dependencies: IDependencies): void => {
  // Registered Office Address
  router.get(
    url.POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.postcodeValidation()
  );

  router.get(
    url.CHOOSE_REGISTERED_OFFICE_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.CHOOSE_REGISTERED_OFFICE_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.selectAddress()
  );

  router.get(
    url.ENTER_REGISTERED_OFFICE_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.ENTER_REGISTERED_OFFICE_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.sendManualAddress()
  );

  router.get(
    url.CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.confirmAddress()
  );
};

export default addressLookUpEndpoints;
