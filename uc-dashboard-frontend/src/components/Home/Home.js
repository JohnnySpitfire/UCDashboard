import React from "react";
import Timetable from "../TimeTable/TimeTable";
import './home.css';
import EmailInbox from "../EmailInbox/EmailInbox";
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button';

const handleLogOut = (instance, accounts, navigate) => {
    instance.logoutPopup({
        account: accounts[0],
        postLogoutRedirectUri: "http://localhost:/3000/"
    });
    navigate('/');
}


const LogOutButton = () =>{
    const { instance, accounts } = useMsal();
    const navigate = useNavigate();

    return(
        <Button variant="contained" onClick={() => handleLogOut(instance, accounts, navigate)}>LogOut</Button>
    )
}

class Home extends React.Component{
    
    render(){
        return (
            <div className="main-content-wrapper">
                <div className="header-wrapper">
                    <h1>header</h1>
                    <LogOutButton/>
                </div>
                <div className="body-wrapper">
                    <Timetable/>
                    <EmailInbox/>
                </div>
            </div>
        )
    }
}

export default Home;