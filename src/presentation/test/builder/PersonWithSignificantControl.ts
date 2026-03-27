import TransactionPersonWithSignificantControl from "../../../domain/entities/TransactionPersonWithSignificantControl";

export const personWithSignificantControlRelevantLegalEntity = {
  legal_entity_name: "My Company ltd - GP",
  legal_form: "Limited Company",
  governing_law: "Act of law",
  legal_entity_register_name: "US Register",
  legal_entity_registration_location: "United States",
  registered_company_number: "12345678"
};

class PersonWithSignificantControlBuilder {
  _id = "123456";
  data: Record<string, any> = {
    completed: true,
    appointment_id: "",

    governing_law: "",
    legal_entity_name: "",
    legal_entity_register_name: "",
    legal_entity_registration_location: "",
    legal_form: "",
    registered_company_number: "",

    principal_office_address: {
      postal_code: "ST6 3LJ",
      premises: "4",
      address_line_1: "principal office address line 1",
      address_line_2: "line 2",
      locality: "stoke-on-trent",
      region: "region",
      country: "England"
    },

    etag: "",
    kind: ""
  };

  withId(id: string) {
    this["_id"] = id;
    return this;
  }

  withAppointmentId(appointmentId: string) {
    this.data.appointment_id = appointmentId;
    return this;
  }

  withCompleted(completed: boolean) {
    this.data.completed = completed;
    return this;
  }

  withPrincipalOfficeAddress(principalOfficeAddress: Record<string, any> | null) {
    this.data.principal_office_address = principalOfficeAddress;
    return this;
  }

  withLegalEntityRegistrationLocation(legalEntityRegistrationLocation: string) {
    this.data.legal_entity_registration_location = legalEntityRegistrationLocation;
    return this;
  }

  withKind(kind: string) {
    this.data.kind = kind;
    return this;
  }

  withLegalEntityName(legalEntityName: string): this {
    this.data.legal_entity_name = legalEntityName;
    return this;
  }

  withLegalForm(legalForm: string): this {
    this.data.legal_form = legalForm;
    return this;
  }

  withGoverningLaw(governingLaw: string): this {
    this.data.governing_law = governingLaw;
    return this;
  }

  withLegalEntityRegisterName(legalEntityRegisterName: string): this {
    this.data.legal_entity_register_name = legalEntityRegisterName;
    return this;
  }

  withRegistrationNumber(registeredCompanyNumber: string): this {
    this.data.registered_company_number = registeredCompanyNumber;
    return this;
  }

  isRelevantLegalEntity() {
    this.data = {
      ...this.data,
      ...personWithSignificantControlRelevantLegalEntity
    };
    return this;
  }

  build(): TransactionPersonWithSignificantControl {
    return {
      _id: this["_id"],
      data: this.data
    };
  }
}

export default PersonWithSignificantControlBuilder;
