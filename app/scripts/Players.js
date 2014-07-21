var handHistoryConverter = (function (handHistoryConverter, _) {
  'use strict';

  // internal dependencies
  var formatSpan = handHistoryConverter.formatSpan;
  var Size = handHistoryConverter.Size;
  var Player = handHistoryConverter.Player;

  // player aliases by game type and number of players
  var aliases = {
    'holdem': {
      '2': ['BTN', 'BB'],
      '3': ['BTN', 'SB', 'BB'],
      '4': ['BTN', 'SB', 'BB', 'UTG'],
      '5': ['BTN', 'SB', 'BB', 'UTG', 'CO'],
      '6': ['BTN', 'SB', 'BB', 'UTG', 'MP', 'CO'],
      '7': ['BTN', 'SB', 'BB', 'UTG', 'EP2', 'MP', 'CO'],
      '8': ['BTN', 'SB', 'BB', 'UTG', 'EP2', 'MP1', 'MP2', 'CO'],
      '9': ['BTN', 'SB', 'BB', 'UTG', 'EP2', 'EP3', 'MP1', 'MP2', 'CO'],
      '10': ['BTN', 'SB', 'BB', 'UTG', 'EP2', 'EP3', 'MP1', 'MP2', 'MP3', 'CO']
    }
  };

  // collection of players for a given hand
  var Players = function (hand, hhSegment) {
    var self = this;
    this.players = [];
    this.hideUsernames = hand.options.hideUsernames;

    // parse the hero's username
    var heroUsername = hand.parser.heroUsername(hhSegment);

    // parse the button seat number
    var buttonSeatNumber = hand.parser.buttonSeatNumber(hhSegment);
    if (buttonSeatNumber === null) {
      throw 'Button not found.';
    }

    // parse the players
    _.each(hand.parser.playersData(hhSegment), function (data) {
      self.players.push(new Player({
        'seatNumber': data.seatNumber,
        'username': data.username,
        'isHero': data.username === heroUsername,
        'stackSize': new Size({
          'amount': data.stackAmount
        }, hand.sizeOptions)
      }));
    });

    // check the number of players
    if (this.players.length < 2) {
      throw 'Players not found.';
    }

    // cycle the players array until the button is the first element
    while (this.players[0].seatNumber !== buttonSeatNumber) {
      this.players.push(this.players.shift());
    }

    _.each(this.players, function (player, index) {
      // set the player's position
      if (hand.type in aliases &&
          self.players.length in aliases[hand.type] &&
          index in aliases[hand.type][self.players.length]) {
        player.position = aliases[hand.type][self.players.length][index];
      }

      // set the player's aliases
      if (self.hideUsernames) {
        player.alias = 'position' in player ? player.position :
          'Seat ' + player.seatNumber;
        if (player.isHero) {
          player.alternateAlias = player.alias;
          player.alias = 'Hero';
        }
      } else {
        player.alias = player.username;
        if ('position' in player) {
          player.alternateAlias = player.position;
        }
      }
    });
  };

  Players.prototype.get = function (username) {
    if (typeof username === 'string') {
      var players = _.where(this.players, {'username': username});
      if (players.length > 0) {
        return players[0];
      }
    }
    return null;
  };

  Players.prototype.getHero = function () {
    var heroes = _.where(this.players, {'isHero': true});
    return heroes.length === 1 ? heroes[0] : null;
  };

  Players.prototype.getCurrentBetSize = function () {
    var size = new Size();
    _.each(this.players, function (player) {
      size.add(player.currentBetSize);
    });
    return size;
  };

  Players.prototype.resetCurrentBetSizes = function () {
    _.each(this.players, function (player) {
      player.currentBetSize.amount = 0;
    });
  };

  Players.prototype.html = function (inline) {
    // assume the iteration order matches the insertion order (starting at BTN)
    var html = _.map(this.players, function (player) {
      return player.html(inline);
    }).join(this.hideUsernames ? ' &nbsp; ' : '<br>');
    return formatSpan('players', html, inline);
  };

  handHistoryConverter.Players = Players;

  return handHistoryConverter;
}(handHistoryConverter || {}, _));
