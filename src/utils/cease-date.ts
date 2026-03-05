import { createSummaryListLink } from "./change-link";
import { formatDate } from "./date-format";

const setCeaseDate = (props: Record<string, any>, type: string, i18n: Record<string, any>, dateChangeUrl: string) => {
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

export default setCeaseDate;
