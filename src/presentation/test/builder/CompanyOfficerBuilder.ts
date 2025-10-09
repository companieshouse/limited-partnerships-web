import { Address, CompanyOfficer } from "@companieshouse/api-sdk-node/dist/services/company-officers/types";

class CompanyOfficerBuilder {
  "Id" = "AP123456";
  address: Address = {
    premises: "4",
    addressLine1: "duncalf street",
    addressLine2: "",
    postalCode: "ST6 3LJ",
    country: "England",
    locality: "stroke-on-trent",
    poBox: "",
    careOf: "",
    region: ""
  };
  appointedOn = "2023-12-29";
  countryOfResidence = "England";
  dateOfBirth = {
    dayy: "01",
    month: "01",
    year: "1980"
  };
  formerNames = [];
  identification = {};
  links = {
    self: "/company/LP123456/appointments/AP123456",
    officer: { appointments: "" }
  };
  name = "Partner Appointment";
  nationality = "British";
  occupation = "Solicitor";
  officerRole = "general-partner-in-a-limited-partnership";
  contactDetails = { contactName: "Contact Name" };
  responsibilities = "Some responsibilities";
  resignedOn = "";

  withAppointmentId(id: string) {
    this["Id"] = id;
    return this;
  }

  withCompanyNumber(companyNumber: string) {
    this.links = { ...this.links, self: `/company/${companyNumber}/appointments/${this["Id"]}` };
    return this;
  }

  withOfficerRole(officerRole: string) {
    this.officerRole = officerRole;
    return this;
  }

  build(): Partial<CompanyOfficer> {
    return {
      address: this.address,
      appointedOn: this.appointedOn,
      countryOfResidence: this.countryOfResidence,
      dateOfBirth: this.dateOfBirth,
      formerNames: this.formerNames,
      identification: this.identification,
      links: this.links,
      name: this.name,
      nationality: this.nationality,
      occupation: this.occupation,
      officerRole: this.officerRole,
      contactDetails: this.contactDetails,
      responsibilities: this.responsibilities,
      resignedOn: this.resignedOn
    };
  }
}

export default CompanyOfficerBuilder;
