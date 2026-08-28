import {
  WHEN_DID_GENERAL_PARTNER_LEGAL_ENTITY_DETAILS_CHANGE_URL,
  UPDATE_GENERAL_PARTNER_LEGAL_ENTITY_CHECK_YOUR_ANSWERS_URL,
  UPDATE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL
} from "../../../../../presentation/controller/postTransition/url";
import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { getUrl } from "../../../utils";
import { runDateOfUpdateTests } from "../../shared/dateOfUpdateTestSuite";
import GeneralPartnerBuilder from "../../../builder/GeneralPartnerBuilder";
import CompanyAppointmentBuilder from "../../../builder/CompanyAppointmentBuilder";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { OFFICER_ROLE_GENERAL_PARTNER_LEGAL_ENTITY } from "../../../../../config/constants";
import TransactionGeneralPartner from "../../../../../domain/entities/TransactionGeneralPartner";

runDateOfUpdateTests({
  url: getUrl(WHEN_DID_GENERAL_PARTNER_LEGAL_ENTITY_DETAILS_CHANGE_URL),
  backLinkUrl: getUrl(UPDATE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL),
  pageType: PostTransitionPageType.whenDidGeneralPartnerLegalEntityDetailsChange,
  redirectUrl: getUrl(UPDATE_GENERAL_PARTNER_LEGAL_ENTITY_CHECK_YOUR_ANSWERS_URL),
  translateExclude: ["registeredOfficeAddress", "principalPlaceOfBusinessAddress", "term", "partnershipName", "limitedPartner"],
  serviceNameTranslationKey: "updateGeneralPartnerLegalEntity",
  kind: PartnerKind.UPDATE_GENERAL_PARTNER_LEGAL_ENTITY,
  changeTypeKey: "generalPartnerLegalEntity",
  existingDate: { day: "10", month: "10", year: "2024" },
  getDisplayedName: (entity) => `${(entity as TransactionGeneralPartner)?.data?.legal_entity_name?.toUpperCase()}`,
  additionalSetup: () => {
    const companyProfile = new CompanyProfileBuilder().build();

    const companyAppointmentLegalEntity = new CompanyAppointmentBuilder()
      .withOfficerRole(OFFICER_ROLE_GENERAL_PARTNER_LEGAL_ENTITY)
      .withAppointmentId("AP123456P")
      .withCompanyNumber(companyProfile?.data?.companyNumber ?? "")
      .isLegalEntity()
      .build();

    appDevDependencies.companyGateway.feedCompanyAppointments([companyAppointmentLegalEntity]);

    const generalPartner = new GeneralPartnerBuilder()
      .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
      .isLegalEntity()
      .withKind(PartnerKind.UPDATE_GENERAL_PARTNER_LEGAL_ENTITY)
      .withAppointmentId("AP123456LE")
      .withLegalEntityName(companyAppointmentLegalEntity?.name + " ")
      .withLegalForm(companyAppointmentLegalEntity?.identification?.legalForm + " ")
      .withGoverningLaw(companyAppointmentLegalEntity?.identification?.legalAuthority + " ")
      .withLegalEntityRegisterName(companyAppointmentLegalEntity?.identification?.placeRegistered + " ")
      .withLegalEntityRegistrationLocation(companyAppointmentLegalEntity?.identification?.registerLocation + " ")
      .withRegistrationNumber(companyAppointmentLegalEntity?.identification?.registrationNumber + " ")
      .withDateOfUpdate("2024-10-10")
      .build();

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

    return generalPartner;
  }
});
