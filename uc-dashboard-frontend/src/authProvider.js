import { MsalAuthProvider, LoginType } from 'react-aad-msal';
import { msalConfig } from './authConfig';

export const authProvider = new MsalAuthProvider({
    auth: {
        authority: msalConfig.auth.authority,
        clientId: msalConfig.auth.clientId,
        postLogoutRedirectUri: window.location.origin,
        redirectUri: window.location.origin,
        validateAuthority: true,
        navigateToLoginRequestUrl: true,
      },
      cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: true,
      },
    },
    {
      scopes: ["User.Read"]
    },
    LoginType.Redirect,
  );