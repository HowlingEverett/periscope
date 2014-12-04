var Transform = require('stream').Transform;
var util = require('util');
var _ = require('underscore');
var htmlparser = require('htmlparser2');

var HEADING_LEVELS = {
  h1: 1,
  h2: 2,
  h3: 3,
  h4: 4
}

var TocGeneratorStream = function (options) {
  Transform.call(this, {encoding: 'utf8'});

  this.options = _.extend({

  }, options);

  this._headingLevel = 1;
  this._atStart = true;
  this._open = '<ul class="toc">';
  this._close = '</ul>';
  this._writingHeading = false;
};

util.inherits(TocGeneratorStream, Transform);

TocGeneratorStream.prototype._transform = function(chunk, encoding, callback) {
  var self = this;
  chunk = chunk.toString();

  var parser = new htmlparser.Parser({
    onopentag: function (name, attrs) {
      if (self._atStart) {
        self.push(self._open);
        self._atStart = false;
      }

      var level = HEADING_LEVELS[name];
      if (level) {
        this._headingId = attrs.id;

        if (level > this._headingLevel) {
          self.push('<ul><li>');
        } else if (level < this._headingLevel) {
          self.push('</ul><li>');
        } else {
          self.push('<li>');
        }
        self.push('<a href="#' + attrs.id + '">');
        this._headingLevel = level;
        self._writingHeading = true;
      }
    },
    ontext: function (text) {
      if (self._writingHeading) {
        self.push(text);
      };
    },
    onclosetag: function (name) {
      var level = HEADING_LEVELS[name];
      if (level) {
        self.push('</a></li>');
        self._writingHeading = false;
      }
    },
    onend: callback
  });
  parser.write(chunk);
  parser.end();
};

TocGeneratorStream.prototype._flush = function (callback) {
  this.push(this._close);
  callback();
};

module.exports = function (options) {
  return new TocGeneratorStream(options);
}