import { Route, Routes, BrowserRouter as Router } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import { authConfig } from "./config";
import { App } from "./App";
import { UserContextProvider } from "./context/UserContext";
import { Callback } from "./components/Callback";

export const MyAuthRouting = () => {

  return (
    <Auth0Provider
      domain={authConfig.domain}
      clientId={authConfig.clientId}
      redirectUri={authConfig.callbackUrl}
    >
      <UserContextProvider>
        <Router>
          <Routes>
            <Route path="/callback" element={<Callback />} />
            <Route path="/" element={<App />} />
          </Routes>
        </Router>
      </UserContextProvider>
    </Auth0Provider>
  );
};
