import TransactionGeneralPartner from "../../../domain/entities/TransactionGeneralPartner";
import AbstractPartnerBuilder from "./AbstractPartnerBuilder";

export const generalPartnerPerson = {
  forename: "Joe - GP",
  surname: "Doe - GP",
  date_of_birth: "2001-01-01",
  nationality1: "BRITISH",
  nationality2: undefined
};

export const generalPartnerLegalEntity = {
  legal_entity_name: "My Company ltd - GP",
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

      service_address: {
        postal_code: "ST6 3LJ",
        premises: "4",
        address_line_1: "service address line 1",
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

  withServiceAddress(serviceAddress: Record<string, any> | null) {
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

  withFormerNames(formerNames: string) {
    this.data.former_names = formerNames;
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
