const suits = ['S', 'H', 'D', 'C'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const deck = new Array();
const players = new Array();

let agreement_data, winProbs, dealers;

// load data set
d3.csv('data/hand_value_averages.csv', function (data) {
  data.forEach(function (d) {
    d.hand_value = +d.hand_value;
    d.tookCard = (+d.tookCard * 100).toFixed(0);
  });
  agreement_data = data;
});

d3.csv('data/winProbs.csv', function (data) {
  data.forEach(function (d) {
    d.handValue = +d.handValue;
  });
  winProbs = data;
});

function createDeck() {
  deck = new Array();
  for (var i = 0; i < values.length; i++) {
    for (var x = 0; x < suits.length; x++) {
      var weight = parseInt(values[i]);
      if (values[i] == 'J' || values[i] == 'Q' || values[i] == 'K') weight = 10;
      if (values[i] == 'A') weight = 11;
      var card = { Value: values[i], Suit: suits[x], Weight: weight };
      deck.push(card);
    }
  }
}

function createPlayer() {
  players = new Array();
  var hand = new Array();
  var player = { Name: 'Player', ID: 1, Points: 0, Hand: hand, hasAce: 0 };
  players.push(player);
}

function createDealer() {
  dealers = new Array();
  var hand = new Array();
  var dealer = { Name: 'Dealer', ID: 1, Points: 0, Hand: hand, hasAce: 0 };
  dealers.push(dealer);
}

function createPlayersUI() {
  document.getElementById('players').innerHTML = '';

  var div_player = document.createElement('div');

  var div_points = document.createElement('div');
  var div_hand = document.createElement('div');

  div_points.className = 'points';
  div_points.id = 'points_0';
  div_player.id = 'player_0';
  div_player.className = 'player';
  div_hand.id = 'hand_0';

  var h = document.createElement('h1');
  var t = document.createTextNode('Player');
  h.appendChild(t);
  div_player.appendChild(h);

  div_player.appendChild(div_points);
  div_player.appendChild(div_hand);
  document.getElementById('players').appendChild(div_player);
}

function createDealersUI() {
  document.getElementById('dealers').innerHTML = '';

  var div_dealer = document.createElement('div');

  var div_points_dealer = document.createElement('div');
  var div_hand_dealer = document.createElement('div');

  div_points_dealer.className = 'points';
  div_points_dealer.id = 'points_dealer_0';
  div_dealer.id = 'dealer_0';
  div_dealer.className = 'player';
  div_hand_dealer.id = 'hand_dealer_0';

  var h = document.createElement('h1');
  var t = document.createTextNode('Dealer');
  h.appendChild(t);
  div_dealer.appendChild(h);

  div_dealer.appendChild(div_points_dealer);
  div_dealer.appendChild(div_hand_dealer);
  document.getElementById('dealers').appendChild(div_dealer);
}

function shuffle() {
  // for 1000 turns
  // switch the values of two random cards
  for (var i = 0; i < 1000; i++) {
    var location1 = Math.floor(Math.random() * deck.length);
    var location2 = Math.floor(Math.random() * deck.length);
    var tmp = deck[location1];

    deck[location1] = deck[location2];
    deck[location2] = tmp;
  }
}

function startblackjack() {
  document.getElementById('gameResult').innerHTML = '';
  document.getElementById('movePercent').innerHTML = '';

  document.getElementById('btnStart').value = 'RESTART';
  document.getElementById('hitButton').disabled = false;
  document.getElementById('standButton').disabled = false;

  document.getElementById('btnStart').style.display = 'none';
  document.getElementById('hitButton').style.display = 'inline-block';
  document.getElementById('standButton').style.display = 'inline-block';

  document.getElementById('winPercentContainer').style.display = 'inline-block';

  // deal 2 cards to every player object
  createDeck();
  shuffle();
  createPlayer();
  createDealer();
  createPlayersUI();
  createDealersUI();
  dealHands();
  document.getElementById('player_0').classList.add('active');

  check();
}

function dealHands() {
  // alternate handing cards to each player
  // 2 cards each
  for (var i = 0; i < 2; i++) {
    var card = deck.pop();
    if (card.Value == 'A') {
      players[0].hasAce = 1;
    }
    players[0].Hand.push(card);
    renderCard(card, 'player_0');
    updatePoints();

    var card = deck.pop();
    if (card.Value == 'A') {
      dealers[0].hasAce = 1;
    }
    dealers[0].Hand.push(card);
    renderCard(card, 'dealer_0');
    updatePoints();
  }
}

function renderCard(card, hand_id) {
  var hand = document.getElementById(hand_id);
  hand.appendChild(getCardUI(card));
}

function getCardUI(card) {
  var el = document.createElement('img');

  el.src = 'card_imgs/' + card.Value + card.Suit + '.png';

  el.className = 'card';
  //el.innerHTML = card.Value + '<br/>' + icon;
  return el;
}

// returns the number of points that a player has in hand
function getPoints() {
  // player
  var points = 0;
  for (var i = 0; i < players[0].Hand.length; i++) {
    points += players[0].Hand[i].Weight;
  }

  // if a player has an Ace (value of 11), it can be considered value 1 to prevent bust
  if (points > 21 && players[0].hasAce == 1) {
    points = points - 10;
  }

  players[0].Points = points;

  // dealer
  points = 0;
  for (var i = 0; i < dealers[0].Hand.length; i++) {
    points += dealers[0].Hand[i].Weight;
  }

  // if a dealer has an Ace (value of 11), it can be considered value 1 to prevent bust
  if (points > 21 && dealers[0].hasAce == 1) {
    points = points - 10;
  }

  dealers[0].Points = points;
}

function updatePoints() {
  getPoints();
  document.getElementById('points_0').innerHTML = players[0].Points;
  document.getElementById('points_dealer_0').innerHTML = dealers[0].Points;
}

function dealerDraw() {
  // pop a card from the deck to the current player
  // check if current player new points are over 21
  var card = deck.pop();
  if (card.Value == 'A') {
    dealers[0].hasAce = 1;
  }
  dealers[0].Hand.push(card);
  renderCard(card, 'dealer_0');
  updatePoints();
  check();
}

function hitMe() {
  var alsoHit = agreement_data.filter(function (d) {
    return d.hand_value == players[0].Points;
  })[0].tookCard;
  document.getElementById('movePercent').innerHTML =
    alsoHit + '% of players also would have taken another card';

  // pop a card from the deck to the current player
  // check if current player new points are over 21
  var card = deck.pop();
  if (card.Value == 'A') {
    players[0].hasAce = 1;
  }
  players[0].Hand.push(card);
  renderCard(card, 'player_0');

  if (dealers[0].Points < 17) {
    dealerDraw();
  }

  updatePoints();

  check();
}

function stay() {
  var wouldaHit = agreement_data.filter(function (d) {
    return d.hand_value == players[0].Points;
  })[0].tookCard;
  var alsoStood = 100 - Number(wouldaHit);
  document.getElementById('movePercent').innerHTML =
    alsoStood + '% of players also would have stayed';

  document.getElementById('hitButton').disabled = true;
  document.getElementById('standButton').disabled = true;

  document.getElementById('player_0').classList.remove('active');
  document.getElementById('player_0').classList.add('active');

  while (dealers[0].Points < 17) {
    dealerDraw();
  }

  end();
}

function updateWinPercent(gameOver = 0, winProb) {
  if (gameOver == 0) {
    // game isn't over, update win probability using player hand value and data
    // need to get player hand value
    var someProbs = winProbs.filter(function (d) {
      return d.handValue == players[0].Points;
    })[0];

    // need to get round
    // round = number of cards player is holding - 1 (since round 1 starts with 2 cards)
    var numCurrentCards = document
      .getElementById('player_0')
      .getElementsByTagName('img').length;

    // need to cross reference with winProbs dataset
    var winProb = (
      someProbs['round' + (numCurrentCards - 1).toString()] * 100
    ).toFixed(0);
  }

  // update frontend
  document.getElementById('winPer').innerHTML =
    '<span style='float:left; margin-left:10px;'>Likelihood Of Player Win</span>' +
    winProb.toString() +
    '%';
  document.getElementById('winPer').style.width = winProb.toString() + '%';

  return;
}

function end() {
  document.getElementById('btnStart').style.display = 'inline-block';
  document.getElementById('hitButton').style.display = 'none';
  document.getElementById('standButton').style.display = 'none';

  getPoints();

  if (players[0].Points == 21) {
    document.getElementById('gameResult').innerHTML = 'Blackjack!';
  } else if (players[0].Points > 21) {
    document.getElementById('gameResult').innerHTML = 'Bust!';
  } else if (dealers[0].Points > 21) {
    document.getElementById('gameResult').innerHTML = 'Dealer bust!';
  } else if (dealers[0].Points > players[0].Points) {
    document.getElementById('gameResult').innerHTML = 'Dealer wins!';
  } else if (dealers[0].Points < players[0].Points) {
    document.getElementById('gameResult').innerHTML = 'You win!';
  } else if (dealers[0].Points == players[0].Points) {
    document.getElementById('gameResult').innerHTML = 'Push!';
  }
}

function check() {
  if (players[0].Points > 21) {
    end();
    updateWinPercent(1, '0');
  } else if (players[0].Points == 21) {
    end();
    updateWinPercent(1, '100');
  } else if (dealers[0].Points > 21) {
    end();
    updateWinPercent(1, '100');
  } else if (dealers[0].Points == 21) {
    end();
    updateWinPercent(1, '0');
  } else {
    updateWinPercent();
  }
}

window.addEventListener('load', function () {
  createDeck();
  shuffle();
  createPlayer();
});
