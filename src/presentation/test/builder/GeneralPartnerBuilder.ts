import TransactionGeneralPartner from "../../../domain/entities/TransactionGeneralPartner";
import AbstractPartnerBuilder from "./AbstractPartnerBuilder";

export const generalPartnerPerson = {
  forename: "Joe - GP",
  surname: "Doe - GP",
  date_of_birth: "2001-01-01",
  nationality1: "British",
  nationality2: undefined
};

export const generalPartnerLegalEntity = {
  legal_entity_name: "My Company ltd - GP",
  legal_form: "Limited Company",
  governing_law: "Act of law",
  legal_entity_register_name: "US Register",
  legal_entity_registration_location: "United States",
  registered_company_number: "12345678",
};

class GeneralPartnerBuilder extends AbstractPartnerBuilder {
  constructor() {
    super();
    this.init();
  }

  init() {
    this.data = {
      ...this.data
    };
  }

  withDateEffectiveFrom(dateEffectiveFrom: string) {
    this.data.date_effective_from = dateEffectiveFrom;
    return this;
  }

  withNotDisqualifiedStatementChecked(notDisqualifiedStatementChecked: boolean) {
    this.data.not_disqualified_statement_checked = notDisqualifiedStatementChecked;
    return this;
  }

  withServiceAddress() {
    this.data.service_address = {
      postal_code: "ST6 3LJ",
      premises: "4",
      address_line_1: "service address line 1",
      address_line_2: "line 2",
      locality: "stoke-on-trent",
      region: "region",
      country: "England"
    };
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

  withNationality1(nationality1: string): this {
    this.data.nationality1 = nationality1;
    return this;
  }

  withNationality2(nationality2: string): this {
    this.data.nationality2 = nationality2;
    return this;
  }

  withDateOfUpdate(date: string): this {
    this.data.date_of_update = date;
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
