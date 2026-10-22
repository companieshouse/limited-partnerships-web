import { toEscapedHtml } from "../../utils";

export const getServiceTitle = (
  serviceTitleTranslationKey: string | { serviceName: string },
  translationText: Record<string, any>
): string =>
  typeof serviceTitleTranslationKey === "string" ?
    translationText[serviceTitleTranslationKey]
    : translationText.serviceName[serviceTitleTranslationKey.serviceName];

export const isPostTransition = (
  serviceTitleTranslationKey: string | { serviceName: string }
): boolean => typeof serviceTitleTranslationKey !== "string";

const getCapitalContributionTexts = (translationText: Record<string, any>): string[] => {
  const { title, currencyTypeLabel, valueLabel, compositionTitle } = translationText.partner.capitalContribution;
  return [title, currencyTypeLabel, valueLabel, compositionTitle].map(toEscapedHtml);
};

export const expectCapitalContributionSectionShown = (html: string, translationText: Record<string, any>): void => {
  getCapitalContributionTexts(translationText).forEach((text) => expect(html).toContain(text));
};

export const expectCapitalContributionSectionHidden = (html: string, translationText: Record<string, any>): void => {
  getCapitalContributionTexts(translationText).forEach((text) => expect(html).not.toContain(text));
};
