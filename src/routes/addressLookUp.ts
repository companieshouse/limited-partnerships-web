import { Router } from "express";

import { authentication } from "../middlewares";

import { IDependencies } from "../config/IDependencies";

import { POSTCODE_REGISTERED_OFFICE_ADDRESS_URL } from "../presentation/controller/addressLookUp/url";

export const addressLookUpEndpoints = (
  router: Router,
  dependencies: IDependencies
): void => {
  router.get(
    POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.getPageRouting()
  );
};

export default addressLookUpEndpoints;
