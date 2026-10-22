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

export const expectCapitalContributionSection = (
  html: string,
  translationText: Record<string, any>,
  isPresent: boolean
): void => {
  const { title, currencyTypeLabel, valueLabel, compositionTitle } = translationText.partner.capitalContribution;

  [title, currencyTypeLabel, valueLabel, compositionTitle].forEach((text: string) => {
    if (isPresent) {
      expect(html).toContain(toEscapedHtml(text));
    } else {
      expect(html).not.toContain(toEscapedHtml(text));
    }
  });
};
