import { Router } from "express";

import { authentication } from "../middlewares";

import { IDependencies } from "../config/IDependencies";

import * as url from "../presentation/controller/addressLookUp/url";

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

  // principal place of business
  router.get(
    url.POSTCODE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.POSTCODE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.postcodeValidation()
  );

  router.get(
    url.CHOOSE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.CHOOSE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.selectAddress()
  );

  router.get(
    url.ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.sendManualAddress()
  );

  router.get(
    url.CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.confirmAddress()
  );

  // usual residential address
  router.get(
    url.TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.generalPartnerTerritoryChoice()
  );

  router.get(
    url.POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.postcodeValidation()
  );

  router.get(
    url.CHOOSE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.CHOOSE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.selectAddress()
  );

  router.get(
    url.ENTER_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.ENTER_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.sendManualAddress()
  );

  router.get(
    url.CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.confirmAddress()
  );

  // principal office address
  router.get(
    url.TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.generalPartnerTerritoryChoice()
  );

  router.get(
    url.POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.postcodeValidation()
  );

  router.get(
    url.CHOOSE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.CHOOSE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.selectAddress()
  );

  router.get(
    url.ENTER_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.ENTER_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.sendManualAddress()
  );

  router.get(
    url.CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    authentication,
    dependencies.addressLookUpController.confirmAddress()
  );
};

export default addressLookUpEndpoints;
