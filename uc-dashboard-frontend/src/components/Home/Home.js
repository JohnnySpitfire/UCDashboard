import React, {useEffect, useState} from "react";
import Timetable from "../TimeTable/TimeTable";
import './home.css';
import EmailInbox from "../EmailInbox/EmailInbox";
import { useMsal } from "@azure/msal-react";
import { useNavigate, useParams } from "react-router-dom";
import Button from '@mui/material/Button';

const handleLogOut = (instance, accounts, navigate) => {
    instance.logoutPopup({
        account: accounts[0],
        postLogoutRedirectUri: "http://localhost:/3000/"
    });
    navigate('/');
}

function Home(){
    const [tenantId, setTenantId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const {instance, accounts} = useMsal();
    const navigate = useNavigate();
    const {timetableId} = useParams();

    useEffect(() => {
        const asyncSetTenantId = async () =>{
            await setTenantId(accounts[0].tenantId)
        }
        asyncSetTenantId().then(() => {
            setIsLoading(false)
        });
    },[accounts])

    while(isLoading){
        return (
            <div>
                <h1>Loading! :3</h1>
            </div>
        )
    }

    return (
        <div className="main-content-wrapper">
            <div className="header-wrapper">
                <h1>UC Timetable</h1>
                <div className='logout-button-wrapper'>
                   <Button variant="contained" size="large" onClick={() => handleLogOut(instance, accounts, navigate)}>LogOut</Button>
                </div>
            </div>
            <div className="body-wrapper">
                <Timetable timetableId={timetableId} tenantId={tenantId}/>
                <EmailInbox/>
            </div>
        </div>
    )
}

export default Home;