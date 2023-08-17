/**
   * @description Returns an array of arrays of 6 symbols that represents a Spot It! deck of cards. 
   * Based on: https://www.ryadel.com/en/dobble-spot-it-algorithm-math-function-javascript/
*/
function getCardsCombination() {
  let symbols_per_card = 8;     // number of symbols on each card
  let nC = 0;    // progressive number of cards
  let cards = []; // array of series (cards)

  const symbols = ["Anchor", "Apple", "Bomb", "Cactus", "Candle", "Carrot",
    "Cheese", "Chess-Knight", "Clock", "Clown", "Daisy-Flower", "Dinosaur",
    "Dolphin", "Dragon", "Exclamation-Mark", "Eye", "Fire", "Four-Leaf-Clover",
    "Ghost", "Green-Splats", "Hammer", "Heart", "Ice-Cube", "Igloo", "Key",
    "Ladybug", "Light-Bulb", "Lightning-Bolt", "Lock", "Maple-Leaf", "Milk-Bottle",
    "Moon", "No-Entry-Sign", "Scarecrow-Man", "Pencil", "Purple-Bird",
    "Cat", "Dobbly-Hand", "Question-Mark", "Red-Lips", "Scissors",
    "Skull-and-Bones", "Snowflake", "Snowman", "Spider", "Spider-Web",
    "Sun", "Sunglasses", "Target", "Taxi", "Tortoise", "Treble-Clef", "Tree",
    "Water-Drop", "Dog", "Yin-Yang", "Zebra", "Pig", "Bear"]

  // Generate series from #01 to #N
  for (let i = 0; i <= symbols_per_card - 1; i++) {
    let series = [];
    nC++;
    series.push(symbols[0]);
    for (let j = 1; j <= symbols_per_card - 1; j++) {
      series.push(symbols[(symbols_per_card - 1) + (symbols_per_card - 1) * (i - 1) + (j + 1)]);
    }
    cards.push(series);
  }

  // Generate series from #N+1 to #N+(N-1)*(N-1)
  for (let i = 1; i <= symbols_per_card - 1; i++) {
    for (let j = 1; j <= symbols_per_card - 1; j++) {
      let s = [];
      nC++;
      s.push(symbols[i + 1]);
      for (let k = 1; k <= symbols_per_card - 1; k++) {
        s.push(symbols[(symbols_per_card + 1) + (symbols_per_card - 1) * (k - 1) + (((i - 1) * (k - 1) + (j - 1))) % (symbols_per_card - 1)]);
      }
      cards.push(s);
    }
  }
  return cards;
}

/**
 * Creates and shuffles the game deck
 * @param {*} cards an array containing the cards of the game
 * @returns The deck ramdomly shuffled
 */
const createDeck = (cards) => {
  let tempDeck = [];
  cards.map((combination, index) => (
    tempDeck.push({
      figures: combination.sort(() => Math.random() - 0.5),
      cardNumber: index
    })
  ))
  return tempDeck;
}

/**
 * Updates the game deck in dependence of the player choices
 * @param {*} cardsDeck the current deck of cards
 * @param {*} choices the last three user choices
 * @returns 
 */
const updateDeck = (cardsDeck, choices) => {
  let tempIndex;
  let tempCard;
  let tempDeck = cardsDeck.slice(0);
  if (choices.length === 3) {
    for (let i = 0; i < choices.length; i++) {
      tempCard = tempDeck.find(card => card.cardNumber === choices[i].cardNumber);
      tempIndex = tempDeck.indexOf(tempCard);
      if (tempIndex !== -1) {
        tempDeck.splice(tempIndex, 1);
      }
    } 
  }
  return tempDeck;
}

/**
 * Checks which player won at the end of the game
 * @param {*} roomPlayers the players in the game
 * @returns the winning player
 */
const checkWinner = (roomPlayers) => {
  let winner = roomPlayers[0];
  roomPlayers.forEach(player => {
    if (player.cards > winner.cards) {
      winner = player;
    }
  });
  return winner;
}

/**
 * Restart the game with the given set of players
 * @param {*} roomPlayers the players to be present in the next game
 */
const restartGame = (roomPlayers, winner) => {
  roomPlayers.map(player => {
    player.cards = 0;
    if (player.name === winner.name) {
      player.wins += 1;
    } 
  })
}

/**
 * Generates a room code to identify a game
 * @param {*} roomCodeLength the desired length of the code to be generated
 * @returns 
 */
const generateRoomCode = (roomCodeLength) => {
  let roomCode = '';
  let options = '0123456789';
  let optionsLength = options.length;
  for (let i = 0; i < roomCodeLength; i++) {
    roomCode += options.charAt(Math.floor(Math.random() * optionsLength));
  }
  return roomCode;
}

module.exports = { getCardsCombination, createDeck, updateDeck, checkWinner, restartGame, generateRoomCode}
