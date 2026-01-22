import { createSummaryListLink } from "./change-link";
import { formatDate } from "./date-format";

const setDateOfUpdateSection = (props: Record<string, any>, i18n: Record<string, any>, dateChangeUrl: string) => {
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

export default setDateOfUpdateSection;
