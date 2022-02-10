const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const ical = require('node-ical');
const CosmosClient = require('@azure/cosmos').CosmosClient
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const config = require('./config')

const endpoint = config.endpoint
const key = config.key
const databaseId = config.database.id
const containerId = config.container.id
const partitionKey = { kind: 'Hash', paths: ['/partitionKey'] }

const options = {
    endpoint: endpoint,
    key: key,
    userAgentSuffix: 'CosmosDBJavascriptQuickstart'
  };

const client = new CosmosClient(options)

const app = express();
app.use(bodyParser.json());
app.use(cors());

//const testJSON = {name:"emily", age:18, interests:[{name:"coding", years:5},{name:"videogames", years: 10}]}

// const uri = `mongodb+srv://admin:l1Thyrus@ucdashboard.wziw8.mongodb.net/UCDashboardMain?retryWrites=true&w=majority`;
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function getTimetable(timetableId){
  const getTimetablePromise = new Promise ((resolve) => {
    var xhr = new XMLHttpRequest();
    let calResponse;
    let parsedCalendar;

    xhr.open("GET", `https://timetable.canterbury.ac.nz/even/rest/calendar/ical/${timetableId}`);
    xhr.onreadystatechange = () => { 
       if (xhr.readyState === 4) {
          calResponse = xhr.responseText;
          parsedCalendar = ical.parseICS(calResponse);
          resolve(parsedCalendar);
       }};
    xhr.send();
})
  const cal = await getTimetablePromise;
  return cal;
}


app.listen(3000, () => {
    getTimetable('73852ab2-0288-4016-a81a-120431f81c0b').then((cal) =>{
        console.log(cal);
    })
});

app.post('/usertimetable', (req, res) =>{
    getTimetable(req.body.timetableId).then(cal => res.json(cal)).catch(err => res.status(500).json(err))
})

app.post('/queryuserdata' , (req, res) => {
  queryUsersCollection(req.body).then(data => {
    if(data === undefined){
      console.log('No users found');
      res.status(404).json({});
    } else {
      console.log('ass', data);
      res.json(data);
    }
  })
  .catch(err => res.status(500).json(err))
})

app.post('/createuser' , (req, res) => {
  createUserItem(req.body).then(() => res.status(200).json('completed successfully'))
  .catch(err => {
    res.status(500).json(err)
    console.log('ass', err);
  })
})

app.post('/updateuser', (req, res) => {
  replaceUserItem(req.body).then((data) => res.status(200).json('completed successfully'))
  .catch(err =>{
    res.status(500).json(err)
  })
})

/**
 * Scale a container
 * You can scale the throughput (RU/s) of your container up and down to meet the needs of the workload. Learn more: https://aka.ms/cosmos-request-units
 */
async function scaleContainer() {
  const { resource: containerDefinition } = await client
    .database(databaseId)
    .container(containerId)
    .read();
  
  try
  {
      const {resources: offers} = await client.offers.readAll().fetchAll();
  
      const newRups = 500;
      for (var offer of offers) {
        if (containerDefinition._rid !== offer.offerResourceId)
        {
            continue;
        }
        offer.content.offerThroughput = newRups;
        const offerToReplace = client.offer(offer.id);
        await offerToReplace.replace(offer);
        console.log(`Updated offer to ${newRups} RU/s\n`);
        break;
      }
  }
  catch(err)
  {
      if (err.code == 400)
      {
          console.log(`Cannot read container throuthput.\n`);
          console.log(err.body.message);
      }
      else 
      {
          throw err;
      }
  }
}

/**
 * Create family item if it does not exist
 */
async function createUserItem(itemBody) {
  console.log(itemBody);
  const { item } = await client
    .database(databaseId)
    .container(containerId)
    .items.upsert(itemBody)
  console.log(`Created family item with id:\n${itemBody}\n`);
}

/**
 * Query the container using SQL
 */
async function queryUsersCollection(reqbody) {
  console.log(`Querying container:\n${config.container.id}`)
  console.log('id:', reqbody.id);

  // query to return all children in a family
  // Including the partition key value of country in the WHERE filter results in a more efficient query
  const querySpec = {
    query: 'SELECT VALUE u FROM users u WHERE u.id = @id',
    parameters: [
      {
        name: '@id',
        value: reqbody.id
      }
    ]
  }

  const { resources: results } = await client
    .database(databaseId)
    .container(containerId)
    .items.query(querySpec)
    .fetchAll()
  for (var queryResult of results) {
    let resultString = JSON.stringify(queryResult)
    console.log(`Query returned \n${resultString}\n`)
    return queryResult;
  }
}

/**
 * Replace the item by ID.
 */
async function replaceUserItem(itemBody) {
  console.log(`Replacing item:\n${itemBody.id}\n`)
  const { item } = await client
    .database(databaseId)
    .container(containerId)
    .item(itemBody.id)
    .replace(itemBody)
}

/**
 * Delete the item by ID.
 */
async function deleteFamilyItem(itemBody) {
  await client
    .database(databaseId)
    .container(containerId)
    .item(itemBody.id, itemBody.partitionKey)
    .delete(itemBody)
  console.log(`Deleted item:\n${itemBody.id}\n`)
}

/**
 * Cleanup the database and collection on completion
 */
async function cleanup() {
  await client.database(databaseId).delete()
}

/**
 * Exit the app with a prompt
 * @param {string} message - The message to display
 */
function exit(message) {
  console.log(message)
//   process.stdin.setRawMode(true)
//   process.stdin.resume()
//   process.stdin.on('data', process.exit.bind(process, 0))
}


