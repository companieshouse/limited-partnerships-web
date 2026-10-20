import { NatureOfControl, NatureOfControlType, PersonWithSignificantControlType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

export const setNatureOfControlSection = (item: Record<string, any>, i18n: Record<string, any>) => {
  let pscType = "individual";
  if (item.data.type === PersonWithSignificantControlType.RELEVANT_LEGAL_ENTITY) {
    pscType = "rle";
  } else if (item.data.type === PersonWithSignificantControlType.OTHER_REGISTRABLE_PERSON) {
    pscType = "orp";
  }

  let htmlText = "";

  const naturesOfControl = [
    NatureOfControlType.INDIVIDUAL,
    NatureOfControlType.FIRM,
    NatureOfControlType.TRUST,
  ].flatMap((type) =>
    item.data.natures_of_control.filter((nature: NatureOfControl) => nature.type === type)
  );

  naturesOfControl.forEach((nature: NatureOfControl) => {
    let natureOfControlType = "individualControl";
    if (nature.type === NatureOfControlType.FIRM) {
      natureOfControlType = "controlOverFirm";
    } else if (nature.type === NatureOfControlType.TRUST) {
      natureOfControlType = "controlOverTrust";
    }

    htmlText += "<p class=\"govuk-body\">" + i18n.checkYourAnswersPage.psc.natureOfControl[pscType][natureOfControlType] + "</p>"
      + "<ul class=\"govuk-list govuk-list--bullet\">"
      + (nature.share_of_assets_25_to_50 ? "<li>" + i18n.checkYourAnswersPage.psc.natureOfControl.shares.moreThan25 + "</li>" : "")
      + (nature.share_of_assets_50_to_75 ? "<li>" + i18n.checkYourAnswersPage.psc.natureOfControl.shares.moreThan50 + "</li>" : "")
      + (nature.share_of_assets_75_to_100 ? "<li>" + i18n.checkYourAnswersPage.psc.natureOfControl.shares.moreThan75 + "</li>" : "")
      + (nature.voting_rights_25_to_50 ? "<li>" + i18n.checkYourAnswersPage.psc.natureOfControl.votingRights.moreThan25 + "</li>" : "")
      + (nature.voting_rights_50_to_75 ? "<li>" + i18n.checkYourAnswersPage.psc.natureOfControl.votingRights.moreThan50 + "</li>" : "")
      + (nature.voting_rights_75_to_100 ? "<li>" + i18n.checkYourAnswersPage.psc.natureOfControl.votingRights.moreThan75 + "</li>" : "")
      + (nature.right_to_appointment_and_remove ? "<li>" + i18n.checkYourAnswersPage.psc.natureOfControl.appointOrRemoveManagement + "</li>" : "")
      + (nature.significant_influence_control ? "<li>" + i18n.checkYourAnswersPage.psc.natureOfControl.significantInfluenceOrControl + "</li>" : "")
      + "</ul>";
  });

  return {
    key: {
      text: i18n.checkYourAnswersPage.psc.natureOfControl.title,
    },
    value: {
      html: htmlText
    },
  };
};
