import TransactionGeneralPartner from "../../../domain/entities/TransactionGeneralPartner";
import AbstractPartnerBuilder from "./AbstractPartnerBuilder";

export const generalPartnerPerson = {
  forename: "Joe",
  surname: "Doe",
  date_of_birth: "2001-01-01",
  nationality1: "BRITISH",
  nationality2: undefined
};

export const generalPartnerLegalEntity = {
  legal_entity_name: "My Company ltd",
  legal_form: "Limited Company",
  governing_law: "Act of law",
  legal_entity_register_name: "US Register",
  legal_entity_registration_location: "United States",
  registered_company_number: "12345678",
  not_disqualified_statement_checked: true
};

class GeneralPartnerBuilder extends AbstractPartnerBuilder {
  constructor() {
    super();
    this.init();
  }

  init() {
    this.data = {
      ...this.data,

      not_disqualified_statement_checked: true,
      legal_personality_statement_checked: true,

      service_address: {
        postal_code: "ST6 3LJ",
        premises: "4",
        address_line_1: "line 1",
        address_line_2: "line 2",
        locality: "stoke-on-trent",
        region: "region",
        country: "England"
      }
    };
  }

  withNotDisqualifiedStatementChecked(notDisqualifiedStatementChecked: boolean) {
    this.data.not_disqualified_statement_checked = notDisqualifiedStatementChecked;
    return this;
  }

  withLegalPersonalityStatementChecked(legalPersonalityStatementChecked: boolean) {
    this.data.legal_personality_statement_checked = legalPersonalityStatementChecked;
    return this;
  }

  withServiceAddress(serviceAddress: Record<string, any>) {
    this.data.service_address = serviceAddress;
    return this;
  }

  isPerson() {
    this.data = {
      ...this.data,
      ...generalPartnerPerson
    };
    return this;
  }

  withPreviousName(previousName: string) {
    this.data.previous_name = previousName;
    return this;
  }

  isLegalEntity() {
    this.data = {
      ...this.data,
      ...generalPartnerLegalEntity
    };
    return this;
  }

  build(): TransactionGeneralPartner {
    return {
      _id: this["_id"],
      data: this.data
    };
  }
}

export default GeneralPartnerBuilder;
