import React from "react";
import Timetable from "../TimeTable/TimeTable";
import SignInButton from "../SignInButton/SignInButton";
import './home.css';


class Home extends React.Component{
    
    render(){
        return (
            <div className="main-content-wrapper">
                <div className="header-wrapper">
                    <h1>header</h1>
                </div>
                <div className="body-wrapper">
                    <Timetable/>
                    <SignInButton/>
                </div>
            </div>
        )
    }
}

export default Home;