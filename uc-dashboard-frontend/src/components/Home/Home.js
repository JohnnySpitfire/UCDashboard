import React from "react";
import Timetable from "../TimeTable/TimeTable";
import SignInButton from "../SignInButton/SignInButton";
import './home.css';
import EmailInbox from "../EmailInbox/EmailInbox";


class Home extends React.Component{

    getTimetable(){
        fetch('')
    }

    render(){
        return (
            <div className="main-content-wrapper">
                <div className="header-wrapper">
                    <h1>header</h1>
                </div>
                <div className="body-wrapper">
                    <Timetable/>
                    <EmailInbox/>
                    <SignInButton/>
                </div>
            </div>
        )
    }
}

export default Home;