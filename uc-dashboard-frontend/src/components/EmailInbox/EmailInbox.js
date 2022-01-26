import React from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../authConfig";



const GetAccessToken = () => {
    const { instance, accounts } = useMsal();
    
    const request = {
        ...loginRequest,
        account: accounts[0]
    };
    
    instance.acquireTokenSilent(request).then((response) => {
        console.log(response.accessToken);
        getEmails(response.accessToken);
        }).catch((e) => {
        instance.acquireTokenPopup(request).then((response) => {
        getEmails(response.accessToken);
        });
    });
}


const getEmails = (accessToken) => {

    var headers = new Headers();
    var bearer = "bearer " + accessToken;
    console.log(bearer);
    headers.append("Authorization", bearer);
    var options = {
            method: "GET",
            headers: headers
    };
    var graphEndpoint = "https://graph.microsoft.com/v1.0/me/messages?$select=sender,body,subject";

    fetch(graphEndpoint, options)
        .then(resp => {
            console.log(resp);
        });
}

const EmailInbox = (props) => {
    GetAccessToken();
    return (
        <div>
        </div>
    )
}

export default EmailInbox;