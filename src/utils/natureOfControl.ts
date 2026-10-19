import { NatureOfControlType, PersonWithSignificantControlType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

export const setNatureOfControlSection = (item: Record<string, any>, i18n: Record<string, any>) => {
  let pscType = "individual";
  if (item.data.type === PersonWithSignificantControlType.RELEVANT_LEGAL_ENTITY) {
    pscType = "rle";
  } else if (item.data.type === PersonWithSignificantControlType.OTHER_REGISTRABLE_PERSON) {
    pscType = "orp";
  }

  let natureOfControl = "individualControl";
  if (item.data.nature_of_control_types.includes(NatureOfControlType.FIRM)) {
    natureOfControl = "controlOverFirm";
  } else if (item.data.nature_of_control_types.includes(NatureOfControlType.TRUST)) {
    natureOfControl = "controlOverTrust";
  }
  const natureOfControlItems = item.data.natures_of_control[0];

  return {
    key: {
      text: i18n.checkYourAnswersPage.psc.natureOfControl.title,
    },
    value: {
      html: "<p class=\"govuk-body\">" + i18n.checkYourAnswersPage.psc.natureOfControl[pscType][natureOfControl] + "</p>"
        + "<ul class=\"govuk-list govuk-list--bullet\">"
          + (natureOfControlItems.share_of_assets_25_to_50 ? "<li>" + i18n.checkYourAnswersPage.psc.natureOfControl.shares.moreThan25 + "</li>" : "")
          + (natureOfControlItems.share_of_assets_50_to_75 ? "<li>" + i18n.checkYourAnswersPage.psc.natureOfControl.shares.moreThan50 + "</li>" : "")
          + (natureOfControlItems.share_of_assets_75_to_100 ? "<li>" + i18n.checkYourAnswersPage.psc.natureOfControl.shares.moreThan75 + "</li>" : "")
          + (natureOfControlItems.voting_rights_25_to_50 ? "<li>" + i18n.checkYourAnswersPage.psc.natureOfControl.votingRights.moreThan25 + "</li>" : "")
          + (natureOfControlItems.voting_rights_50_to_75 ? "<li>" + i18n.checkYourAnswersPage.psc.natureOfControl.votingRights.moreThan50 + "</li>" : "")
          + (natureOfControlItems.voting_rights_75_to_100 ? "<li>" + i18n.checkYourAnswersPage.psc.natureOfControl.votingRights.moreThan75 + "</li>" : "")
          + (natureOfControlItems.right_to_appointment_and_remove ? "<li>" + i18n.checkYourAnswersPage.psc.natureOfControl.appointOrRemoveManagement + "</li>" : "")
          + (natureOfControlItems.significant_influence_control ? "<li>" + i18n.checkYourAnswersPage.psc.natureOfControl.significantInfluenceOrControl + "</li>" : "")
        + "</ul>"
    },
  };
};
