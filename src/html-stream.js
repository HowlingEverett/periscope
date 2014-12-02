var pygmentize = require('pygmentize-bundled');
var Readable = require('stream').Readable;
var fs = require('fs');
var path = require('path');
var util = require('util');
var _ = require('underscore');

/*
Processes a HTML fragment to apply some transformations. By default, we transform
<pre> and <code> blocks with a language class set
*/
var HtmlStream = function(path, options) {
  Readable.call(this, {encoding: 'utf8'});

  var self = this;

  options = _.extend({

  }, options);

  fs.readFile(path, 'utf8', this._encode.bind(this, options));
};

util.inherits(HtmlStream, Readable);

HtmlStream.prototype._read = function(n) {
  // no-op
};

HtmlStream.prototype._encode = function(options, err, text) {
  var self = this;

  if (err) {
    return this.emit('error', err);
  }

  
};

module.exports = function(path, options) {
  return new HtmlStream(path, options);
};