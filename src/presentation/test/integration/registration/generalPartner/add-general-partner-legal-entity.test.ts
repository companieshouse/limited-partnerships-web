import {
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_ID_URL
} from "../../../../controller/registration/url";

import {
  CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
} from "../../../../controller/addressLookUp/url/registration";

import { REGISTRATION_WITH_IDS_URL, SERVICE_NAME_KEY_REGISTRATION } from "../../../../../config/constants";

import RegistrationPageType from "../../../../controller/registration/PageType";
import RegistrationRouting from "../../../../controller/registration/Routing";
import request from "supertest";
import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, toEscapedHtml } from "../../../utils";
import * as enErrors from "../../../../../../locales/en/errors.json";
import * as cyErrors from "../../../../../../locales/cy/errors.json";

import { runAddGeneralPartnerLegalEntityTests } from "../../shared/generalPartner/addGeneralPartnerLegalEntity";

it("should run add general partner legal entity tests for registration journey", () => {
  expect(ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL).toContain("registration");
});

runAddGeneralPartnerLegalEntityTests({
  url: ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  urlWithIds: ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
  pageType: {
    addGeneralPartnerLegalEntity: RegistrationPageType.addGeneralPartnerLegalEntity,
    reviewGeneralPartners: RegistrationPageType.reviewGeneralPartners,
    generalPartnerType: RegistrationPageType.generalPartnerType
  },
  pageRouting: RegistrationRouting,
  redirectUrl: TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  confirmRedirectUrl: CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  baseUrlWithIds: REGISTRATION_WITH_IDS_URL,
  translateExcludeAddOrUpdatePartnerLegalEntityPage: [
    "updateTitle",
    "limitedPartner",
    "errorMessages",
    "dateEffectiveFrom",
    "dateHint",
    "dateDay",
    "dateMonth",
    "dateYear"
  ],
  translateExcludeGeneralPartnersPage: ["title", "pageInformation"],
  serviceTitleTranslationKey: SERVICE_NAME_KEY_REGISTRATION
});

describe.each([
  ["English", "en", enErrors],
  ["Welsh", "cy", cyErrors]
])("Disqualification statement validation - %s", (_language, language, errors) => {
  beforeEach(() => {
    setLocalesEnabled(true);
    appDevDependencies.generalPartnerGateway.feedGeneralPartners([]);
  });

  it("should require confirmation that the general partner is not disqualified", async () => {
    const res = await request(app).post(`${getUrl(ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL)}?lang=${language}`).send({
      ...RegistrationRouting.get(RegistrationPageType.addGeneralPartnerLegalEntity),
      legal_entity_name: "My Company ltd - GP",
      legal_form: "Limited Company",
      governing_law: "Act of law",
      legal_entity_register_name: "US Register",
      legal_entity_registration_location: "United States",
      registered_company_number: "12345678"
    });

    expect(res.status).toBe(200);
    expect(res.text).toContain(
      toEscapedHtml(errors.errorMessages.partners.addPartner.disqualificationStatementMissingGeneralPartner)
    );
  });
});
