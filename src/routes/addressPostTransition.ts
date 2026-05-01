import { Router } from "express";

import { companyAuthentication } from "../middlewares";

import { IDependencies } from "../config/IDependencies";

import * as url from "../presentation/controller/addressLookUp/url/postTransition";

export const addressLookUpEndpoints = (router: Router, dependencies: IDependencies): void => {

  // GENERAL PARTNER

  // usual residential address

  router.get(
    url.TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.handleTerritoryChoice()
  );

  router.get(
    url.POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.POSTCODE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.postcodeValidation()
  );

  router.get(
    url.CHOOSE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.CHOOSE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.selectAddress()
  );

  router.get(
    url.ENTER_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.ENTER_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.sendManualAddress()
  );

  router.get(
    url.CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.confirmAddress()
  );

  // correspondence address
  router.get(
    url.TERRITORY_CHOICE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.TERRITORY_CHOICE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.handleTerritoryChoice()
  );

  router.get(
    url.POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.POSTCODE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.postcodeValidation()
  );

  router.get(
    url.CHOOSE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.CHOOSE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.selectAddress()
  );

  router.get(
    url.ENTER_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.ENTER_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.sendManualAddress()
  );

  router.get(
    url.CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.CONFIRM_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.confirmAddress()
  );

  // principal office address
  router.get(
    url.TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.handleTerritoryChoice()
  );

  router.get(
    url.POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.POSTCODE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.postcodeValidation()
  );

  router.get(
    url.CHOOSE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.CHOOSE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.selectAddress()
  );

  router.get(
    url.ENTER_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.ENTER_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.sendManualAddress()
  );

  router.get(
    url.CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.confirmAddress()
  );

  // LIMITED PARTNER

  // usual residential address
  router.get(
    url.TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.handleTerritoryChoice()
  );

  router.get(
    url.POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.POSTCODE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.postcodeValidation()
  );

  router.get(
    url.CHOOSE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.CHOOSE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.selectAddress()
  );

  router.get(
    url.ENTER_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.ENTER_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.sendManualAddress()
  );

  router.get(
    url.CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.confirmAddress()
  );

  // principal office address

  router.get(
    url.TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.handleTerritoryChoice()
  );

  router.get(
    url.POSTCODE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.POSTCODE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.postcodeValidation()
  );

  router.get(
    url.CHOOSE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.CHOOSE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.selectAddress()
  );

  router.get(
    url.ENTER_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.ENTER_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.sendManualAddress()
  );

  router.get(
    url.CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.getPageRouting()
  );
  router.post(
    url.CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
    companyAuthentication,
    dependencies.addressLookUpController.confirmAddress()
  );
};

export default addressLookUpEndpoints;
