import TransactionPersonWithSignificantControl from "../../../domain/entities/TransactionPersonWithSignificantControl";

const personWithSignificantControlRelevantLegalEntity = {
  legal_entity_name: "My Company ltd - RLE",
  legal_form: "Limited Company",
  governing_law: "Act of law",
  legal_entity_register_name: "US Register",
  legal_entity_registration_location: "United States",
  registered_company_number: "12345678"
};

const personWithSignificantControlOtherRegistrablePerson = {
  legal_entity_name: "My Company ltd - ORP",
  legal_form: "Limited Company",
  governing_law: "Act of law"
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

  isRelevantLegalEntity() {
    this.data = {
      ...this.data,
      ...personWithSignificantControlRelevantLegalEntity
    };
    return this;
  }

  isOtherRegistrablePerson() {
    this.data = {
      ...this.data,
      ...personWithSignificantControlOtherRegistrablePerson
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
