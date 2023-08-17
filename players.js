//some of this implementation is based on: https://github.com/mizanxali/uno-online

const players = []

/**
 * Adds a player to the game
 * @param {*} param0 a player object containing all the fields needed
 * @returns -1 if something went wrong, else returns the player
 */
const addPlayer = ({ id, name, room, cardsDeck, cards, gameMode, wins, rol }) => {
  const playersInRoom = players.filter(player => player.room === room).length
  let returnValue = -1;
  if (playersInRoom < 7) {
    const newPlayer = { id, name, room, cardsDeck, cards, gameMode, wins, rol }
    if (players.find(player => player.name === newPlayer.name
      && player.room === newPlayer.room) !== undefined) {
      let replaceIndex = players.indexOf(player => player.name === newPlayer.name
        && player.room === newPlayer.room);
      if(replaceIndex != -1) {
        players[replaceIndex] = newPlayer;
      }  
    } else {
      players.push(newPlayer);
    }
    returnValue = newPlayer
  }
  return returnValue;
}

/**
 * Removes a given player from a given room
 * @param {*} room the room where the player is 
 * @param {*} name the player name
 * @returns undefiend if something went wrong, the removed player if good
 */
const removePlayer = (room, name) => {
  const removeIndex = players.findIndex(player => player.room === room && player.name === name)

  if (removeIndex !== -1)
    return players.splice(removeIndex, 1)[0]
}

/**
 * Gets a requested player
 * @param {*} room the room where the player is 
 * @param {*} name the player name
 * @returns -1 if something went wrong, the requested player if good
 */
const getPlayer = (room, name) => {
  return players.find(player => player.room === room && player.name === name)
}

/**
 * Gets all the players in a given room
 * @param {*} room the room where the players are
 * @returns all the players in the given room
 */
const getPlayersInRoom = room => {
  return players.filter(player => player.room === room)
}

/**
 * Gets a player by its id
 * @param {*} id the id of the player
 * @returns the player with the given id
 */
const getPlayerById = (id) => {
  return players.find(player => player.id === id);
}

module.exports = { addPlayer, removePlayer, getPlayer, getPlayersInRoom, getPlayerById }
