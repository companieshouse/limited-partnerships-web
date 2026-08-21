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
