import { GeneralPartner, LimitedPartner, PersonWithSignificantControl } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import UIErrors from "../../domain/entities/UIErrors";

export const extractAPIErrors = (errors: any) => {
  const isValidationErrors = errors instanceof UIErrors;
  const apiErrors = isValidationErrors ? errors?.apiErrors : errors;

  return { apiErrors, isValidationErrors };
};

// Partner
export const incompletePartnerErrorList = (
  partners: Array<GeneralPartner | LimitedPartner>,
  i18n: Record<string, any>
): Record<string, string> => {
  let errorList = {};

  partners
    .filter((partner) => partner?.data?.completed === false)
    .forEach((partner) => {
      const name = partner.data?.forename ? `${partner.data.forename} ${partner.data.surname}` : partner.data?.legal_entity_name ?? "";

      errorList = {
        ...errorList,
        [name.toLowerCase()]: `${i18n.reviewGeneralPartnersPage.errorMessage.beforeName} ${name} ${i18n.reviewGeneralPartnersPage.errorMessage.afterName}`
      };
    });

  return errorList;
};

// Person with Significant Control
export const incompletePersonWithSignificantControlErrorList = (
  personsWithSignificantControl: Array<PersonWithSignificantControl>,
  i18n: Record<string, any>
): Record<string, string> => {
  let errorList = {};

  personsWithSignificantControl
    .filter((psc) => psc?.data?.completed === false)
    .forEach((psc) => {
      const name = psc.data?.forename ? `${psc.data.forename} ${psc.data.surname}` : psc.data?.legal_entity_name ?? "";
      errorList = {
        ...errorList,
        [name.toLowerCase()]: `${i18n.personWithSignificantControl.reviewPersonsWithSignificantControlPage.errorMessage.beforeName} ${name} ${i18n.personWithSignificantControl.reviewPersonsWithSignificantControlPage.errorMessage.afterName}`
      };
    });
  return errorList;
};
