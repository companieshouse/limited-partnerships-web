import request from "supertest";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import enTranslationText from "../../../../../../locales/en/translations.json";
import cyTranslationText from "../../../../../../locales/cy/translations.json";

import app from "../../app";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { getUrl, setLocalesEnabled, testTranslations } from "../../../utils";

import {
  UPDATE_GENERAL_PARTNER_LEGAL_ENTITY_WITH_IDS_URL,
  UPDATE_GENERAL_PARTNER_PERSON_WITH_IDS_URL,
  UPDATE_GENERAL_PARTNER_STOP_SCREEN_NO_CHANGE_URL,
  UPDATE_LIMITED_PARTNER_LEGAL_ENTITY_WITH_IDS_URL,
  UPDATE_LIMITED_PARTNER_PERSON_WITH_IDS_URL,
  UPDATE_LIMITED_PARTNER_STOP_SCREEN_NO_CHANGE_URL,
  WHEN_DID_GENERAL_PARTNER_LEGAL_ENTITY_DETAILS_CHANGE_URL,
  WHEN_DID_GENERAL_PARTNER_PERSON_DETAILS_CHANGE_URL,
  WHEN_DID_LIMITED_PARTNER_LEGAL_ENTITY_DETAILS_CHANGE_URL,
  WHEN_DID_LIMITED_PARTNER_PERSON_DETAILS_CHANGE_URL
} from "../../../../controller/postTransition/url";

import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import GeneralPartnerBuilder from "../../../builder/GeneralPartnerBuilder";
import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";
import TransactionBuilder from "../../../builder/TransactionBuilder";
import CompanyAppointmentBuilder from "../../../builder/CompanyAppointmentBuilder";
import {
  OFFICER_ROLE_GENERAL_PARTNER_LEGAL_ENTITY,
  OFFICER_ROLE_GENERAL_PARTNER_PERSON
} from "../../../../../config/constants";
import TransactionGeneralPartner from "../../../../../domain/entities/TransactionGeneralPartner";
import TransactionLimitedPartner from "../../../../../domain/entities/TransactionLimitedPartner";

describe("Stop screen - no change", () => {
  const { generalPartnerId } = appDevDependencies.generalPartnerGateway;
  const GENERAL_PARTNER_PERSON_STOP_URL = getUrl(UPDATE_GENERAL_PARTNER_STOP_SCREEN_NO_CHANGE_URL);
  const GENERAL_PARTNER_LEGAL_ENTITY_STOP_URL = getUrl(UPDATE_GENERAL_PARTNER_STOP_SCREEN_NO_CHANGE_URL).replace(
    generalPartnerId,
    "generalPartnerLegalEntityId"
  );
  const UPDATE_GENERAL_PARTNER_PERSON_URL = getUrl(UPDATE_GENERAL_PARTNER_PERSON_WITH_IDS_URL);
  const UPDATE_GENERAL_PARTNER_LEGAL_ENTITY_URL = getUrl(UPDATE_GENERAL_PARTNER_LEGAL_ENTITY_WITH_IDS_URL).replace(
    generalPartnerId,
    "generalPartnerLegalEntityId"
  );

  const { limitedPartnerId } = appDevDependencies.limitedPartnerGateway;
  const LIMITED_PARTNER_PERSON_STOP_URL = getUrl(UPDATE_LIMITED_PARTNER_STOP_SCREEN_NO_CHANGE_URL);
  const LIMITED_PARTNER_LEGAL_ENTITY_STOP_URL = getUrl(UPDATE_LIMITED_PARTNER_STOP_SCREEN_NO_CHANGE_URL).replace(
    limitedPartnerId,
    "limitedPartnerLegalEntityId"
  );
  const UPDATE_LIMITED_PARTNER_PERSON_URL = getUrl(UPDATE_LIMITED_PARTNER_PERSON_WITH_IDS_URL);
  const UPDATE_LIMITED_PARTNER_LEGAL_ENTITY_URL = getUrl(UPDATE_LIMITED_PARTNER_LEGAL_ENTITY_WITH_IDS_URL).replace(
    limitedPartnerId,
    "limitedPartnerLegalEntityId"
  );

  let generalPartnerPerson: TransactionGeneralPartner;
  let generalPartnerLegalEntity: TransactionGeneralPartner;
  let limitedPartnerPerson: TransactionLimitedPartner;
  let limitedPartnerLegalEntity: TransactionLimitedPartner;

  beforeEach(() => {
    setLocalesEnabled(true);

    const companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);

    const companyAppointmentPerson = new CompanyAppointmentBuilder()
      .withOfficerRole(OFFICER_ROLE_GENERAL_PARTNER_PERSON)
      .withAppointmentId("AP123456P")
      .withCompanyNumber(companyProfile?.data?.companyNumber ?? "")
      .isPerson()
      .build();

    const [surname, forename] = companyAppointmentPerson?.name?.split(", ") ?? [];

    const companyAppointmentLegalEntity = new CompanyAppointmentBuilder()
      .withOfficerRole(OFFICER_ROLE_GENERAL_PARTNER_LEGAL_ENTITY)
      .withAppointmentId("AP123456LE")
      .withCompanyNumber(companyProfile?.data?.companyNumber ?? "")
      .isLegalEntity()
      .build();

    appDevDependencies.companyGateway.feedCompanyAppointments([
      companyAppointmentPerson,
      companyAppointmentLegalEntity
    ]);

    generalPartnerPerson = new GeneralPartnerBuilder()
      .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
      .isPerson()
      .withKind(PartnerKind.UPDATE_GENERAL_PARTNER_PERSON)
      .withAppointmentId("AP123456P")
      .withForename(forename)
      .withSurname(surname)
      .withDateOfUpdate("2024-10-10")
      .build();

    (generalPartnerPerson as any).data.update_usual_residential_address_required = false;
    (generalPartnerPerson as any).data.update_service_address_required = false;
    (generalPartnerPerson as any).data.update_principal_office_address_required = false;

    generalPartnerLegalEntity = new GeneralPartnerBuilder()
      .withId("generalPartnerLegalEntityId")
      .isLegalEntity()
      .withKind(PartnerKind.UPDATE_GENERAL_PARTNER_LEGAL_ENTITY)
      .withAppointmentId("AP123456LE")
      .withLegalEntityName(companyAppointmentLegalEntity?.name + " ")
      .withLegalForm(companyAppointmentLegalEntity?.identification?.legalForm + " ")
      .withGoverningLaw(companyAppointmentLegalEntity?.identification?.legalAuthority + " ")
      .withLegalEntityRegisterName(companyAppointmentLegalEntity?.identification?.placeRegistered + " ")
      .withLegalEntityRegistrationLocation(companyAppointmentLegalEntity?.identification?.registerLocation + " ")
      .withRegistrationNumber(companyAppointmentLegalEntity?.identification?.registrationNumber + " ")
      .build();

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartnerPerson, generalPartnerLegalEntity]);

    limitedPartnerPerson = new LimitedPartnerBuilder()
      .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
      .isPerson()
      .withKind(PartnerKind.UPDATE_LIMITED_PARTNER_PERSON)
      .withAppointmentId("AP123456P")
      .withForename(forename)
      .withSurname(surname)
      .withDateOfUpdate("2024-10-10")
      .build();

    limitedPartnerLegalEntity = new LimitedPartnerBuilder()
      .withId("limitedPartnerLegalEntityId")
      .isLegalEntity()
      .withKind(PartnerKind.UPDATE_LIMITED_PARTNER_LEGAL_ENTITY)
      .withAppointmentId("AP123456LE")
      .withPrincipalOfficeAddressUpdateRequired(false)
      .withLegalEntityName(companyAppointmentLegalEntity?.name + " ")
      .withLegalForm(companyAppointmentLegalEntity?.identification?.legalForm + " ")
      .withGoverningLaw(companyAppointmentLegalEntity?.identification?.legalAuthority + " ")
      .withLegalEntityRegisterName(companyAppointmentLegalEntity?.identification?.placeRegistered + " ")
      .withLegalEntityRegistrationLocation(companyAppointmentLegalEntity?.identification?.registerLocation + " ")
      .withRegistrationNumber(companyAppointmentLegalEntity?.identification?.registrationNumber + " ")
      .build();

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartnerPerson, limitedPartnerLegalEntity]);

    const transaction = new TransactionBuilder().withKind(PartnerKind.UPDATE_GENERAL_PARTNER_PERSON).build();
    appDevDependencies.transactionGateway.feedTransactions([transaction]);
  });

  it.each([
    ["en", enTranslationText, GENERAL_PARTNER_PERSON_STOP_URL, UPDATE_GENERAL_PARTNER_PERSON_URL],
    ["cy", cyTranslationText, GENERAL_PARTNER_LEGAL_ENTITY_STOP_URL, UPDATE_GENERAL_PARTNER_LEGAL_ENTITY_URL],
    ["en", enTranslationText, LIMITED_PARTNER_PERSON_STOP_URL, UPDATE_LIMITED_PARTNER_PERSON_URL],
    ["cy", cyTranslationText, LIMITED_PARTNER_LEGAL_ENTITY_STOP_URL, UPDATE_LIMITED_PARTNER_LEGAL_ENTITY_URL]
  ])(
    "should render the stop screen page - %s",
    async (lang: string, translation: any, url: string, expectedUpdatePartnerDetailsLink: string) => {
      const res = await request(app).get(`${url}?lang=${lang}`);

      expect(res.status).toBe(200);

      testTranslations(res.text, translation.stopPage);

      expect(res.text).toContain(expectedUpdatePartnerDetailsLink);
    }
  );

  it.each([
    ["GP person", getUrl(WHEN_DID_GENERAL_PARTNER_PERSON_DETAILS_CHANGE_URL), GENERAL_PARTNER_PERSON_STOP_URL],
    [
      "GP legal entity",
      getUrl(WHEN_DID_GENERAL_PARTNER_LEGAL_ENTITY_DETAILS_CHANGE_URL),
      GENERAL_PARTNER_PERSON_STOP_URL
    ],
    ["LP person", getUrl(WHEN_DID_LIMITED_PARTNER_PERSON_DETAILS_CHANGE_URL), LIMITED_PARTNER_PERSON_STOP_URL],
    [
      "LP legal entity",
      getUrl(WHEN_DID_LIMITED_PARTNER_LEGAL_ENTITY_DETAILS_CHANGE_URL),
      LIMITED_PARTNER_PERSON_STOP_URL
    ]
  ])(
    "should show the stop screen if there are no changes to the partner details - %s",
    async (_partner: string, whenDidUrl: string, stopUrl) => {
      const res = await request(app).get(whenDidUrl);

      expect(res.status).toBe(302);

      expect(res.text).toContain(stopUrl);
    }
  );

  it.each([
    ["GP person", getUrl(WHEN_DID_GENERAL_PARTNER_PERSON_DETAILS_CHANGE_URL)],
    ["GP legal entity", getUrl(WHEN_DID_GENERAL_PARTNER_LEGAL_ENTITY_DETAILS_CHANGE_URL)],
    ["LP person", getUrl(WHEN_DID_LIMITED_PARTNER_PERSON_DETAILS_CHANGE_URL)],
    ["LP legal entity", getUrl(WHEN_DID_LIMITED_PARTNER_LEGAL_ENTITY_DETAILS_CHANGE_URL)]
  ])(
    "should render the when did page if there is at least one update - %s",
    async (_partner: string, whenDidUrl: string) => {
      if (generalPartnerPerson.data) {
        generalPartnerPerson.data.forename = "NewForename";
      }
      if (generalPartnerLegalEntity.data) {
        generalPartnerLegalEntity.data.legal_entity_name = "NewLegalEntityName";
      }
      if (limitedPartnerPerson.data) {
        limitedPartnerPerson.data.forename = "NewForename";
      }
      if (limitedPartnerLegalEntity.data) {
        limitedPartnerLegalEntity.data.legal_entity_name = "NewLegalEntityName";
      }

      const res = await request(app).get(whenDidUrl);

      expect(res.status).toBe(200);

      expect(res.text).toContain("when-did-");
    }
  );

  it.each([
    [
      "GP person - update_usual_residential_address_required",
      getUrl(WHEN_DID_GENERAL_PARTNER_PERSON_DETAILS_CHANGE_URL),
      "update_usual_residential_address_required"
    ],
    [
      "GP person - update_service_address_required",
      getUrl(WHEN_DID_GENERAL_PARTNER_PERSON_DETAILS_CHANGE_URL),
      "update_service_address_required"
    ],
    [
      "GP legal entity - update_principal_office_address_required",
      getUrl(WHEN_DID_GENERAL_PARTNER_LEGAL_ENTITY_DETAILS_CHANGE_URL),
      "update_principal_office_address_required"
    ]
  ])(
    "should render the when did page if there is at least one address update - %s",
    async (_partner: string, whenDidUrl: string, addressChange: string) => {
      (generalPartnerPerson as any).data[addressChange] = true;

      const res = await request(app).get(whenDidUrl);

      expect(res.status).toBe(200);

      expect(res.text).toContain("when-did-");
    }
  );
});
