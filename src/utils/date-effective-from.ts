import { JourneyTypes } from "../domain/entities/journey";
import { formatDate } from "./date-format";

const setDateEffectiveFrom = (partner: Record<string, any>, type: string, journeyTypes: JourneyTypes, i18n: Record<string, any>) => {
  const text =
    type === "generalPartner" ?
      i18n.checkYourAnswersPage.partners.generalPartners.dateEffectiveFrom
      : i18n.checkYourAnswersPage.partners.limitedPartners.dateEffectiveFrom;

  return journeyTypes.isPostTransition ? {
    key: {
      text
    },
    value: {
      text: partner?.data?.date_effective_from ? formatDate(partner.data.date_effective_from, i18n) : ""
    }
  } : null;
};

export default setDateEffectiveFrom;
