import {
  NameEndingType,
  PartnershipType,
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import TransactionLimitedPartnership from "../../../domain/entities/TransactionLimitedPartnership";

class LimitedPartnershipBuilder {
  _id: string = "123456";
  data = {
    partnership_name: "partnership_name test",
    name_ending: NameEndingType.LIMITED_PARTNERSHIP,
    partnership_type: PartnershipType.LP,
    email: "test@email.com",
  };

  withId(id: string) {
    this["_id"] = id;
    return this;
  }

  withPartnershipName(name: string) {
    this.data.partnership_name = name;
    return this;
  }

  withNameEnding(ending: NameEndingType) {
    this.data.name_ending = ending;
    return this;
  }

  build(): TransactionLimitedPartnership {
    return {
      _id: this["_id"],
      data: this.data,
    };
  }
}

export default LimitedPartnershipBuilder;
