var handHistoryConverter = (function (handHistoryConverter, _) {
  'use strict';

  // internal dependencies
  var actionTypes = handHistoryConverter.actionTypes;

  // betting action
  var Action = function (hand, hhLine, properties) {
    var self = this;

    _.merge(this, {
      'hand': hand,
      'typeKey': null
    }, properties);

    hhLine = hhLine || '';
    hhLine = hhLine.trim();

    _.some(actionTypes.holdem, function (actionType, typeKey) {
      if ('match' in actionType && actionType.match.call(self, hhLine)) {
        self.typeKey = typeKey;
        return true;
      }
    });
  };

  Action.prototype.html = function (inline) {
    if (!(this.typeKey in actionTypes[this.hand.type])) {
      console.warn(this);
      throw 'Invalid action type.';
    }

    // html method not defined
    if (!('html' in actionTypes[this.hand.type][this.typeKey])) {
      return '';
    }

    return actionTypes[this.hand.type][this.typeKey].html.call(this, inline);
  };

  handHistoryConverter.Action = Action;

  return handHistoryConverter;
}(handHistoryConverter || {}, _));
