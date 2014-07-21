var handHistoryConverter = (function (handHistoryConverter, _) {
  'use strict';

  // internal dependencies
  var Size = handHistoryConverter.Size;
  var Cards = handHistoryConverter.Cards;
  var Action = handHistoryConverter.Action;

  // each of the following is considered a street: Preflop, Flop, Turn, River,
  // Result/Showdown
  var Street = function (hand, label, hhSegment) {
    var self = this;

    this.label = label;
    this.players = hand.players;
    this.startingPotSize = new Size();
    this.startingPotSize.copy(hand.potSize); // doesn't change
    this.potSize = hand.potSize; // changes
    this.cards = new Cards();
    this.actions = [];

    // reset player bets for this street
    this.players.resetCurrentBetSizes();

    var matches = hhSegment.match(/\[([^\]]+)\][^\]]+$/m);

    // parse cards (except in Result)
    if (matches !== null && this.label !== 'Result') {
      this.cards.set(matches[1]);
    }

    // parse actions
    var hhLines = hhSegment.split('\n');
    var action;
    var runningPreflopFolds = 0;
    _.each(hhLines, function (hhLine) {
      action = new Action(hand, hhLine);

      if (action.typeKey !== null) {
        if (self.label === 'Preflop') {
          // combine preflop folds
          if (action.typeKey === 'fold') {
            runningPreflopFolds++;
          } else {
            if (runningPreflopFolds > 0) {
              self.actions.push(new Action(hand, null, {
                'typeKey': 'preflopFolds',
                'number': runningPreflopFolds
              }));
            }
            runningPreflopFolds = 0;
            self.actions.push(action);
          }
        } else {
          // standard case
          self.actions.push(action);
        }
      }

      // showdown check (to change the Result label to Showdown)
      if (action.typeKey === 'showAndWin') {
        self.label = 'Showdown';
      }
    });

    // add any leftover preflop folds
    if (runningPreflopFolds > 0) {
      this.actions.push(new Action(hand, null, {
        'typeKey': 'preflopFolds',
        'number': runningPreflopFolds
      }));
    }

    // calculate the new pot size at the end of this street
    this.potSize.add(this.players.getCurrentBetSize());
  };

  // for each player with an action in this street, set them as active; this is
  // used for highlighting players in the player list
  Street.prototype.setPlayersAsActive = function () {
    _.each(this.actions, function (action) {
      if ('player' in action && action.typeKey !== 'post') {
        action.player.isActive = true;
      }
    });
  };

  Street.prototype.html = function (inline) {
    // label
    var html = '<strong>' + this.label + ':</strong> ';

    // pot size (non-preflop only)
    if (this.label !== 'Preflop') {
      html += '(' + this.startingPotSize.html() + ') ';
    }

    // hero cards (preflop only)
    if (this.label === 'Preflop') {
      var hero = this.players.getHero();
      if (hero !== null) {
        html += hero.alias + ' is ' + hero.position + ' with ';
      }
    }

    // cards
    html += this.cards.html(inline);

    // actions
    if (this.label === 'Showdown') {
      // for a showdown, cycle through the actions to show a winning hand first
      while (this.actions[0].typeKey !== 'win' &&
          this.actions[0].typeKey !== 'showAndWin') {
        this.actions.push(this.actions.shift());
      }
    }

    var actionHTMLs = [], actionHTML;
    _.each(this.actions, function (action) {
      actionHTML = action.html(inline);
      if (actionHTML !== '') {
        actionHTMLs.push(actionHTML);
      }
    });
    if (actionHTMLs.length > 0) {
      html += '<br>' + actionHTMLs.join(this.label === 'Showdown' ? '<br>' : ', ');
    }

    return html;
  };

  handHistoryConverter.Street = Street;

  return handHistoryConverter;
}(handHistoryConverter || {}, _));
