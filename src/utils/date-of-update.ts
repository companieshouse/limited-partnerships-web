import { createSummaryListLink } from "./change-link";

const setDateOfUpdateSection = (props: Record<string, any>, i18n: Record<string, any>, dateChangeUrl: string) => ({
  key: {
    text: i18n.checkYourAnswersPage.update.dateOfChange
  },
  value: {
    text: props.data.limitedPartnership.data.date_of_update
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
});

export default setDateOfUpdateSection;
