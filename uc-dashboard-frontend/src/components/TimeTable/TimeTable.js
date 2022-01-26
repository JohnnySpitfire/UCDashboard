import React from "react";
import './timetable.css'

class Timetable extends React.Component {

    render(){
        return (
            <div className='timetable-wrapper'>
                <table>
                    <thead>
                        <tr><th>Monday</th></tr>
                        <tr><th>Tuesday</th></tr>
                        <tr><th>Wednesday</th></tr>
                        <tr><th>Thursday</th></tr>
                        <tr><th>Friday</th></tr>
                    </thead>
                    <tbody>
                        <tr></tr>
                        <tr></tr>
                        <tr></tr>
                        <tr></tr>
                        <tr></tr>
                        <tr></tr>
                        <tr></tr>
                        <tr></tr>
                        <tr></tr>
                    </tbody>
                </table>
            </div>
        )
    }
}

export default Timetable;