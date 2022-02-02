const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const ical = require('node-ical');
const { MongoClient } = require('mongodb');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const app = express();
app.use(bodyParser.json());
app.use(cors());

//const testJSON = {name:"emily", age:18, interests:[{name:"coding", years:5},{name:"videogames", years: 10}]}

const uri = `mongodb+srv://admin:l1Thyrus@ucdashboard.wziw8.mongodb.net/UCDashboardMain?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const url = "https://timetable.canterbury.ac.nz/even/rest/calendar/ical/73852ab2-0288-4016-a81a-120431f81c0b";

const getTimetable = new Promise ((resolve) => {
    var xhr = new XMLHttpRequest();
    let calResponse;
    let parsedCalendar;

    xhr.open("GET", url);
    xhr.onreadystatechange = () => { 
       if (xhr.readyState === 4) {
          calResponse = xhr.responseText;
          parsedCalendar = ical.parseICS(calResponse);
          resolve(parsedCalendar);
       }};
    xhr.send();
})

app.listen(3000, () => {
    getTimetable.then((cal) =>{
        console.log(cal);
    })
})

app.get('/usertimetable', (req, res) =>{
    getTimetable.then(cal => res.json(cal)).catch(err => res.statusCode(500).res.json(err))
})

// client.connect(async err => {
//   client.db().createCollection("testcollection");
//   const collection = client.db("UCDasboardMain").collection("testcollection");
//     await collection.insertOne(testJSON);
//   client.close();
// }); 
