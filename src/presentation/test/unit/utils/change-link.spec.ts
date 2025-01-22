import { createSummaryListLink } from '../../../../utils/change-link';
import { EMAIL_URL } from "../../../controller/registration/url";

describe('createSummaryListLink test suite', () => {
  test('should check if the object returned is correct, and contains the change link configs', () => {
    const changeText = "Change";
    const changeLink = `${ EMAIL_URL }#email`;
    const changeHidddenText = "email hidden";
    const eventId = "change-email-button";
    const testChangeLinkConfig = createSummaryListLink(changeText, changeLink, changeHidddenText, eventId) as any;
    expect(testChangeLinkConfig.text).toEqual(changeText);
    expect(testChangeLinkConfig.href).toEqual(changeLink);
    expect(testChangeLinkConfig.visuallyHiddenText).toEqual(changeHidddenText);
    expect(testChangeLinkConfig.attributes['data-event-id']).toEqual(eventId);
  });
});
