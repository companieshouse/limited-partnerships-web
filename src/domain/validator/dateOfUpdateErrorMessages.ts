import PostTransitionPageType from "../../presentation/controller/postTransition/pageType";

// keys correspond to entries under errorMessages.dateOfUpdate.changeType in the i18n files
const changeTypeMap = new Map<PostTransitionPageType, string>([
  [PostTransitionPageType.whenDidThePartnershipNameChange, "partnershipName"],
  [PostTransitionPageType.whenDidTheRegisteredOfficeAddressChange, "registeredOfficeAddress"],
  [PostTransitionPageType.whenDidThePrincipalPlaceOfBusinessAddressChange, "principalPlaceOfBusinessAddress"],
  [PostTransitionPageType.whenDidTheTermChange, "term"],
  [PostTransitionPageType.whenDidGeneralPartnerPersonDetailsChange, "generalPartnerPerson"],
  [PostTransitionPageType.whenDidGeneralPartnerLegalEntityDetailsChange, "generalPartnerLegalEntity"],
  [PostTransitionPageType.whenDidLimitedPartnerPersonDetailsChange, "limitedPartnerPerson"],
  [PostTransitionPageType.whenDidLimitedPartnerLegalEntityDetailsChange, "limitedPartnerLegalEntity"]
]);

// resolves the {change-type} placeholder in errorMessages.dateOfUpdate against the translated text for the given page type
export const buildDateOfUpdateErrorMessages = (pageType: string, i18n: any): Record<string, string> => {
  const dateOfUpdateMessages: Record<string, any> = i18n?.errorMessages?.dateOfUpdate ?? {};
  const changeTypeKey = changeTypeMap.get(pageType as PostTransitionPageType);
  const changeTypeText = changeTypeKey ? dateOfUpdateMessages?.changeType?.[changeTypeKey] : "";

  return Object.fromEntries(
    Object.entries(dateOfUpdateMessages)
      .filter(([key]) => key !== "changeType")
      .map(([key, value]) => [key, String(value).replace("{change-type}", changeTypeText)])
  );
};
