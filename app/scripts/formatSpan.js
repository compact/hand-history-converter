var handHistoryConverter = (function (handHistoryConverter) {
  'use strict';

  // keys are classes; these inline styles must match with main.scss
  var inlineStyles = {
    'players': 'font-size: .85em;',
    'player player-active': 'white-space: nowrap; color: #c00;',
    'player player-inactive':
      'white-space: nowrap; color: #888; font-style: italic;',
    'action-fold': 'color: #888; font-style: italic;',
    'card card-s': 'font-weight: bold; color: #000',
    'card card-h': 'font-weight: bold; color: #f00',
    'card card-c': 'font-weight: bold; color: #080',
    'card card-d': 'font-weight: bold; color: #00f'
  };

  // return the html of a span with the given classes and inner html
  var formatSpan = function (classes, html, inline) {
    if (!inline) {
      return '<span class="' + classes + '">' + html + '</span>';
    } else {
      return '<span style="' + inlineStyles[classes] + '">' + html + '</span>';
    }
  };

  handHistoryConverter.formatSpan = formatSpan;

  return handHistoryConverter;
}(handHistoryConverter || {}));
