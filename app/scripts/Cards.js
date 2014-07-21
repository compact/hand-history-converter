var handHistoryConverter = (function (handHistoryConverter, _) {
  'use strict';

  // internal dependencies
  var formatSpan = handHistoryConverter.formatSpan;

  // card suit symbols
  var suitSymbols = {
    's': '♠',
    'h': '♥',
    'c': '♣',
    'd': '♦'
  };

  // a collection of cards; e.g. cards on the flop
  var Cards = function (hhSegment) {
    this.set(hhSegment);
  };

  Cards.prototype.set = function (hhSegment) {
    if (typeof hhSegment === 'string') {
      this.cards = _.map(hhSegment.trim().split(' '), function (hhSegment) {
        return new Card(hhSegment);
      });
    } else {
      this.cards = [];
    }
  };

  Cards.prototype.html = function (inline) {
    return _.map(this.cards, function (card) {
      return card.html(inline);
    }).join(' ');
  };

  // a single card; private
  var Card = function (hhSegment) {
    this.rank = hhSegment.substr(0, 1);
    this.suit = hhSegment.substr(1, 1);
  };

  Card.prototype.html = function (inline) {
    var html = this.rank + suitSymbols[this.suit];
    return formatSpan('card card-' + this.suit, html, inline);
  };

  handHistoryConverter.Cards = Cards;

  return handHistoryConverter;
}(handHistoryConverter || {}, _));
