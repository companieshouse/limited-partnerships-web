import { formatDate } from "./date-format";

const setDateOfBirth = (partner: Record<string, any>, i18n: Record<string, any>) => {
  return {
    key: {
      text: i18n.checkYourAnswersPage.partners.person.dateOfBirth
    },
    value: {
      text: partner?.data?.date_of_birth ? formatDate(partner.data.date_of_birth, i18n) : ""
    }
  };
};

export default setDateOfBirth;
