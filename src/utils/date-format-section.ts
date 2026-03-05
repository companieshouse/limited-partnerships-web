import { JourneyTypes } from "../domain/entities/journey";
import { createSummaryListLink } from "./change-link";
import { formatDate } from "./date-format";

export const setDateOfBirthSection = (partner: Record<string, any>, i18n: Record<string, any>) => {
  return {
    key: {
      text: i18n.checkYourAnswersPage.partners.person.dateOfBirth
    },
    value: {
      text: partner?.data?.date_of_birth ? formatDate(partner.data.date_of_birth, i18n) : ""
    }
  };
};

export const setDateEffectiveFromSection = (partner: Record<string, any>, type: string, journeyTypes: JourneyTypes, i18n: Record<string, any>) => {
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

export const setDateOfUpdateSection = (props: Record<string, any>, i18n: Record<string, any>, dateChangeUrl: string) => {
  const dateOfUpdate = props.data.limitedPartnership?.data?.date_of_update ?? props.data.partner?.data?.date_of_update;

  return {
    key: {
      text: i18n.checkYourAnswersPage.update.dateOfChange
    },
    value: {
      text: formatDate(dateOfUpdate, i18n)
    },
    actions: {
      items: [
        createSummaryListLink(
          i18n.checkYourAnswersPage.change,
          props.currentUrl.replace(props.pageType, dateChangeUrl),
          "",
          "change-partnership-date-of-update-button"
        )
      ]
    }
  };
};

export const setCeaseDateSection = (props: Record<string, any>, type: string, i18n: Record<string, any>, dateChangeUrl: string) => {
  const text =
    type === "generalPartner" ?
      i18n.checkYourAnswersPage.partners.generalPartners.ceaseDate
      : i18n.checkYourAnswersPage.partners.limitedPartners.ceaseDate;

  const dataEventId =
    type === "generalPartner" ? "remove-general-partner-name-button" : "remove-limited-partner-name-button";

  return {
    key: {
      text
    },
    value: {
      text: props.data.partner?.data?.cease_date ? formatDate(props.data.partner.data.cease_date, i18n) : ""
    },
    actions: {
      items: [
        createSummaryListLink(
          i18n.checkYourAnswersPage.change,
          props.currentUrl.replace(props.pageType, dateChangeUrl),
          "cease_date",
          dataEventId
        )
      ]
    }
  };
};
