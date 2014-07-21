var handHistoryConverter = (function (handHistoryConverter) {
  'use strict';

  // internal dependencies
  var formatSpan = handHistoryConverter.formatSpan;
  var Size = handHistoryConverter.Size;

  // a player
  var Player = function (data) {
    this.seatNumber = data.seatNumber || 0;
    this.username = data.username || '';
    this.alias = data.alias || 'Seat ' + data.seatNumber;
    this.stackSize = data.stackSize;
    this.isHero = data.isHero || false;

    // the player's bet size on the current street, used for internal
    // calculation and is never output
    this.currentBetSize = new Size();

    // determines whether this player is highlighted in the player list (if they
    // are in the final street with actions, or are all-in)
    this.isActive = false;

    // the optional properties 'position' and 'alternateAlias' may be set
    // directly
  };

  Player.prototype.html = function (inline) {
    // alias
    var html = this.alias;

    // alternate alias
    if (typeof this.alternateAlias === 'string' &&
        this.alternateAlias.length > 0) {
      html += ': ' + this.alternateAlias;
    }

    // stack size
    html += ' (' + this.stackSize.html() + ')';

    // classes
    var classes = 'player ' +
      (this.isActive ? 'player-active' : 'player-inactive');

    return formatSpan(classes, html, inline);
  };

  handHistoryConverter.Player = Player;

  return handHistoryConverter;
}(handHistoryConverter || {}));
