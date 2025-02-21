// TODO Remove after this interface is added to the SDK

type GeneralPartner = {
  _id?: string;
  first_name: string;
  last_name: string;
  previous_name?: string;
  dob_day: string;
  dob_month: string;
  dob_year: string;
  nationality: string;
  disqualification_statement: boolean;
};

export default GeneralPartner;
