import {
  NameEndingType,
  PartnershipType,
  Jurisdiction,
  Term,
  Address
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import TransactionLimitedPartnership from "../../../domain/entities/TransactionLimitedPartnership";

class LimitedPartnershipBuilder {
  _id = "123456";
  data = {
    partnership_name: "partnership_name test",
    name_ending: NameEndingType.LIMITED_PARTNERSHIP,
    partnership_type: PartnershipType.LP,
    email: "test@email.com",
    jurisdiction: Jurisdiction.ENGLAND_AND_WALES,
    registered_office_address: {
      postal_code: "ST6 3LJ",
      premises: "4",
      address_line_1: "line 1",
      address_line_2: "line 2",
      locality: "stoke-on-trent",
      region: "region",
      country: "England"
    },
    principal_place_of_business_address: {
      postal_code: "DE6 3LJ",
      premises: "2",
      address_line_1: "line 3",
      address_line_2: "line 4",
      locality: "burton-on-trent",
      region: "regionPp",
      country: "England"
    },
    term: Term.BY_AGREEMENT,
    sic_codes: ["12345", "67890"]
  };

  withId(id: string) {
    this["_id"] = id;
    return this;
  }

  withPartnershipName(name: string) {
    this.data.partnership_name = name;
    return this;
  }

  withNameEnding(ending: NameEndingType) {
    this.data.name_ending = ending;
    return this;
  }

  withPartnershipType(partnershipType: PartnershipType) {
    this.data.partnership_type = partnershipType;
    return this;
  }

  withEmail(email: string) {
    this.data.email = email;
    return this;
  }

  withJurisdiction(jurisdiction: Jurisdiction) {
    this.data.jurisdiction = jurisdiction;
    return this;
  }

  withRegisteredOfficeAddress(address: Address) {
    this.data.registered_office_address = address as any;
    return this;
  }

  withPrincipalPlaceOfBusinessAddress(address: Address) {
    this.data.principal_place_of_business_address = address as any;
    return this;
  }

  withTerm(term: Term) {
    this.data.term = term;
    return this;
  }

  withSicCodes(sicCodes: string[]) {
    this.data.sic_codes = sicCodes;
    return this;
  }

  build(): TransactionLimitedPartnership {
    return {
      _id: this["_id"],
      data: this.data
    };
  }
}

export default LimitedPartnershipBuilder;
