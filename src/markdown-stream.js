var marked = require('marked');
var pygmentize = require('pygmentize-bundled');
var Transform = require('stream').Transform;
var fs = require('fs');
var util = require('util');
var _ = require('underscore');


/*
Wraps the Marked library into a naive Readable stream that can be injected into
a pipeline, with some nice defaults. By default, enables Github-flavoured 
Markdown and pygments-based syntax highlighting. 

You can override the defaults by setting a key in the options object.
*/
var MarkdownStream = function(options) {
  Transform.call(this, {encoding: 'utf8'});

  this.options = _.extend({
    gfm: true,
    pedantic: false,
    sanitize: true,
    highlight: function(code, lang, callback) {
      pygmentize({lang: lang, format: 'html'}, code, function(err, result) {
        callback(err, result.toString());
      });
    }
  }, options);

  this._delimiterPattern = /\n\n|\n$/;
  this._fragment = '';
};

util.inherits(MarkdownStream, Transform);

function chunkIsLine(chunk) {
  return chunk.substr(-1) === '\n';
}

MarkdownStream.prototype._transform = function(chunk, encoding, callback) {
  var self = this;
  var fragment = chunk.toString();
  var text, parts;

  this._fragment += fragment;
  if (this._fragment.match(this._delimiterPattern)) {
    if (chunkIsLine(this._fragment)) {
      text = this._fragment;
      this._fragment = '';
    } else {
      parts = this._fragment.split(this._delimiterPattern);
      this._fragment = parts.pop();
      text = parts.join(this._delimiterPattern);
    }

    marked(text, this.options, function(err, result) {
      if (err) {
        this.emit('error', err);
        return callback();
      }
      self.push(result, 'utf8');
      callback();
    });
  } else {
    callback();
  }
};

MarkdownStream.prototype._flush = function(callback) {
  if (this._fragment.length > 0) {
    marked(text, this.options, function(err, result) {
      if (err) {
        this.emit('error', err);
        return callback();
      }
      self.push(result, 'utf8');
      callback();
    });
  } else {
    callback();
  }
};

module.exports = function(options) {
  return new MarkdownStream(options);
};
