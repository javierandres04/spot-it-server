const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const cors = require('cors');
const socketio = require("socket.io");
const { addPlayer, removePlayer, getPlayer, getPlayersInRoom, getPlayerById } = require('./players');
const { getCardsCombination, createDeck, updateDeck, checkWinner, restartGame, generateRoomCode } = require('./utils');

const PORT = process.env.PORT || 5000; 

app.use(cors());

const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

let flipSwitch = true;

/// Algorithm that defines the behaviour when a new connection is created
io.on("connection", (socket) => {
  const roomCode = generateRoomCode(6);

  /// When a room is created
  socket.on('createRoom', (playerInfo) => {
    const newPlayer = addPlayer({
      id: socket.id,
      name: playerInfo.name,
      room: roomCode,
      cardsDeck: [],
      cards: 0,
      gameMode: '',
      wins: 0,
      rol: 'Host'
    })

    if (newPlayer === undefined) {
      return undefined
    }
    console.log('New connection on socket ' + socket.id)
    socket.join(newPlayer.room);
    io.to(newPlayer.room).emit('roomInfo', { room: newPlayer.room, players: getPlayersInRoom(newPlayer.room), started: false, mode: 'Clásico' })
  })

  /// When a guest tries to join a room
  socket.on('tryJoin', (playerInfo) => {
    const playersInRoom = getPlayersInRoom(playerInfo.room);
    if (playersInRoom.length === 0) {
      socket.emit('noRoom');
    } else if ((playersInRoom.length === 6)) {
      socket.emit('fullRoom');
    } else if (playersInRoom.find(player => playerInfo.name === player.name && playerInfo.room === player.room)) {
      socket.emit('nameInUse')
    } else {
      socket.emit('proceedJoin', { name: playerInfo.name, room: playerInfo.room });
    }
  })

  /// When a player joins a room
  socket.on('joinRoom', (playerInfo) => {
    let playersInRoom = getPlayersInRoom(playerInfo.room);
    let tempCardDeck = [];
    if (playersInRoom.length > 0) {
      tempCardDeck = playersInRoom[0].cardsDeck;
    }
    let isStarted = false;
    const newPlayer = addPlayer({
      id: socket.id,
      name: playerInfo.name,
      room: playerInfo.room,
      cardsDeck: tempCardDeck,
      cards: 0,
      gameMode: '',
      wins: 0,
      rol: playerInfo.rol
    })

    if (newPlayer === -1) {
      return undefined
    }
    if (newPlayer.cardsDeck.length > 0) {
      isStarted = true;
    }
    socket.join(newPlayer.room);
    playersInRoom = getPlayersInRoom(playerInfo.room);
    console.log('New connection on socket ' + socket.id);
    if (playersInRoom != undefined && playersInRoom.length > 0) {
      io.to(newPlayer.room).emit('roomInfo', { room: newPlayer.room, players: playersInRoom, started: isStarted, mode: playersInRoom[0].gameMode });
      io.to(newPlayer.room).emit('playerJoining', {player: newPlayer.name, players: playersInRoom});

    }
  })

  /// When the host initiates the game
  socket.on('initGame', (playerInfo) => {
    const cardsDeck = createDeck(getCardsCombination().sort(() => Math.random() - 0.5));
    const roomPlayers = getPlayersInRoom(playerInfo.room);
    roomPlayers.map(player => player.cardsDeck = cardsDeck);
    io.to(playerInfo.room).emit('initGame', { cardsDecks: cardsDeck, players: roomPlayers, mode: playerInfo.mode });

    roomPlayers.map(player => player.gameMode = playerInfo.mode);
    if (playerInfo.mode === 'Retador') {
      setInterval(() => {
        flipSwitch = !flipSwitch;
        io.to(playerInfo.room).emit('flipCards', { flipped: flipSwitch })
      }, 7000)
    }
  })

  /// When a player makes 3 moves, his turn must be evaluated
  socket.on('evaluateTurn', (playerInfo) => {
    const choices = playerInfo.choices;
    if (choices[0].name === choices[1].name && choices[1].name === choices[2].name) {
      const player = getPlayer(playerInfo.room, playerInfo.name);
      const cardsDeck = player.cardsDeck;
      player.cards += 3;
      let newCardsDeck = updateDeck(cardsDeck, choices);
      let roomPlayers = getPlayersInRoom(playerInfo.room);
      roomPlayers.map(player => player.cardsDeck = newCardsDeck);
      socket.emit('successTurn', { choice: choices[0] });
      io.to(playerInfo.room).emit('updateGameState', { cardsDeck: newCardsDeck, players: roomPlayers, choices: [], player: player.name});
      if (newCardsDeck.length <= 9 && newCardsDeck.length != 0) {
        const winner = checkWinner(roomPlayers);
        restartGame(roomPlayers, winner);
        io.to(playerInfo.room).emit('finishGame', { winner: winner, players: roomPlayers, cardsDeck: roomPlayers[0].cardsDeck });
      }
    } else {
      socket.emit('badTurn', { choices: [] });
    }
  })

  /// When a player leaves the game
  socket.on('leaveGame', ({ room, name }) => {
    removePlayer(room, name);
    const playersInRoom = getPlayersInRoom(room);
    let newHost = '';
    if (playersInRoom.length > 0) {
      playersInRoom[0].rol = 'Host';
      newHost = playersInRoom[0].name;
    }
    socket.disconnect();
    io.to(room).emit('playerLeft', { players: playersInRoom, player: name, newHost: newHost });
  })

  /// When a player tries to stablish a connection
  socket.on('tryToConnect', ({ name }) => {
    socket.emit('connectWithServer', { name: name });
  })

  /// When a player leaves the room
  socket.on('disconnect', () => {
    const player = getPlayerById(socket.id);
    if (player != undefined) {
      removePlayer(player.room, player.name);
      const playersInRoom = getPlayersInRoom(player.room);
      let newHost = '';
      if (playersInRoom.length > 0) {
        playersInRoom[0].rol = 'Host';
        newHost = playersInRoom[0].name;
      }
      io.to(player.room).emit('playerLeft', { players: playersInRoom, player: player.name, newHost: newHost });
    }
  })
});

server.listen(PORT, () => console.log(`Server listen on port ${PORT}`));
