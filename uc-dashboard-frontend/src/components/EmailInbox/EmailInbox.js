import React, { useEffect, useState } from "react";
import EmailItem from "../EmailItem/EmailItem";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../authConfig";

const GetEmails = async ({instance, accounts}) => {
        const req = {
            ...loginRequest,    
            account: accounts[0]
        };
        
        let emails;

        await instance.acquireTokenSilent(req)
        .then(async res => {
            const emailResponse = await EmailRequest(res.accessToken);
            emails = emailResponse;
        })
        return emails;

}

const EmailRequest = (accessToken) => {

    var headers = new Headers();
    var bearer = "bearer " + accessToken;
    headers.append("Authorization", bearer);
    headers.append("Content-Type", "application/json");
    var options = {
            method: "GET",
            headers: headers
    };
    var graphEndpoint = "https://graph.microsoft.com/v1.0/me/messages?$select=sender,body,subject";
    
    return fetch(graphEndpoint, options)
            .then(res => res.json())
            .then(data => {return data})

}

const EmailList = () => {
    const { instance, accounts } = useMsal();
    const [emails, setEmails] = useState([])
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
         const getEmails = async () => {
            const emailsResponse = await GetEmails({instance, accounts});
            setEmails(emailsResponse.value);
            setIsLoading(false);
        }
        getEmails();
    }, [instance, accounts])

    if(isLoading){
        return (
            <div>Loading! :3</div>
        )
    } else {
        return (
            emails.map((message, i) =>{
                const {subject, body} = message
                return <EmailItem key={i} subject={subject} body={body.content}/>
            })
        )
    }
}


class EmailInbox extends React.Component {

    constructor(props){
        super();
        this.state = {
        }
    }

    render() {
        return (
            <div>
                <EmailList/>
            </div>
        )
    }
}

export default EmailInbox;