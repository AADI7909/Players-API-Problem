const express = require('express')
const app = express()
app.use(express.json())
const {open} = require('sqlite')
const path = require('path')
const dbpath = path.join(__dirname, 'cricketTeam.db')
const sqlite3 = require('sqlite3')

let db = null
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

const ConvertDbObjToResponseObj = eachObj => {
  return {
    playerId: eachObj.player_id,
    playerName: eachObj.player_name,
    jerseyNumber: eachObj.jersey_number,
    role: eachObj.role,
  }
}

//API 1
app.get(`/players/`, async (request, response) => {
  const getAllPlayersQuery = `
    SELECT * FROM cricket_team ORDER BY player_id;
  `
  const PlayersArray = await db.all(getAllPlayersQuery)
  response.send(
    PlayersArray.map(eachPlayer => ConvertDbObjToResponseObj(eachPlayer)),
  )
})

// API 2
app.post('/players/', async (request, response) => {
  const PlayerDetails = request.body
  const {PlayerName, JerseyNo, Role} = PlayerDetails
  const AddPlayerDetailsQuery = `
      INSERT INTO 
      cricket_team (player_name,jersey_number,role)
      VALUES ("${PlayerName}","${JerseyNo}", "${Role}");
  `
  await db.run(AddPlayerDetailsQuery)
  response.send('Player Added to Team')
})

//API 3
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const GetPlayerDetails = `
      SELECT * FROM cricket_team
      WHERE player_id = ${playerId};
  `
  const Player = await db.get(GetPlayerDetails)
  response.send(ConvertDbObjToResponseObj(Player))
})

// API 4
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const PlayerDetails = request.body
  const {PlayerName, JerseyNo, Role} = PlayerDetails
  const UpdatePlayerDetailsQuery = `
        UPDATE cricket_team
        SET player_name = "${PlayerName}",
        jersey_number = "${JerseyNo}",
        role = "${Role}"
        WHERE player_id = ${playerId};`
  await db.run(UpdatePlayerDetailsQuery)
  response.send('Player Details Updated')
})

// API 5
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const DeletePlayer = `
      DELETE FROM cricket_team
      WHERE player_id = ${playerId};
  `
  await db.run(DeletePlayer)
  response.send('Player Removed')
})

module.exports = app
