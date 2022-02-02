import React from "react";
import './timetable.css'
import Calendar from '@toast-ui/react-calendar';
import 'tui-calendar/dist/tui-calendar.css';
import Button from '@mui/material/Button';

class Timetable extends React.Component{

  calendarRef = React.createRef();

    constructor(){
        super();
        this.state = {
            timetable: [],
            calendars: [],
        }
    }

    getRandomColor(){
      const colorChars = '0123456789ABCDEF';
      let colorCode = '#'
      for(let i = 0; i < 6; i++){
        colorCode = colorCode+= colorChars[Math.floor(Math.random() * 16)]
      }
      return colorCode;
    }

    getTimetable(){
        let timetable = []
        let calendars = []

        fetch('http://localhost:3000/usertimetable', {
            method: "GET",
            headers: {'Content-Type': 'application/json'},
        }).then(res => res.json())
          .then(data => {
            let lastEventCourse = '';
            let calId = -1;
            for(let key in data){
                const id = data[key].uid.replace("uid","");
                const name = data[key].description.slice(0, data[key].description.indexOf('-'));
                const randColor = this.getRandomColor()
                if(name !== lastEventCourse){calId++}
                timetable.push({
                    id,
                    calendarId: calId.toString(),
                    title: data[key].summary,
                    location: data[key].location,
                    category: 'time',
                    start: data[key].start,
                    end: data[key].end,
                    isReadOnly: true
                })
                if(name !== lastEventCourse){
                  calendars.push({
                    id: calId.toString(),
                    name,
                    bgColor: randColor,
                    borderColor: randColor
                  })
                  lastEventCourse = name;
                }
            }
            this.setState({timetable});
            this.setState({calendars})

        })
    }

    handleClickNextButton = () => {
      const calendarInstance = this.calendarRef.current.getInstance();
      calendarInstance.next();
    };

    handleClickPrevButton = () => {
      const calendarInstance = this.calendarRef.current.getInstance();
      calendarInstance.prev();
    };

    handleClickTodayButton = () => {
      const calendarInstance = this.calendarRef.current.getInstance();
      if (calendarInstance.getViewName() !== 'month') {
        calendarInstance.today();
      }
    };

    handleClickToggleButton = () => {
      const calendarInstance = this.calendarRef.current.getInstance();
      if(calendarInstance.getViewName() === "week"){
        calendarInstance.changeView('month', true)
      } else {
        calendarInstance.changeView('week', true)
      }
    };

    componentDidMount(){
        this.getTimetable();
    }
    
    render(){
        const {timetable, calendars} = this.state
        return (
            <React.Fragment>
              <div id="calendar-menu">
                <Button className="menu-button" type="button" variant="contained" onClick={this.handleClickToggleButton}>ToggleCalendarMode</Button>
                <Button className="menu-button" type="button" variant="contained" onClick={this.handleClickTodayButton}>Today</Button>
                <Button className="menu-button" type="button" variant="contained" onClick={this.handleClickPrevButton}>Prev</Button>
                <Button className="menu-button" type="button" variant="contained" onClick={this.handleClickNextButton}>Next</Button>
              </div>
                <Calendar 
                calendars={calendars}
                disableDblClick={false}
                disableClick={false}
                isReadOnly={true}
                ref={this.calendarRef}
                month={{
                  startDayOfWeek: 0,
                  workweek: true,
                }}
                week={{
                  workweek: true,
                  hourStart: 8,
                  hourEnd: 17
                }}
                schedules={
                  timetable
                }
                scheduleView={true}
                taskView={false}
                useDetailPopup={true}
                // template={}
                timezones={[
                  {
                    timezoneOffset: +780,
                    displayLabel: 'GMT-13:00',
                    tooltip: 'New Zealand'
                  }
                ]}
                useCreationPopup
                />
            </React.Fragment>
        )   
    }
}

export default Timetable;