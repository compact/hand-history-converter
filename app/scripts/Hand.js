var handHistoryConverter = (function (handHistoryConverter, _) {
  'use strict';

  var Size = handHistoryConverter.Size;
  var Players = handHistoryConverter.Players;
  var Street = handHistoryConverter.Street;
  var Parser = handHistoryConverter.Parser;

  // a hand, the highest level object containing all other hand-related objects
  var Hand = function (hh, options) {
    var self = this;

    // sanitize the hh
    hh = hh.trim().replace(/\r\n|\r|\n/g, '\n');

    // options
    this.options = _.defaults(options || {}, {
      'hideUsernames': true,
      'betsInBB': false
    });

    // create parser
    this.parser = new Parser();

    // for the game info, get the first 3 lines just to be safe (for example,
    // HEM adds an extra line above the original hh)
    var matches = hh.match(/^.*\n.*\n.*$/m);
    if (matches === null) {
      throw 'Failed to parse the given hand history format.';
    }
    var header = matches[0];

    // site, displayed to the user
    this.site = this.parser.site(header);
    if (this.site === null) {
      throw 'Site not found.';
    }

    // game label, displayed to the user
    this.label = this.parser.label(header);

    // game type, for internal use
    this.type = this.parser.type(header);

    // blind sizes
    var blinds = this.parser.blinds(header);
    if (blinds === null) {
      throw 'Stakes not found.';
    }
    this.sbSize = new Size({
      'amount': blinds.sbAmount
    });
    this.bbSize = new Size({
      'amount': blinds.bbAmount
    });

    // currency
    this.currency = this.bbSize.currency;

    // argument for the Size constructor
    this.sizeOptions = {
      'unit': this.options.betsInBB ? 'bb' : 'currency',
      'bbSize': this.bbSize
    };

    // parse the players; keys are player aliases ('Hero', 'BTN', ...)
    this.players = {};
    this.players = new Players(this, hh.match(/[^]+\n\*\*\* /)[0]);

    // running pot size which gets updated at the end of each street
    this.potSize = new Size({
      'currency': this.currency
    }, this.sizeOptions);

    // streets
    var hhSegments = this.parser.streetHHSegments(hh);
    this.streets = _.map(hhSegments, function (hhSegment, label) {
      return new Street(self, label, hhSegment);
    });

    // identify the final street with actions before showdown, and set the
    // players remaining in it as active
    var finalStreetWithAction, i = 0;
    do {
      finalStreetWithAction = this.streets.slice(-2 - i, -1 - i)[0];
      i++;
    } while (finalStreetWithAction.actions.length === 0);
    finalStreetWithAction.setPlayersAsActive();
  };

  Hand.prototype.html = function (inline) {
    var html = '<strong>' + this.site + ': ' + this.label + '</strong><br>';
    html += this.players.html(inline) + '<br><br>';
    html += _.map(this.streets, function (street) {
      return street.html(inline);
    }).join('<br><br>');

    // add line breaks for plain text copy and pasting in inline mode
    html = html.replace(/<br>/g, '<br>\r\n');

    return html;
  };

  handHistoryConverter.Hand = Hand;

  return handHistoryConverter;
}(handHistoryConverter || {}, _));
