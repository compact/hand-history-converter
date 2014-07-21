var handHistoryConverter = (function (handHistoryConverter) {
  'use strict';

  // any monetary amount, such as stack size or bet size; in the context of this
  // app, 'Size' refers to an object and 'amount' refers to a string (may
  // contain currency symbol)
  var Size = function (data, options) {
    if (typeof data === 'object') {
      if (typeof data.amount === 'string' && data.amount.match(/^[\$£€]/)) {
        this.currency = data.amount.substr(0, 1);
        this.amount = window.parseFloat(data.amount.substr(1));
      } else {
        this.currency = data.currency || '';
        this.amount = data.amount || 0;
      }
    } else {
      this.currency = '';
      this.amount = 0;
    }

    this.options = options || {};
  };

  Size.prototype.copy = function (size) {
    this.currency = size.currency;
    this.amount = size.amount;
    this.options = size.options;
  };

  Size.prototype.add = function (size) {
    this.amount += size.amount;
  };

  Size.prototype.subtract = function (size) {
    this.amount -= size.amount;
  };

  Size.prototype.html = function () {
    if ('unit' in this.options && this.options.unit === 'bb') {
      var amount = (this.amount / this.options.bbSize.amount).toFixed(2);
      if (amount.substr(-3) === '.00') {
        amount = amount.substr(0, amount.length - 3);
      } else if (amount.substr(-1) === '0') {
        amount = amount.substr(0, amount.length - 1);
      }
      return amount + ' bb';
    } else {
      return this.currency + this.amount.toFixed(2);
    }
  };

  handHistoryConverter.Size = Size;

  return handHistoryConverter;
}(handHistoryConverter || {}));
