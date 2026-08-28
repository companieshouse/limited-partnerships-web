import {
  WHEN_DID_GENERAL_PARTNER_PERSON_DETAILS_CHANGE_URL,
  UPDATE_GENERAL_PARTNER_PERSON_CHECK_YOUR_ANSWERS_URL,
  UPDATE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_YES_NO_URL
} from "../../../../../presentation/controller/postTransition/url";
import PostTransitionPageType from "../../../../controller/postTransition/pageType";
import { PartnerKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { getUrl } from "../../../utils";
import { runDateOfUpdateTests } from "../../shared/dateOfUpdateTestSuite";
import GeneralPartnerBuilder from "../../../builder/GeneralPartnerBuilder";
import CompanyAppointmentBuilder from "../../../builder/CompanyAppointmentBuilder";
import CompanyProfileBuilder from "../../../builder/CompanyProfileBuilder";
import { appDevDependencies } from "../../../../../config/dev-dependencies";
import { OFFICER_ROLE_GENERAL_PARTNER_PERSON } from "../../../../../config/constants";
import TransactionGeneralPartner from "../../../../../domain/entities/TransactionGeneralPartner";

runDateOfUpdateTests({
  url: getUrl(WHEN_DID_GENERAL_PARTNER_PERSON_DETAILS_CHANGE_URL),
  backLinkUrl: getUrl(UPDATE_GENERAL_PARTNER_CORRESPONDENCE_ADDRESS_YES_NO_URL),
  pageType: PostTransitionPageType.whenDidGeneralPartnerPersonDetailsChange,
  redirectUrl: getUrl(UPDATE_GENERAL_PARTNER_PERSON_CHECK_YOUR_ANSWERS_URL),
  translateExclude: ["registeredOfficeAddress", "principalPlaceOfBusinessAddress", "term", "partnershipName", "limitedPartner"],
  serviceNameTranslationKey: "updateGeneralPartnerPerson",
  kind: PartnerKind.UPDATE_GENERAL_PARTNER_PERSON,
  changeTypeKey: "generalPartnerPerson",
  existingDate: { day: "10", month: "10", year: "2024" },
  getDisplayedName: (entity) => {
    const generalPartner = entity as TransactionGeneralPartner;
    return `${generalPartner?.data?.forename?.toUpperCase()} ${generalPartner?.data?.surname?.toUpperCase()}`;
  },
  additionalSetup: () => {
    const companyProfile = new CompanyProfileBuilder().build();

    const companyAppointmentPerson = new CompanyAppointmentBuilder()
      .withOfficerRole(OFFICER_ROLE_GENERAL_PARTNER_PERSON)
      .withAppointmentId("AP123456P")
      .withCompanyNumber(companyProfile?.data?.companyNumber ?? "")
      .isPerson()
      .build();

    const [surname, forename] = companyAppointmentPerson?.name?.split(", ") ?? [];

    const generalPartner = new GeneralPartnerBuilder()
      .withId(appDevDependencies.generalPartnerGateway.generalPartnerId)
      .isPerson()
      .withKind(PartnerKind.UPDATE_GENERAL_PARTNER_PERSON)
      .withAppointmentId("AP123456P")
      .withForename(forename)
      .withSurname(surname)
      .withDateOfUpdate("2024-10-10")
      .build();

    appDevDependencies.generalPartnerGateway.feedGeneralPartners([generalPartner]);

    return generalPartner;
  }
});
