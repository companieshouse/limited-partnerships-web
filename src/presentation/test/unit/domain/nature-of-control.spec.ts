import NatureOfControlBuilder from "../../builder/NatureOfControlBuilder";
import enTranslationText from "../../../../../locales/en/errors.json";
import NatureOfControlValidator, { NatureOfControlUIFields } from "../../../../domain/validator/NatureOfControlValidator";

describe("Nature of Control", () => {
  describe("Individual", () => {
    it.each([
      [ new NatureOfControlBuilder().withShareOfAssets25To50().withVotingRightsDoesNotApply().build()],
      [ new NatureOfControlBuilder().withShareOfAssetsDoesNotApply().withVotingRights50To75().build()],
      [ new NatureOfControlBuilder().withShareOfAssets50To75().withVotingRights75To100().build()],
      [ new NatureOfControlBuilder().withShareOfAssetsDoesNotApply().withVotingRightsDoesNotApply().withRightToAppointmentAndRemove().build() ],
      [ new NatureOfControlBuilder().withShareOfAssetsDoesNotApply().withVotingRightsDoesNotApply().withSignificantInfluenceControl().build() ],
      [ new NatureOfControlBuilder().withShareOfAssets25To50().withVotingRightsDoesNotApply().withRightToAppointmentAndRemove().build() ],
      [ new NatureOfControlBuilder().withShareOfAssetsDoesNotApply().withVotingRights75To100().withRightToAppointmentAndRemove().build() ],
      [ new NatureOfControlBuilder().withShareOfAssets75To100().withVotingRights50To75().withRightToAppointmentAndRemove().build() ],
    ])("Valid combination - should not return a validation error", (natureOfControl: NatureOfControlUIFields) => {
      const validator = new NatureOfControlValidator().set(natureOfControl, enTranslationText);
      const uiErrors = validator.runValidation();
      expect(uiErrors.hasErrors()).toBe(false);
    });

    it.each([
      [ new NatureOfControlBuilder().build()],
      [ new NatureOfControlBuilder().withShareOfAssets25To50().withVotingRights25To50().withRightToAppointmentAndRemove().withSignificantInfluenceControl().build()],
      [ new NatureOfControlBuilder().withShareOfAssetsDoesNotApply().withVotingRights50To75().withRightToAppointmentAndRemove().withSignificantInfluenceControl().build()],
      [ new NatureOfControlBuilder().withRightToAppointmentAndRemove().withSignificantInfluenceControl().build()],
      [ new NatureOfControlBuilder().withVotingRights75To100().withRightToAppointmentAndRemove().withSignificantInfluenceControl().build()],
      [ new NatureOfControlBuilder().withShareOfAssets50To75().withRightToAppointmentAndRemove().withSignificantInfluenceControl().build()],
      [ new NatureOfControlBuilder().withShareOfAssets75To100().withVotingRights75To100().withSignificantInfluenceControl().build()],
      [ new NatureOfControlBuilder().withShareOfAssets25To50().withVotingRightsDoesNotApply().withSignificantInfluenceControl().build()],
      [ new NatureOfControlBuilder().withShareOfAssetsDoesNotApply().withVotingRights25To50().withSignificantInfluenceControl().build()],
      [ new NatureOfControlBuilder().withVotingRightsDoesNotApply().withSignificantInfluenceControl().build()],
      [ new NatureOfControlBuilder().withShareOfAssets50To75().withSignificantInfluenceControl().build()],
      [ new NatureOfControlBuilder().withShareOfAssetsDoesNotApply().build()],
      [ new NatureOfControlBuilder().withVotingRightsDoesNotApply().build()],
      [ new NatureOfControlBuilder().withSignificantInfluenceControl().build()],
      [ new NatureOfControlBuilder().withRightToAppointmentAndRemove().build()],
      [ new NatureOfControlBuilder().withShareOfAssetsDoesNotApply().withVotingRightsDoesNotApply().build()],
      [ new NatureOfControlBuilder().withShareOfAssetsDoesNotApply().withSignificantInfluenceControl().build()],
      [ new NatureOfControlBuilder().withVotingRightsDoesNotApply().withSignificantInfluenceControl().build()],
      [ new NatureOfControlBuilder().withShareOfAssetsDoesNotApply().withRightToAppointmentAndRemove().build()],
      [ new NatureOfControlBuilder().withVotingRightsDoesNotApply().withRightToAppointmentAndRemove().build()],
    ])("Invalid combination - should return a validation error", (natureOfControl: NatureOfControlUIFields) => {
      const validator = new NatureOfControlValidator().set(natureOfControl, enTranslationText);
      const uiErrors = validator.runValidation();
      expect(uiErrors.hasErrors()).toBe(true);
    });
  });
});
