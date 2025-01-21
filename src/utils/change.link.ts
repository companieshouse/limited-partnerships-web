export const createSummaryListLink = (
  text: string,
  href: string,
  hiddenText: string,
  dataEventId: string,
): Record<string, unknown> => {
  return {
    href,
    text: text,
    attributes: {
      'data-event-id': dataEventId
    },
    visuallyHiddenText: hiddenText,
  };
};

