/* eslint-disable */
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

import ICompanyGateway from "../../../domain/ICompanyGateway";

class CompanyInMemoryGateway implements ICompanyGateway {
  companyProfile = companyProfile;

  private error = false;

  setError(value: boolean) {
    this.error = value;
  }

  async getCompanyProfile(
    opt: { access_token: string; refresh_token: string },
    company_number: string
  ): Promise<Partial<CompanyProfile>> {
    return this.companyProfile;
  }
}

export default CompanyInMemoryGateway;

const companyProfile: CompanyProfile = {
  accounts: {
    nextAccounts: {
      periodStartOn: "2020-09-30",
      periodEndOn: "2020-12-31"
    },
    nextDue: "2020-09-30",
    overdue: false
  },
  companyName: "TEST COMPANY",
  companyNumber: "LP123456",
  companyStatus: "active",
  companyStatusDetail: "company status detail",
  dateOfCreation: "2019-01-01",
  hasBeenLiquidated: false,
  hasCharges: false,
  hasInsolvencyHistory: false,
  jurisdiction: "england-wales",
  links: {
    filingHistory: "/company/00000000/filing-history"
  },
  registeredOfficeAddress: {
    addressLineOne: "address line 1",
    addressLineTwo: "address line 2",
    careOf: "care of",
    country: "country",
    locality: "locality",
    poBox: "po box",
    postalCode: "postal code",
    premises: "premises",
    region: "region"
  },
  sicCodes: ["12345"],
  type: "ltd"
};
