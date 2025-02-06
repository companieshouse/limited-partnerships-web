// to be removed to use sdk type
type Address = {
  address_line_1: string;
  address_line_2?: string;
  country: string;
  locality: string;
  postal_code: string;
  premises: string;
  region?: string;
};

export default Address;
