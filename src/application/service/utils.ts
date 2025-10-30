import { GeneralPartner, LimitedPartner } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

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
    .filter((p) => p?.data?.completed === false)
    .forEach((p) => {
      const name = p.data?.forename ? `${p.data.forename} ${p.data.surname}` : p.data?.legal_entity_name ?? "";

      errorList = {
        ...errorList,
        [name.toLowerCase()]: `${i18n.reviewGeneralPartnersPage.errorMessage.beforeName} ${name} ${i18n.reviewGeneralPartnersPage.errorMessage.afterName}`
      };
    });

  return errorList;
};
