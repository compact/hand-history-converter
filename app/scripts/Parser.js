var handHistoryConverter = (function (handHistoryConverter, _) {
  'use strict';

  // methods for parsing various components of a hand
  var Parser = function () {
  };

  // game type
  Parser.prototype.type = function (hhSegment) {
    return hhSegment.match(/Hold'em|Omaha/) ? 'holdem' : '';
  };

  // site
  Parser.prototype.site = function (hhSegment) {
    if (hhSegment.match(/PokerStars/)) {
      this.site = 'PokerStars';
    } else if (hhSegment.match(/Full Tilt Poker/)) {
      this.site = 'Full Tilt Poker';
    } else {
      this.site = null;
    }
    return this.site;
  };

  // game label; all submatches get joined for the label
  Parser.prototype.label = function (hhSegment) {
    var pattern;
    switch (this.site) {
      case 'PokerStars':
        pattern = /PokerStars(.*) Hand .+: (.+) - /;
        break;
      case 'Full Tilt Poker':
        pattern = /Full Tilt Poker[^-]+ - (.+) - \d\d:\d\d/;
        break;
    }

    var matches = hhSegment.match(pattern);
    if (matches === null) {
      return '';
    }

    matches.shift();
    return _.map(matches, function (match) { // trim all matches
      return match.trim();
    }).join(' ');
  };

  // small blind and big blind amounts, including currency signs if they exist
  Parser.prototype.blinds = function (hhSegment) {
    var matches = hhSegment.match(/([\$\d\.]+)\/([\$\d\.]+)/);
    return matches === null ? null : {
      'sbAmount': matches[1],
      'bbAmount': matches[2]
    };
  };

  // hero username
  Parser.prototype.heroUsername = function (hhSegment) {
    var matches = hhSegment.match(/^Dealt to (.+) \[/m);
    return matches === null ? null : matches[1];
  };

  // button seat number
  Parser.prototype.buttonSeatNumber = function (hhSegment) {
    var pattern;
    switch (this.site) {
      case 'PokerStars':
        pattern = /Seat #(\d) is the button$/m;
        break;
      case 'Full Tilt Poker':
        pattern = /^The button is in seat #(\d+)$/m;
        break;
    }

    var matches = hhSegment.match(pattern);
    return matches === null ? null : parseInt(matches[1], 10);
  };

  // players
  // PokerStars has an extra string 'in chips' after the stack size
  Parser.prototype.playersData = function (hhSegment) {
    var pattern = /^Seat (\d): (.+) \(([\$\d\.]+)[ \)]/mg;
    var matches;
    var playersData = [];
    while ((matches = pattern.exec(hhSegment)) !== null) {
      playersData.push({
        'seatNumber': parseInt(matches[1]),
        'username': matches[2],
        'stackAmount': matches[3]
      });
    }
    return playersData;
  };

  // streets
  Parser.prototype.streetHHSegments = function (hh) {
    // PokerStars has the colon and Full Tilt doesn't
    var patterns = {
      'Preflop': /^(.+:? posts [^\*]+\*\*\* HOLE CARDS \*\*\*[^\*]+)\*\*\*/m,
      'Flop': /^\*\*\* FLOP \*\*\*([^\*]+)\*\*\*/m,
      'Turn': /^\*\*\* TURN \*\*\*([^\*]+)\*\*\*/m,
      'River': /^\*\*\* RIVER \*\*\*([^\*]+)\*\*\*/m,
      'Result': /^\*\*\* SUMMARY \*\*\*([^]+)$/m
    };

    var hhSegments = {};
    _.each(patterns, function (pattern, label) {
      var matches = hh.match(pattern);
      if (matches !== null) {
        hhSegments[label] = matches[1];
      }
    });
    return hhSegments;
  };

  handHistoryConverter.Parser = Parser;

  return handHistoryConverter;
}(handHistoryConverter || {}, _));
