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

    findClassColor(classCode){
      const classObj = this.state.calendarColors.find((subject) => {
        return subject.id === classCode;
      })
      if(classObj === undefined){
        return '#808080'
      } else {
        return classObj.color
      }
    }

    getTimetable = async (isNewUser) => {
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
                const calendarName = classCode + ' | ' + classTitle;
                const activity = this.getActivityType(data[key].summary.slice(data[key].summary.lastIndexOf(',') + 2, data[key].summary.length - 1));
                if (classCode !== lastEventCourse) { calId++; }
                timetable.push({
                  id,
                  calendarId: calId.toString(),
                  title: activity,
                  location: data[key].location,
                  category: 'time',
                  start: data[key].start,
                  end: data[key].end,
                  isReadOnly: true
                });
                if (classCode !== lastEventCourse) {
                  let color = '#00aaff'
                  if(!isNewUser){
                    color = this.findClassColor(classCode)
                  }
                  calendars.push({
                    id: calId.toString(),
                    name: calendarName,
                    classCode,
                    bgColor: color,
                    borderColor: color
                  });

                  calendarColors.push({
                    id: classCode,
                    color: color
                  })
                  lastEventCourse = classCode;
                }
              }
              console.log(calendarColors);
              this.setState({ timetable, calendars, calendarColors });
          })
          return calendarColors;
    }

    getUser(){      
      console.log(this.props.tenantId)
      fetch('http://localhost:3000/queryuserdata', {
        method: 'POST',
        headers: {'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'},
        body: JSON.stringify({id: this.props.tenantId})
      })
      .then(res => {
        const queryResponse = res;
        this.getTimetable(false).then(calendarColors => {
          if(queryResponse.status === 404) {
            fetch('http://localhost:3000/createuser', {
              method: 'POST',
              headers: {'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'},
              body:  JSON.stringify({id: this.props.tenantId, calendarColors: calendarColors})
            })
          }
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
      const calendarColors = this.state.calendarColors.map((calendarColor) => {
        if (calendarColor.id === classCode){
          return {...calendarColor, color: color}
        } else {
          return calendarColor
        }
      })
      console.log('ass', calendarColors);
      this.setState({calendarColors})
      fetch('http://localhost:3000/updateuser', {
        method: 'POST',
        headers: {'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'},
        body : JSON.stringify({id: this.props.tenantId, calendars: calendarColors})
      }).then(res => res.json())
    }

    componentDidMount(){
        this.getUser();
    }
    
    render(){
        const {timetable, calendars, calendarColors} = this.state
        console.log(this.state);
        console.log(this.props);
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