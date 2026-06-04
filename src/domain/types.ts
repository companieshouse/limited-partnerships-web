export type Ids = {
  transactionId: string;
  submissionId: string;
  companyId: string;
  generalPartnerId: string;
  limitedPartnerId: string;
  personWithSignificantControlId: string;
  appointmentId: string;
};

export type Tokens = {
  access_token: string;
  refresh_token: string;
};

export enum PartnerType {
  generalPartner = "generalPartner",
  limitedPartner = "limitedPartner"
};

export enum PartnerEntityType {
  person = "person",
  legalEntity = "legalEntity"
};
