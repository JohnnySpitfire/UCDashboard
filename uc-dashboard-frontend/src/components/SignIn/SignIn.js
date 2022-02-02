import React from "react";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../authConfig";
import './signin.css'
import Button from '@mui/material/Button';


const handleLogin = (instance, navigate) => {
    instance.loginPopup(loginRequest).then(() =>  navigate('/Home'))
    .catch(e => {
        console.error(e);
    });
}


const SignIn = () => {
    let navigate = useNavigate();
    const { instance } = useMsal();

    return(
        <div className="sign-in-wrapper">
            <div className="sign-in-content">
                <h2>Welcome To the UC Dashboard</h2>
                <Button variant="contained" onClick={() => {handleLogin(instance, navigate)}}>Sign in With Microsoft</Button>
            </div>
        </div>

    )
}

export default SignIn;