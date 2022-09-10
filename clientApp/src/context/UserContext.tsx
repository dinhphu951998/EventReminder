import { useAuth0 } from "@auth0/auth0-react";
import { Loading } from "components/Loading";
import React, { createContext, useEffect, useState } from "react";
import { ID_TOKEN, NICKNAME } from "utils/constants";
import { getItem, setItem } from "utils/storage";

interface IUser {
  name: string;
  email: string;
}

interface IUserContext {
  user: IUser;
  idToken: string;
  accessToken: string;
  authenticated: boolean
  isLoading: boolean
}

export const UserContext = createContext<IUserContext>({} as IUserContext);

export const UserContextProvider = ({
  children,
}: React.PropsWithChildren<{}>) => {
  const { user, getIdTokenClaims, getAccessTokenSilently, isAuthenticated: auth0Authenticated } =
    useAuth0();

  const [context, setContext] = useState<IUserContext>({} as IUserContext);
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function getIdToken() {
      const idTokenClaims = await getIdTokenClaims();
      console.log("getIdToken", JSON.stringify(idTokenClaims));
      const idToken = idTokenClaims.__raw
      setItem(ID_TOKEN, idToken)
      setItem(NICKNAME, idTokenClaims.nickname)

      setContext((oldContext) => ({
        ...oldContext,
        user: { ...user } as IUser,
        idToken: idToken,
        authenticated: auth0Authenticated
      }));

      setLoading(false)
    }

    if (auth0Authenticated) {
      let idToken = getItem(ID_TOKEN)
      if (!idToken) {
        setContext((oldContext) => ({
          ...oldContext,
          user: { ...user } as IUser,
          idToken: idToken,
          authenticated: auth0Authenticated
        }));
      } else {
        setLoading(true)
        getIdToken();
      }
    }

  }, [user, auth0Authenticated, getIdTokenClaims, getAccessTokenSilently]);

  return (<>
    {loading ? <Loading /> : <UserContext.Provider value={context}>{children}</UserContext.Provider>}
  </>);
};
