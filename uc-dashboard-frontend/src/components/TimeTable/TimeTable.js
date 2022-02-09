import React from 'react';
import './timetable.css'
import Calendar from '@toast-ui/react-calendar';
import moment from 'moment';
import 'tui-calendar/dist/tui-calendar.css';
import Button from '@mui/material/Button';
import ColorDialog from '../ColorDialog/ColorDialog'

function formatEventTitle(schedule, isAllDay) {
  var html = [];
  var start = moment(schedule.start.toUTCString());
  if (!isAllDay) {
      html.push('<strong>' + start.format('HH:mm') + '</strong> ');
  }
  if (schedule.isPrivate) {
      html.push('<span class="calendar-font-icon ic-lock-b"></span>');
      html.push(' Private');
  } else {
      if (schedule.isReadOnly) {
          html.push('<span class="calendar-font-icon ic-readonly-b"></span>');
      } else if (schedule.recurrenceRule) {
          html.push('<span class="calendar-font-icon ic-repeat-b"></span>');
      } else if (schedule.attendees.length) {
          html.push('<span class="calendar-font-icon ic-user-b"></span>');
      } else if (schedule.location) {
          html.push('<span class="calendar-font-icon ic-location-b"></span>');
      }
      html.push(` | ${schedule.title}`);
  }

  return html.join('');
}

function ClassColorPicker(props){
  const [open, setOpen] = React.useState(false);
  const {setColor} = props

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleCloseOK = (value) => {
    setOpen(false);
    setColor(props.calendarColors.id, value);
  };

  const handleCloseCancel = () => {
    setOpen(false);
  };

  return(
      <React.Fragment>
        <Button variant="contained" color="secondary" onClick={handleClickOpen}>{props.calendarColors.id}</Button>
        <ColorDialog onCloseOK={handleCloseOK} onCloseCancel={handleCloseCancel} open={open} classColor={props.calendarColors.color}/>
      </React.Fragment>
  )
}

class Timetable extends React.Component{

  calendarRef = React.createRef();

    constructor(props){
        super();
        this.state = {
            timetable: [],
            calendars: [],
            calendarColors: [],
            calendarView: 'week'
        }
    }

    //redundant
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

    findClassColor(classCode, userCalendarColors){
      const classObj = userCalendarColors.find((subject) => {
        return subject.id === classCode;
      })
      if(classObj === undefined){
        return '#00aaff'
      } else {
        return classObj.color
      }
    }

    getTextColor(bgColor){
      const hexToRgb = (bgColor) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(bgColor);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
      }
      const rgbColor = hexToRgb(bgColor);
      
      if ((rgbColor.r*0.299 + rgbColor.g*0.587 + rgbColor.b*0.114) > 186){
        return '#000000';
      } else {
        return '#ffffff';
      } 
    }

    getTimetable = async (isNewUser, userCalendarColors) => {
        let timetable = [];
        let calendars = [];
        let calendarColors = [];

        await fetch('http://localhost:3000/usertimetable', {
              method: 'GET',
              headers: {'Content-Type': 'application/json'}
          }).then(res => res.json())
            .then(data => {
              let lastEventCourse = '';
              let calId = -1;
              for (let key in data) {
                const id = data[key].uid.replace('uid', '');
                const classCode = data[key].description.slice(0, data[key].description.indexOf('-'));
                const classTitle = this.getClassTitle(data[key].summary);
                const calendarName = `${classCode} | ${classTitle}`;
                const activity = this.getActivityType(data[key].summary.slice(data[key].summary.lastIndexOf(',') + 2, data[key].summary.length - 1));
                if (classCode !== lastEventCourse) { calId++; }
                timetable.push({
                  id,
                  calendarId: calId.toString(),
                  title: `${activity} | ${classCode}`,
                  location: data[key].location,
                  category: 'time',
                  start: data[key].start,
                  end: data[key].end,
                  isReadOnly: true
                });
                if (classCode !== lastEventCourse) {
                  let color = '#00aaff'
                  if(!isNewUser){
                    color = this.findClassColor(classCode, userCalendarColors);
                  } else {
                    calendarColors.push({
                      id: classCode,
                      color: color
                    })
                  }
                  const textColor = this.getTextColor(color);
                  calendars.push({
                    id: calId.toString(),
                    name: calendarName,
                    classCode,
                    color: textColor,
                    bgColor: color,
                    borderColor: color
                  });
                  lastEventCourse = classCode;
                }
              }
              this.setState({ timetable, calendars });
          })
          return calendarColors;
    }

    getUser(){      
      fetch('http://localhost:3000/queryuserdata', {
        method: 'POST',
        headers: {'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'},
        body: JSON.stringify({id: this.props.tenantId})
      })
      .then(async res => {
        const statusCode = res.status;
        const userCalendarData = await res.json();
          if(statusCode === 404) {  
            this.getTimetable(true).then(userCalendarColors => {
            fetch('http://localhost:3000/createuser', {
              method: 'POST',
              headers: {'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'},
              body:  JSON.stringify({id: this.props.tenantId, calendarColors: userCalendarColors})
            })
            this.setState({calendarColors: userCalendarColors});
          })
        } else if(statusCode === 200){
          this.getTimetable(false, userCalendarData.calendarColors);
          this.setState({calendarColors: userCalendarData.calendarColors});
        }
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
        this.setState({calendarView: 'month'});
      } else {
        calendarInstance.changeView('week', true)
        this.setState({calendarView: 'week'});
      }
    }

    setColor = (classCode, newColor) => {
      const calendarColors = this.state.calendarColors.map((calendarColor) => {
        if (calendarColor.id === classCode){
          return {...calendarColor, color: newColor}
        } else {
          return calendarColor
        }
      })
      this.updateCalendarColors(classCode, newColor);
      this.setState({calendarColors});
      fetch('http://localhost:3000/updateuser', {
        method: 'POST',
        headers: {'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'},
        body : JSON.stringify({id: this.props.tenantId, calendarColors: calendarColors})
      }).then(res => res.json())
    }

    updateCalendarColors(classCode, newColor){
      const newTextColor = this.getTextColor(newColor);
      const newCalendar = this.state.calendars.map(subject => {
        if(subject.classCode === classCode){
          return {...subject, bgColor: newColor, borderColor: newColor, color: newTextColor};
        } else {
          return subject;
        }
      })
      this.setState({calendars: newCalendar});
    }

    componentDidMount(){
        this.getUser();
    }
    
    render(){
        const {timetable, calendars, calendarColors, calendarView} = this.state
        console.log(this.state);
        console.log(this.props);
        return (
            <React.Fragment>
              <div id='calendar-menu'>
                <div id='calendar-controls'>
                  <Button className='menu-button' type='button' variant='contained' style={{margin: '0 0.5% 0 0.5%'}} onClick={this.handleClickToggleButton}>Toggle Month and Week View</Button>
                  {calendarView === 'week' ? 
                    <Button className='menu-button' type='button' variant='contained' style={{margin: '0 0.5% 0 0.5%'}} onClick={this.handleClickTodayButton}>Today</Button>:
                    <Button disabled className='menu-button' type='button' variant='contained' style={{margin: '0 0.5% 0 0.5%'}} onClick={this.handleClickTodayButton}>Today</Button>
                  }
                  <Button className='menu-button' type='button' variant='contained' style={{margin: '0 0.5% 0 0.5%'}} onClick={this.handleClickPrevButton}>Prev</Button>
                  <Button className='menu-button' type='button' variant='contained' style={{margin: '0 0.5% 0 0.5%'}} onClick={this.handleClickNextButton}>Next</Button>
                </div>
                <div id='calendar-color-controls'>
                  <h3>Customize Class Colors</h3>
                  <div className='calendar-color-button-wrapper'>
                    {calendarColors.map((calendar, i) => {
                      return (
                          <div key={i} className="calendar-color-button">
                            <ClassColorPicker setColor={this.setColor} calendarColors={calendar} />
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
              template={{
                time: function(schedule) {
                  return formatEventTitle(schedule, false);
                }
              }}
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