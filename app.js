const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const databasePath = path.join(__dirname, 'facebookNotification.db')

const app = express()

app.use(express.json())

let database = null

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

const convertDistrictDbObjectToResponseObject = dbObject => {
  return {
    notificationId: dbObject.notification_id,
    recipientId: dbObject.recipient_id,
    senderId: dbObject.sender_id,
    notificationType: dbObject.notification_type,
    content: dbObject.content,
    status: dbObject.status,
  }
}

app.get('/notification', async (request, response) => {
  const getUsersQuery = `
    SELECT
      *
    FROM
     notifi;`
  const usersArray = await database.all(getUsersQuery)
  response.send(
    usersArray.map(eachState =>
      convertDistrictDbObjectToResponseObject(eachState),
    ),
  )
})

app.get('/notification/:notificationId', async (request, response) => {
  const {notificationId} = request.params
  const getStateQuery = `
    SELECT 
      *
    FROM 
      notifi 
    WHERE 
     notification_id = ${notificationId};`
  const notificationid = await database.get(getStateQuery)
  response.send(convertDistrictDbObjectToResponseObject(notificationid))
})

module.exports = app
