import TransactionLimitedPartner from "../../../domain/entities/TransactionLimitedPartner";

export const limitedPartnerPerson = {
  forename: "Joe",
  surname: "Doe",
  date_of_birth: "2001-01-01",
  nationality1: "BRITISH",
  nationality2: undefined
};

export const limitedPartnerLegalEntity = {
  legal_entity_name: "My Company ltd",
  legal_form: "Limited Company",
  governing_law: "Act of law",
  legal_entity_register_name: "US Register",
  legal_entity_registration_location: "United States",
  registered_company_number: "12345678",
};

class LimitedPartnerBuilder {
  _id = "123456";
  data = {
    contribution_currency_type: "",
    contribution_currency_value: "",
    contribution_non_monetary_value: "",

    forename: "",
    surname: "",
    former_names: "",
    nationality1: "",
    nationality2: undefined,
    date_of_birth: "",

    governing_law: "",
    legal_entity_name: "",
    legal_entity_register_name: "",
    legal_entity_registration_location: "",
    legal_form: "",

    date_effective_from: "",
    etag: "",
    kind: "",
    principal_office_address: {
      postal_code: "ST6 3LJ",
      premises: "4",
      address_line_1: "line 1",
      address_line_2: "line 2",
      locality: "stoke-on-trent",
      region: "region",
      country: "england"
    },
    registered_company_number: "",
    resignation_date: "",
    usual_residential_address: {
      postal_code: "ST6 3LJ",
      premises: "4",
      address_line_1: "line 1",
      address_line_2: "line 2",
      locality: "stoke-on-trent",
      region: "region",
      country: "england"
    }
  };

  withId(id: string) {
    this["_id"] = id;
    return this;
  }

  withForename(forename: string) {
    this.data.forename = forename;
    return this;
  }

  withSurname(surname: string) {
    this.data.surname = surname;
    return this;
  }

  isPerson() {
    this.data = {
      ...this.data,
      ...limitedPartnerPerson
    };
    return this;
  }

  isLegalEntity() {
    this.data = {
      ...this.data,
      ...limitedPartnerLegalEntity
    };
    return this;
  }

  build(): TransactionLimitedPartner {
    return {
      _id: this["_id"],
      data: this.data
    };
  }
}

export default LimitedPartnerBuilder;
