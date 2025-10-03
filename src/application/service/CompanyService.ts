import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import {
  Jurisdiction,
  LimitedPartnership,
  PartnershipType,
  Term
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import { logger } from "../../utils";
import ICompanyGateway from "../../domain/ICompanyGateway";
import UIErrors from "../../domain/entities/UIErrors";
import { extractAPIErrors } from "./utils";
import { CompanyOfficer } from "@companieshouse/api-sdk-node/dist/services/company-officers/types";

type DataIncludingPartners = {
  data: LimitedPartnership["data"] & { partners?: CompanyOfficer[]; limitedPartners?: CompanyOfficer[] };
};

class CompanyService {
  constructor(private readonly companyGateway: ICompanyGateway) {}

  public async buildLimitedPartnershipFromCompanyProfile(
    opt: { access_token: string; refresh_token: string },
    company_number: string
  ): Promise<{
    limitedPartnership: Partial<LimitedPartnership & DataIncludingPartners>;
    errors?: UIErrors;
  }> {
    const { companyProfile, errors } = await this.getCompanyProfile(opt, company_number);
    let limitedPartnership: Partial<LimitedPartnership & DataIncludingPartners> = {};

    if (companyProfile.companyName) {
      const partners = await this.getPartners(errors, opt, company_number);

      const roa = companyProfile.registeredOfficeAddress;
      const ppob = companyProfile.serviceAddress;

      limitedPartnership = {
        data: {
          partnership_name: companyProfile.companyName,
          partnership_number: companyProfile.companyNumber,
          partnership_type: this.calculatePartnershipType(companyProfile),
          jurisdiction: companyProfile.jurisdiction as Jurisdiction,
          term: this.mapPartnershipTerm(companyProfile),
          registered_office_address: this.mapAddress(roa),
          principal_place_of_business_address: this.mapAddress(ppob),
          ...partners
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

  // to be removed - temporary methods - start
  private async getPartners(
    errors: UIErrors | undefined,
    opt: { access_token: string; refresh_token: string },
    company_number: string
  ) {
    const { companyOfficers, errors: officersErrors } = await this.getCompanyOfficers(opt, company_number);
    errors?.errors.errorList.push(...(officersErrors?.errors.errorList || []));

    const partners = {
      generalPartners:
        this.addAppointmentId(companyOfficers, company_number).filter(
          (officer) => officer.officerRole === "general-partner-in-a-limited-partnership"
        ) || [],
      limitedPartners:
        this.addAppointmentId(companyOfficers, company_number).filter(
          (officer) => officer.officerRole === "limited-partner-in-a-limited-partnership"
        ) || []
    };
    return partners;
  }

  private addAppointmentId(companyOfficers: CompanyOfficer[], company_number: string): CompanyOfficer[] {
    return companyOfficers.map((officer) => {
      let appointment_id = "";

      if (officer?.links?.self.includes(company_number)) {
        appointment_id = officer.links.self.split("/").pop() || "";
      }

      return { ...officer, appointment_id };
    });
  }

  private async getCompanyOfficers(
    opt: { access_token: string; refresh_token: string },
    company_number: string
  ): Promise<{ companyOfficers: CompanyOfficer[]; errors?: UIErrors }> {
    try {
      const companyOfficers = await this.companyGateway.getCompanyOfficers(opt, company_number);
      return { companyOfficers: companyOfficers?.items || [] };
    } catch (errors: any) {
      const { isValidationErrors } = extractAPIErrors(errors);

      logger.error(`Error retrieving Company officers: ${company_number} ${JSON.stringify(errors)}`);

      if (!isValidationErrors) {
        throw errors;
      }

      return {
        companyOfficers: [],
        errors
      };
    }
  }
  // to be removed - temporary methods - end

  private calculatePartnershipType(companyProfile: Partial<CompanyProfile>): PartnershipType | undefined {
    const isCompanyInTransition =
      !companyProfile.subtype ||
      companyProfile.subtype === "" ||
      companyProfile.subtype === "private-fund-limited-partnership";

    if (isCompanyInTransition) {
      return this.calculatePartnershipTypeTransition(companyProfile);
    }

    return PartnershipType[companyProfile.subtype?.toUpperCase() ?? ""];
  }

  private calculatePartnershipTypeTransition(companyProfile: Partial<CompanyProfile>): PartnershipType | undefined {
    const pflpSubtype = "private-fund-limited-partnership";
    const jurisdiction = companyProfile.jurisdiction;
    const profileSubtype = companyProfile.subtype;

    if (
      (jurisdiction === Jurisdiction.ENGLAND_AND_WALES || jurisdiction === Jurisdiction.NORTHERN_IRELAND) &&
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

  private mapPartnershipTerm(companyProfile: Partial<CompanyProfile>): Term | undefined {
    const profileTerm = companyProfile?.term ? companyProfile.term.replace(/-/g, "_").toUpperCase() : "";

    return Term[profileTerm];
  }

  private mapAddress(address) {
    return {
      address_line_1: address?.addressLineOne ?? "",
      address_line_2: address?.addressLineTwo ?? "",
      premises: address?.premises ?? "",
      locality: address?.locality ?? "",
      region: address?.region ?? "",
      country: address?.country ?? "",
      postal_code: address?.postalCode ?? ""
    };
  }
}

export default CompanyService;
