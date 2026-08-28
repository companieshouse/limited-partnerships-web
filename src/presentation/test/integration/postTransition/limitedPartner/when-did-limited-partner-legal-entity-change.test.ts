import {
  UPDATE_LIMITED_PARTNER_LEGAL_ENTITY_CHECK_YOUR_ANSWERS_URL,
  UPDATE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL,
  WHEN_DID_LIMITED_PARTNER_LEGAL_ENTITY_DETAILS_CHANGE_URL
} from "../../../../controller/postTransition/url";
import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { getUrl } from "../../../utils";
import { runDateOfUpdateTests } from "../../shared/dateOfUpdateTestSuite";
import LimitedPartnerBuilder from "../../../builder/LimitedPartnerBuilder";
import CompanyAppointmentBuilder from "../../../builder/CompanyAppointmentBuilder";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { OFFICER_ROLE_GENERAL_PARTNER_LEGAL_ENTITY } from "../../../../../config/constants";
import TransactionLimitedPartner from "../../../../../domain/entities/TransactionLimitedPartner";

runDateOfUpdateTests({
  url: getUrl(WHEN_DID_LIMITED_PARTNER_LEGAL_ENTITY_DETAILS_CHANGE_URL),
  backLinkUrl: getUrl(UPDATE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_YES_NO_URL),
  pageType: PostTransitionPageType.whenDidLimitedPartnerLegalEntityDetailsChange,
  redirectUrl: getUrl(UPDATE_LIMITED_PARTNER_LEGAL_ENTITY_CHECK_YOUR_ANSWERS_URL),
  translateExclude: ["registeredOfficeAddress", "principalPlaceOfBusinessAddress", "term", "partnershipName", "limitedPartner"],
  serviceNameTranslationKey: "updateLimitedPartnerLegalEntity",
  kind: PartnerKind.UPDATE_LIMITED_PARTNER_LEGAL_ENTITY,
  changeTypeKey: "limitedPartnerLegalEntity",
  existingDate: { day: "10", month: "10", year: "2024" },
  getDisplayedName: (entity) => `${(entity as TransactionLimitedPartner)?.data?.legal_entity_name?.toUpperCase()}`,
  additionalSetup: () => {
    const companyProfile = new CompanyProfileBuilder().build();

    const companyAppointmentLegalEntity = new CompanyAppointmentBuilder()
      .withOfficerRole(OFFICER_ROLE_GENERAL_PARTNER_LEGAL_ENTITY)
      .withAppointmentId("AP123456LE")
      .withCompanyNumber(companyProfile?.data?.companyNumber ?? "")
      .isLegalEntity()
      .build();

    const limitedPartner = new LimitedPartnerBuilder()
      .withId(appDevDependencies.limitedPartnerGateway.limitedPartnerId)
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
      .withDateOfUpdate("2024-10-10")
      .build();

    appDevDependencies.limitedPartnerGateway.feedLimitedPartners([limitedPartner]);

    return limitedPartner;
  }
});
