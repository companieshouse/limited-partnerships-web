abstract class AbstractPartnerBuilder {
  _id = "123456";
  data: Record<string, any> = {
    completed: true,
    appointment_id: "",

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

    principal_office_address: {
      postal_code: "ST6 3LJ",
      premises: "4",
      address_line_1: "principal office address line 1",
      address_line_2: "line 2",
      locality: "stoke-on-trent",
      region: "region",
      country: "England"
    },
    registered_company_number: "",
    resignation_date: "",
    usual_residential_address: {
      postal_code: "ST6 3LJ",
      premises: "4",
      address_line_1: "usual residential address line 1",
      address_line_2: "line 2",
      locality: "stoke-on-trent",
      region: "region",
      country: "England"
    },
    service_address: undefined,

    cease_date: "",

    etag: "",
    kind: "",
    update_usual_residential_address_required: undefined,
    update_service_address_required: undefined
  };

  withId(id: string) {
    this["_id"] = id;
    return this;
  }

  withAppointmentId(appointmentId: string) {
    this.data.appointment_id = appointmentId;
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

  withCompleted(completed: boolean) {
    this.data.completed = completed;
    return this;
  }

  withPrincipalOfficeAddress(principalOfficeAddress: Record<string, any> | null) {
    this.data.principal_office_address = principalOfficeAddress;
    return this;
  }

  withUsualResidentialAddress(usualResidentialAddress: Record<string, any> | null) {
    this.data.usual_residential_address = usualResidentialAddress;
    return this;
  }

  withUsualResidentialAddressUpdateRequired(updateRequired: boolean) {
    this.data.update_usual_residential_address_required = updateRequired;
    return this;
  }

  withServiceAddress(serviceAddress: Record<string, any> | null) {
    this.data.service_address = serviceAddress;
    return this;
  }

  withServiceAddressUpdateRequired(updateRequired: boolean) {
    this.data.update_service_address_required = updateRequired;
    return this;
  }

  withCeaseDate(ceaseDate: string) {
    this.data.cease_date = ceaseDate;
    return this;
  }

  withNationality1(nationality1: string) {
    this.data.nationality1 = nationality1;
    return this;
  }

  withNationality2(nationality2: string) {
    this.data.nationality2 = nationality2;
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

}

export default AbstractPartnerBuilder;
