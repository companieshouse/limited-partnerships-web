type CapitalContribution = {
  contribution_currency_type?: string;
  contribution_currency_value?: string;
  contribution_sub_types?: string[] | string;
};

const toSortedList = (subTypes?: string[] | string): string[] =>
  [subTypes ?? []].flat().sort((x, y) => x.localeCompare(y));

const haveSameSubTypes = (partnerSubTypes?: string[] | string, appointmentSubTypes?: string[] | string): boolean => {
  const sortedPartnerSubTypes = toSortedList(partnerSubTypes);
  const sortedAppointmentSubTypes = toSortedList(appointmentSubTypes);

  return (
    sortedPartnerSubTypes.length === sortedAppointmentSubTypes.length &&
    sortedPartnerSubTypes.every((value, index) => value === sortedAppointmentSubTypes[index])
  );
};

export const hasCapitalContributionChanged = (
  partner?: CapitalContribution,
  appointment?: CapitalContribution
): boolean => {
  return (
    partner?.contribution_currency_type !== appointment?.contribution_currency_type ||
    partner?.contribution_currency_value !== appointment?.contribution_currency_value ||
    !haveSameSubTypes(partner?.contribution_sub_types, appointment?.contribution_sub_types)
  );
};
