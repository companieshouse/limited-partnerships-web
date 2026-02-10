import { CompanyOfficer, Identification } from "@companieshouse/api-sdk-node/dist/services/company-officers/types";

export const companyAppointmentPerson = {
  nationality: "British",
  name: "John, Doe",
  dateOfBirth: {
    day: "01",
    month: "01",
    year: "1980"
  },
  formerNames: []
};

export const companyAppointmentLegalEntity = {
  name: "Partner Appointment",
  identification: {
    legalForm: "Limited Company",
    legalAuthority: "Act of law",
    placeRegistered: "US Register",
    registerLocation: "United States",
    registrationNumber: "12345678",
  }
};

export const principalOfficeAddress = {
  addressLine1: "10 Test Street",
  addressLine2: "Test Address Line 2",
  locality: "Test Locality",
  postalCode: "TE1 1ST",
  premises: "10",
  region: "Test Region",
  country: "England"
};

class CompanyAppointmentBuilder {
  constructor() {
    this.init();
  };

  init() {
    this.data = {
      ...this.data
    };
  };

  id = "AP123456";
  data: Record<string, any> = {
    address: {
      premises: "4",
      addressLine1: "duncalf street",
      addressLine2: "",
      postalCode: "ST6 3LJ",
      country: "England",
      locality: "stroke-on-trent",
      poBox: "",
      careOf: "",
      region: ""
    },
    appointedOn: "2023-12-29",
    countryOfResidence: "England",
    dateOfBirth: {
      day: "",
      month: "",
      year: ""
    },
    formerNames: [],
    identification: {},
    links: {
      self: "/company/LP123456/appointments/AP123456",
      officer: { appointments: "" }
    },
    name: "",
    nationality: "",
    occupation: "Solicitor",
    officerRole: "general-partner-in-a-limited-partnership",
    contactDetails: { contactName: "Contact Name" },
    responsibilities: "Some responsibilities",
    resignedOn: "",
  };

  isPerson() {
    this.data = {
      ...this.data,
      ...companyAppointmentPerson
    };
    return this;
  };

  isLegalEntity() {
    this.data = {
      ...this.data,
      ...companyAppointmentLegalEntity
    };
    return this;
  };

  withAppointmentId(id: string) {
    this["Id"] = id;
    return this;
  };

  withCompanyNumber(companyNumber: string) {
    this.data.links = { ...this.data.links, self: `/company/${companyNumber}/appointments/${this["Id"]}` };
    return this;
  };

  withOfficerRole(officerRole: string) {
    this.data.officerRole = officerRole;
    return this;
  };

  withName(name: string) {
    this.data.name = name;
    return this;
  };

  withNationality(nationality: string) {
    this.data.nationality = nationality;
    return this;
  };

  withIdentificationDetails(identification: Identification) {
    this.data.identification = identification;
    return this;
  };

  withPrincipalOfficeAddress(address: Record<string, any>) {
    this.data.principalOfficeAddress = address;
    return this;
  };

  build(): Partial<CompanyOfficer> {
    return {
      ...this.data
    };
  };
};

export default CompanyAppointmentBuilder;
