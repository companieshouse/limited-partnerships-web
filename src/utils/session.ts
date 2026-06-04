import { SessionKey } from '@companieshouse/node-session-handler/lib/session/keys/SessionKey';
import { SignInInfoKeys } from '@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys';
import { UserProfileKeys } from '@companieshouse/node-session-handler/lib/session/keys/UserProfileKeys';
import { ISignInInfo } from '@companieshouse/node-session-handler/lib/session/model/SessionInterfaces';

interface ISession {
  data?: {
    [SessionKey.SignInInfo]?: ISignInInfo;
  };
}

const getSignInInfo = (session: ISession): ISignInInfo | undefined => {
  return session?.data?.[SessionKey.SignInInfo];
};

export const getLoggedInUserEmail = (session: ISession): string => {
  const signInInfo = getSignInInfo(session);
  return signInInfo?.[SignInInfoKeys.UserProfile]?.[UserProfileKeys.Email] as string;
};

export const checkUserSignedIn = (session: ISession): boolean => {
  const signInInfo = getSignInInfo(session);
  return signInInfo?.[SignInInfoKeys.SignedIn] === 1;
};

export const getLoggedInAcspNumber = (session: ISession): string => {
  const signInInfo = getSignInInfo(session);
  return signInInfo?.[SignInInfoKeys.AcspNumber] as string;
};
