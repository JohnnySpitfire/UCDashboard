import React from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../authConfig";

const handleLogin = (instance) => {
    instance.loginPopup(loginRequest).catch(e => {
        console.error(e);
    });
}

/**
 * Renders a button which, when selected, will open a popup for login
 */
export const SignInButton = () => {
    const { instance } = useMsal();

    return (
        <button onClick={() => handleLogin(instance)}>Sign in using Popup</button>
    );
}

export default SignInButton;