import { appDevDependencies } from "../../../../config/dev-dependencies";
import CompanyAppointmentBuilder from "../../builder/CompanyAppointmentBuilder";
import CompanyProfileBuilder from "../../builder/CompanyProfileBuilder";

describe("CompanyService", () => {
  let companyProfile;

  beforeEach(() => {
    companyProfile = new CompanyProfileBuilder().build();
    appDevDependencies.companyGateway.feedCompanyProfile(companyProfile.data);
    appDevDependencies.limitedPartnershipGateway.feedLimitedPartnerships([]);
  });

  describe("Company address", () => {
    it("should map the company address to the limited partnership address", async () => {
      const result = await appDevDependencies.companyService.buildLimitedPartnershipFromCompanyProfile(
        { access_token: "token", refresh_token: "token" },
        companyProfile.data.companyNumber
      );

      expect(result.limitedPartnership.data?.registered_office_address).toEqual({
        address_line_1: companyProfile.data.registeredOfficeAddress?.addressLineOne,
        address_line_2: companyProfile.data.registeredOfficeAddress?.addressLineTwo,
        premises: companyProfile.data.registeredOfficeAddress?.premises,
        locality: companyProfile.data.registeredOfficeAddress?.locality,
        region: companyProfile.data.registeredOfficeAddress?.region,
        country: companyProfile.data.registeredOfficeAddress?.country,
        postal_code: companyProfile.data.registeredOfficeAddress?.postalCode
      });

      expect(result.limitedPartnership.data?.principal_place_of_business_address).toEqual({
        address_line_1: companyProfile.data.serviceAddress?.addressLineOne,
        address_line_2: companyProfile.data.serviceAddress?.addressLineTwo,
        premises: companyProfile.data.serviceAddress?.premises,
        locality: companyProfile.data.serviceAddress?.locality,
        region: companyProfile.data.serviceAddress?.region,
        country: companyProfile.data.serviceAddress?.country,
        postal_code: companyProfile.data.serviceAddress?.postalCode
      });
    });

    it("should return empty addresses", async () => {
      companyProfile.data.registeredOfficeAddress = null;
      companyProfile.data.serviceAddress = null;

      const result = await appDevDependencies.companyService.buildLimitedPartnershipFromCompanyProfile(
        { access_token: "token", refresh_token: "token" },
        companyProfile.data.companyNumber
      );

      expect(result.limitedPartnership.data?.registered_office_address).toEqual({
        address_line_1: "",
        address_line_2: "",
        premises: "",
        locality: "",
        region: "",
        country: "",
        postal_code: ""
      });

      expect(result.limitedPartnership.data?.principal_place_of_business_address).toEqual({
        address_line_1: "",
        address_line_2: "",
        premises: "",
        locality: "",
        region: "",
        country: "",
        postal_code: ""
      });
    });
  });

  describe("Company appointment", () => {
    it("should map the company appointment to the partner", async () => {
      const appointment = new CompanyAppointmentBuilder().build();
      appDevDependencies.companyGateway.feedCompanyAppointments([appointment]);

      const result = await appDevDependencies.companyService.buildPartnerFromCompanyAppointment(
        { access_token: "token", refresh_token: "token" },
        companyProfile.data.companyNumber,
        "AP123456"
      );

      expect(result.partner.data?.appointment_id).toEqual("AP123456");
      expect(result.partner.data?.forename).toEqual(appointment.name?.split(", ")[1]);
      expect(result.partner.data?.surname).toEqual(appointment.name?.split(", ")[0]);
      expect(result.partner.data?.date_of_birth).toEqual("1980-01-01");
      expect(result.partner.data?.nationality1).toEqual("British");
      expect((result.partner.data as any)?.service_address).toEqual({
        address_line_1: appointment.address?.addressLine1,
        address_line_2: appointment.address?.addressLine2,
        premises: appointment.address?.premises,
        locality: appointment.address?.locality,
        region: appointment.address?.region,
        country: appointment.address?.country,
        postal_code: appointment.address?.postalCode
      });
    });
  });
});
