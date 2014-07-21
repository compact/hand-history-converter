var handHistoryConverter = (function (handHistoryConverter) {
  'use strict';

  // internal dependencies
  var formatSpan = handHistoryConverter.formatSpan;
  var Size = handHistoryConverter.Size;
  var Cards = handHistoryConverter.Cards;

  // the functions match() and html() are called by an Action object; each
  // action is of a single type taken by a single player
  var actionTypes = {};

  // holdem action types
  actionTypes.holdem = {
    'fold': {
      'match': function (hhLine) {
        var matches = hhLine.match(/^(.+?):? folds$/);
        if (matches !== null) {
          this.player = this.hand.players.get(matches[1]);
          return true;
        }
      },
      'html': function (inline) {
        return formatSpan('action-fold', this.player.alias + ' folds', inline);
      }
    },
    'preflopFolds': {
      'html': function (inline) {
        var html = this.number === 1 ? 'fold' : this.number + ' folds';
        return formatSpan('action-fold', html, inline);
      }
    },
    'check': {
      'match': function (hhLine) {
        var matches = hhLine.match(/^(.+?):? checks$/);
        if (matches !== null) {
          this.player = this.hand.players.get(matches[1]);
          return true;
        }
      },
      'html': function () {
        return this.player.alias + ' checks';
      }
    },
    'call': {
      'match': function (hhLine) {
        var matches = hhLine.match(
          /^(.+?):? calls ([^ ]+)( and is all-in|, and is all in)?$/
        );
        if (matches !== null) {
          this.player = this.hand.players.get(matches[1]);
          this.size = new Size({
            'amount': matches[2]
          }, this.hand.sizeOptions);
          this.player.currentBetSize.add(this.size);
          this.isAllIn = typeof matches[3] !== 'undefined';
          if (this.isAllIn) {
            this.player.isActive = true;
          }
          return true;
        }
      },
      'html': function () {
        var size = this.size.html();
        var allIn = this.isAllIn ? ' ' + size + ' (all-in)' : '';
        return this.player.alias + ' calls' + allIn;
      }
    },
    'bet': {
      'match': function (hhLine) {
        var matches = hhLine.match(
          /^(.+?):? bets ([^ ]+)( and is all-in|, and is all in)?$/
        );
        if (matches !== null) {
          this.player = this.hand.players.get(matches[1]);
          this.size = new Size({
            'amount': matches[2]
          }, this.hand.sizeOptions);
          this.player.currentBetSize.copy(this.size);
          this.isAllIn = typeof matches[3] !== 'undefined';
          if (this.isAllIn) {
            this.player.isActive = true;
          }
          return true;
        }
      },
      'html': function (inline) {
        var size = this.size.html();
        var allIn = this.isAllIn ? ' (all-in)' : '';
        var html = this.player.alias + ' bets ' + size + allIn;
        return formatSpan('action-bet', html, inline);
      }
    },
    'raise': {
      'match': function (hhLine) {
        var matches = hhLine.match(
          /^(.+?):? raises .*to ([^ ]+)( and is all-in|, and is all in)?$/
        );
        if (matches !== null) {
          this.player = this.hand.players.get(matches[1]);
          this.size = new Size({
            'amount': matches[2]
          }, this.hand.sizeOptions);
          this.player.currentBetSize.copy(this.size);
          this.isAllIn = typeof matches[3] !== 'undefined';
          if (this.isAllIn) {
            this.player.isActive = true;
          }
          return true;
        }
      },
      'html': function (inline) {
        var size = this.size.html();
        var allIn = this.isAllIn ? ' (all-in)' : '';
        var html = this.player.alias + ' raises to ' + size + allIn;
        return formatSpan('action-bet', html, inline);
      }
    },
    'win': {
      'match': function (hhLine) {
        var matches = hhLine.match(/^Seat \d+: ([^\(]+) .*collected \((.+)\)/);
        if (matches !== null) {
          this.player = this.hand.players.get(matches[1]);
          this.size = new Size({
            'amount': matches[2]
          }, this.hand.sizeOptions);
          return true;
        }
      },
      'html': function () {
        return this.player.alias + ' wins ' + this.size.html();
      }
    },
    'showAndWin': {
      'match': function (hhLine) {
        var matches = hhLine.match(
          /^Seat \d+: ([^\(]+) .*showed \[(.+)\] and won \((.+)\)(.+)$/
        );
        if (matches !== null) {
          this.player = this.hand.players.get(matches[1]);
          this.size = new Size({
            'amount': matches[3]
          }, this.hand.sizeOptions);
          this.cards = new Cards(matches[2]);
          this.handRanking = matches[4] !== 'undefined' ?
            matches[4].trim().replace(/^(with|-) /, '') : '';
          return true;
        }
      },
      'html': function (inline) {
        var handRanking = this.handRanking !== '' ?
          ' (' + this.handRanking + ')' : '';
        return this.player.alias + ' shows ' + this.cards.html(inline) +
          ' and wins ' + this.size.html() + handRanking;
      }
    },
    'showAndLose': {
      'match': function (hhLine) {
        // two possible patterns
        var matches = hhLine.match(
          /^Seat \d+: ([^\(]+) .*mucked \[(.+)\](.+)$/
        );

        if (matches === null) {
          matches = hhLine.match(
            /^Seat \d+: ([^\(]+) .*showed \[(.+)\] and lost(.+)$/
          );
        }

        if (matches !== null) {
          this.player = this.hand.players.get(matches[1]);
          this.cards = new Cards(matches[2]);
          this.handRanking = matches[3] !== 'undefined' ?
            matches[3].trim().replace(/^(with|-) /, '') : '';
          return true;
        }
      },
      'html': function (inline) {
        var handRanking = this.handRanking !== '' ?
          ' (' + this.handRanking + ')' : '';
        return this.player.alias + ' shows ' + this.cards.html(inline) +
          handRanking;
      }
    },
    'post': { // TODO: show non-mandatory posts
      'match': function (hhLine) {
        var matches = hhLine.match(/^(.+?):? posts .+ (.+)$/);
        if (matches !== null) {
          this.hand.players.get(matches[1]).currentBetSize.copy(new Size({
            'amount': matches[2]
          }));
          return true;
        }
      }
    },
    'returnUncalledBet': {
      'match': function (hhLine) {
        var matches = hhLine.match(
          /^Uncalled bet ?o?f? \(?(.+?)\)? returned to (.+)$/
        );
        if (matches !== null) {
          this.hand.players.get(matches[2]).currentBetSize.subtract(new Size({
            'amount': matches[1]
          }));
          return true;
        }
      }
    }
  };

  handHistoryConverter.actionTypes = actionTypes;

  return handHistoryConverter;
}(handHistoryConverter || {}));
