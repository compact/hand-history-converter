var handHistoryConverter = (function (handHistoryConverter, _) {
  'use strict';

  var Hand = handHistoryConverter.Hand;

  // convert the given hand histories and return a string
  var convert = function (hhs, options) {
    hhs = hhs.split(/\n{2,}/);

    var html = [];
    var inlineHTMLs = [];

    _.each(hhs, function (hh) {
      try {
        var hand = new Hand(hh, options);

        html.push(hand.html());
        inlineHTMLs.push(hand.html(true));
      } catch (e) {
        console.warn(typeof e === 'object' ? e.stack : e);
      }
    });

    return {
      'html': html.join('<br><br><br>\n\n\n'),
      'inlineHTML': inlineHTMLs.join('<br><br><br>\n\n\n')
    };
  };

  handHistoryConverter.convert = convert;

  return handHistoryConverter;
}(handHistoryConverter || {}, _));
