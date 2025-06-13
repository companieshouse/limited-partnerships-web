import { Jurisdiction, Address } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

class CompanyProfileBuilder {
  "Id" = "LP123456";
  hasMortgages = true;
  data = {
    subtype: "",
    companyStatus: "active",
    dateOfCreation: "2023-12-29T11:47:59.193Z",
    type: "limited-partnership",
    hasInsolvencyHistory: false,
    companyName: "TEST LP",
    companyNumber: "LP123456",
    jurisdiction: "england-wales",
    hasCharges: false,
    registeredOfficeAddress: {
      premises: "2",
      addressLineOne: "duncalf street",
      addressLineTwo: "",
      postalCode: "ST6 3LJ",
      country: "England",
      locality: "stroke-on-trent",
      poBox: "",
      careOf: "",
      region: ""
    },
    registeredOfficeIsInDispute: false,
    accounts: {
      overdue: false,
      nextMadeUpTo: "2024-11-17T11:47:59.193Z",
      nextDue: "2025-08-19T10:47:59.193Z",
      accountingReferenceDate: {
        day: "17",
        month: "11"
      },
      nextAccounts: {
        overdue: false,
        dueOn: "2025-08-19T10:47:59.193Z",
        periodStartOn: "2023-11-20T11:47:59.193Z",
        periodEndOn: "2024-11-17T11:47:59.193Z"
      },
      lastAccounts: {
        type: "aa",
        periodStartOn: "2022-11-19T11:47:59.193Z",
        periodEndOn: "2023-11-19T11:47:59.193Z",
        madeUpTo: "2023-11-19T11:47:59.193Z"
      }
    },
    confirmationStatement: {
      overdue: false,
      nextMadeUpTo: "2026-05-13T10:47:59.193Z",
      nextDue: "2026-05-26T10:47:59.193Z",
      lastMadeUpTo: "2024-05-11T10:47:59.193Z"
    },
    isCommunityInterestCompany: false,
    etag: "kac12c39d242c05e3d64d85b5651af611b823cc4",
    foreignCompanyDetails: {
      originatingRegistry: {
        country: "Spain",
        name: "Public Register"
      },
      accountingRequirement: {
        foreignAccountType: "ForeignAccountType1",
        termsOfAccountPublication: "Terms of Account Publication"
      },
      accounts: {
        accountPeriodFrom: {
          day: "1",
          month: "January"
        },
        accountPeriodTo: {
          day: "31",
          month: "December"
        },
        mustFile_within: {
          months: "12"
        }
      },
      businessActivity: "Trading",
      companyType: "Limited",
      governed_by: "Federal government",
      isACreditFinancialInstitution: true,
      registration_number: "REG123456",
      legalForm: "Private limited company (Ltd)"
    }
  };

  withId(id: string) {
    this["Id"] = id;
    return this;
  }

  withSubtype() {
    this.data.subtype = "private-fund-limited-partnership";
    return this;
  }

  withJurisdiction(jurisdiction: Jurisdiction) {
    this.data.jurisdiction = jurisdiction;
    return this;
  }

  withRegisteredOfficeAddress(address: Address | null) {
    this.data.registeredOfficeAddress = address as any;
    return this;
  }

  build(): { Id: string; data: Partial<CompanyProfile> } {
    return {
      Id: this["Id"],
      data: this.data
    };
  }
}

export default CompanyProfileBuilder;
