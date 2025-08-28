import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { Jurisdiction, LimitedPartnership, PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import { logger } from "../../utils";
import ICompanyGateway from "../../domain/ICompanyGateway";
import UIErrors from "../../domain/entities/UIErrors";
import { extractAPIErrors } from "./utils";

class CompanyService {
  constructor(private readonly companyGateway: ICompanyGateway) {}

  public async buildLimitedPartnershipFromProfile(
    opt: { access_token: string; refresh_token: string },
    company_number: string
  ): Promise<{ limitedPartnership: Partial<LimitedPartnership>; errors?: UIErrors }> {
    const { companyProfile, errors } = await this.getCompanyProfile(opt, company_number);
    let limitedPartnership: LimitedPartnership = {};

    if (companyProfile.companyName) {
      const roa = companyProfile.registeredOfficeAddress;
      limitedPartnership = {
        data: {
          partnership_name: companyProfile.companyName,
          partnership_number: companyProfile.companyNumber,
          partnership_type: this.calculatePartnershipType(companyProfile),
          jurisdiction: companyProfile.jurisdiction as Jurisdiction,
          registered_office_address: {
            address_line_1: roa?.addressLineOne || "",
            address_line_2: roa?.addressLineTwo || "",
            premises: roa?.premises || "",
            locality: roa?.locality || "",
            region: roa?.region || "",
            country: roa?.country || "",
            postal_code: roa?.postalCode || ""
          }
        }
      };
    }

    return { limitedPartnership, errors };
  }

  private async getCompanyProfile(
    opt: { access_token: string; refresh_token: string },
    company_number: string
  ): Promise<{ companyProfile: Partial<CompanyProfile>; errors?: UIErrors }> {
    try {
      const companyProfile = await this.companyGateway.getCompanyProfile(opt, company_number);
      return { companyProfile };
    } catch (errors: any) {
      const { isValidationErrors } = extractAPIErrors(errors);

      logger.error(`Error retrieving Company profile: ${company_number} ${JSON.stringify(errors)}`);

      if (!isValidationErrors) {
        throw errors;
      }

      return {
        companyProfile: {},
        errors
      };
    }
  }

  private calculatePartnershipType(companyProfile: Partial<CompanyProfile>): PartnershipType | undefined {
    const pflpSubtype = "private-fund-limited-partnership";
    const jurisdiction = companyProfile.jurisdiction;
    const profileSubtype = companyProfile.subtype;

    if (
      (jurisdiction === Jurisdiction.ENGLAND_AND_WALES ||
        jurisdiction === Jurisdiction.NORTHERN_IRELAND) &&
      profileSubtype === pflpSubtype
    ) {
      return PartnershipType.PFLP;
    }

    if (jurisdiction === Jurisdiction.SCOTLAND && !profileSubtype) {
      return PartnershipType.SLP;
    }

    if (jurisdiction === Jurisdiction.SCOTLAND && profileSubtype === pflpSubtype) {
      return PartnershipType.SPFLP;
    }

    return PartnershipType.LP;
  }
}

export default CompanyService;
