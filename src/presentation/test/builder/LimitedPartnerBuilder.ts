import TransactionLimitedPartner from "../../../domain/entities/TransactionLimitedPartner";
import AbstractPartnerBuilder from "./AbstractPartnerBuilder";

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
  registered_company_number: "12345678"
};

class LimitedPartnerBuilder extends AbstractPartnerBuilder {
  constructor() {
    super();
    this.init();
  }

  init() {
    this.data = {
      ...this.data,

      contribution_currency_type: "",
      contribution_currency_value: "",
      contribution_non_monetary_value: ""
    };
  }

  withContributionCurrencyType(contributionCurrencyType: string) {
    this.data.contribution_currency_type = contributionCurrencyType;
    return this;
  }

  withContributionCurrencyValue(contributionCurrencyValue: string) {
    this.data.contribution_currency_value = contributionCurrencyValue;
    return this;
  }

  withContributionNonMonetaryValue(contributionNonMonetaryValue: string) {
    this.data.contribution_non_monetary_value = contributionNonMonetaryValue;
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
