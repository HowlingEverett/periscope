var marked = require('marked');
var pygmentize = require('pygmentize-bundled');
var Readable = require('stream').Readable;
var fs = require('fs');
var util = require('util');
var _ = require('underscore');


/*
Wraps the Marked library into a naive Readable stream that can be injected into
a pipeline, with some nice defaults. By default, enables Github-flavoured 
Markdown and pygments-based syntax highlighting. 

You can override the defaults by setting a key in the options object.
*/
var MarkdownStream = function(path, options) {
  Readable.call(this, {encoding: 'utf8'});

  var self = this;

  options = _.extend({
    gfm: true,
    pedantic: false,
    sanitize: true,
    highlight: function(code, lang, callback) {
      pygmentize({lang: lang, format: 'html'}, code, function(err, result) {
        callback(err, result.toString());
      });
    }
  }, options);

  fs.readFile(path, 'utf8', this._encode.bind(this, options));
};

util.inherits(MarkdownStream, Readable);

MarkdownStream.prototype._read = function(n) {
  // no-op
};

MarkdownStream.prototype._encode = function(options, err, text) {
  var self = this;

  if (err) {
    return this.emit('error', err);
  }
  marked(text, options, function(err, result) {
    self.push(result, 'utf8');
    // Required to stream emits its end event
    self.push(null);
  });
};

module.exports = function(path, options) {
  return new MarkdownStream(path, options);
};
