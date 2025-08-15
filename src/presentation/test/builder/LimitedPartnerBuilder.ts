import TransactionLimitedPartner from "../../../domain/entities/TransactionLimitedPartner";
import AbstractPartnerBuilder from "./AbstractPartnerBuilder";

export const limitedPartnerPerson = {
  forename: "Joe - LP",
  surname: "Doe - LP",
  date_of_birth: "2001-01-01",
  nationality1: "British",
  nationality2: undefined
};

export const limitedPartnerLegalEntity = {
  legal_entity_name: "My Company ltd - LP",
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
      ...this.data
    };
  }

  withDateOfBirth(dateOfBirth: string) {
    this.data.date_of_birth = dateOfBirth;
    return this;
  }

  withDateEffectiveFrom(dateEffectiveFrom: string) {
    this.data.date_effective_from = dateEffectiveFrom;
    return this;
  }

  withNotDisqualifiedStatementChecked(notDisqualifiedStatementChecked: boolean) {
    this.data.not_disqualified_statement_checked = notDisqualifiedStatementChecked;
    return this;
  }

  withContributionCurrencyType(contributionCurrencyType: string) {
    this.data.contribution_currency_type = contributionCurrencyType;
    return this;
  }

  withContributionCurrencyValue(contributionCurrencyValue: string) {
    this.data.contribution_currency_value = contributionCurrencyValue;
    return this;
  }

  withContributionSubtypes(contributionSubTypes: string[]) {
    this.data.contribution_sub_types = contributionSubTypes;
    return this;
  }

  isPerson() {
    this.data = {
      ...this.data,
      ...limitedPartnerPerson
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
