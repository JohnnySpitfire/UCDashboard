import React from 'react';
import './timetable.css'
import Calendar from '@toast-ui/react-calendar';
import 'tui-calendar/dist/tui-calendar.css';
import Button from '@mui/material/Button';
import ColorDialog from '../ColorDialog/ColorDialog'

function ClassColorPicker(props){
  const [open, setOpen] = React.useState(false);
  const {setColor} = props

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleCloseOK = (value) => {
    setOpen(false);
    setColor(props.calendar.classCode, value);
  };

  const handleCloseCancel = () => {
    setOpen(false);
  };

  return(
      <React.Fragment>
        <Button variant="contained" color="secondary" onClick={handleClickOpen}>{props.calendar.classCode}</Button>
        <ColorDialog onCloseOK={handleCloseOK} onCloseCancel={handleCloseCancel} open={open} classColor={props.calendar.bgColor}/>
      </React.Fragment>
  )
}

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

    getActivityType(activity){
      switch(activity){
        case 'Lec':
          return 'Lecture';
        case 'Com':
          return 'Computer Lab';
        case 'Tut':
          return 'Tutorial';
        case 'Lab':
          return 'Lab';
        case 'Dro':
          return 'Drop In Class';
        case 'Wor':
          return 'Workshop';
        case 'Tes':
          return 'Test';
        default:
          throw new Error('Invalid activity');
      }
    }

    getClassTitle(summaryString){
      if(summaryString.indexOf(':') === -1){
        return summaryString.slice(0, summaryString.lastIndexOf(','));
      } else {
        return summaryString.slice(0, summaryString.indexOf(':'));
      }
    }

    findClassColor(classCode, classColors){
      const classObj = classColors.find((subject) => {
        return subject.classCode === classCode;
      })
      if(classObj === undefined){
        return '#808080'
      } else {
        return classObj.color
      }
    }

    getTimetable(){
        let timetable = []
        let calendars = []

        fetch('http://localhost:3000/userdata', {
          method: 'GET',
          headers: {'Content-Type': 'application/json'}
        })
        .then(res => res.json())
        .then(classColors => {
        fetch('http://localhost:3000/usertimetable', {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        }).then(res => res.json())
          .then(data => {
            let lastEventCourse = '';
            let calId = -1;
            for(let key in data){
                const id = data[key].uid.replace('uid','');
                const classCode = data[key].description.slice(0, data[key].description.indexOf('-'));
                const classTitle = this.getClassTitle(data[key].summary);
                const calendarName =  classCode + ' | ' + classTitle;
                const activity = this.getActivityType(data[key].summary.slice(data[key].summary.lastIndexOf(',') + 2, data[key].summary.length - 1));
                if(classCode !== lastEventCourse){calId++}
                timetable.push({
                    id,
                    calendarId: calId.toString(),
                    title: activity,
                    location: data[key].location,
                    category: 'time',
                    start: data[key].start,
                    end: data[key].end,
                    isReadOnly: true
                })
                if(classCode !== lastEventCourse){
                  const color = this.findClassColor(classCode, classColors);
                  calendars.push({
                    id: calId.toString(), 
                    name: calendarName,
                    classCode,
                    bgColor: color,
                    borderColor: color
                  })
                  lastEventCourse = classCode;
                }
            }
            this.setState({timetable, calendars});
        })
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
      if(calendarInstance.getViewName() === 'week'){
        calendarInstance.changeView('month', true)
      } else {
        calendarInstance.changeView('week', true)
      }
    };

    handleClickOpen = () => {
    };
  
    handleClose = (value) => {
    };

    setColor = (classCode, color) => {
      console.log(classCode, color);
      const calendars = this.state.calendars.map((calendar) => {
        if (calendar.classCode === classCode){
          return {...calendar, bgColor: color, borderColor: color}
        } else {
          return calendar
        }
      })
      this.setState({calendars})
    }

    componentDidMount(){
        this.getTimetable();
    }
    
    render(){
        const {timetable, calendars} = this.state
        console.log(this.state);
        return (
            <React.Fragment>
              <div id='calendar-menu'>
                <div id='calendar-controls'>
                  <Button className='menu-button' type='button' variant='contained' style={{margin: '0 0.5% 0 0.5%'}} onClick={this.handleClickToggleButton}>ToggleCalendarMode</Button>
                  <Button className='menu-button' type='button' variant='contained' style={{margin: '0 0.5% 0 0.5%'}} onClick={this.handleClickTodayButton}>Today</Button>
                  <Button className='menu-button' type='button' variant='contained' style={{margin: '0 0.5% 0 0.5%'}} onClick={this.handleClickPrevButton}>Prev</Button>
                  <Button className='menu-button' type='button' variant='contained' style={{margin: '0 0.5% 0 0.5%'}} onClick={this.handleClickNextButton}>Next</Button>
                </div>
                <div id='calendar-color-controls'>
                  <h3>Customize Class Colors</h3>
                  <div className='calendar-color-button-wrapper'>
                    {calendars.map((calendar, i) => {
                      return (
                          <div key={i} className="calendar-color-button">
                            <ClassColorPicker setColor={this.setColor} calendar={calendar} />
                          </div>
                        )
                    })}
                  </div>
                </div>
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
                hourEnd: 21
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