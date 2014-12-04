var pygmentize = require('pygmentize-bundled');
var Transform = require('stream').Transform;
var fs = require('fs');
var path = require('path');
var util = require('util');
var _ = require('underscore');
var async = require('async');

/*
Processes a HTML fragment to apply some transformations. By default, we transform
<code> blocks with a language class set into Pygmentized versions of themselves.
*/
var HtmlStream = function(path, options) {
  Transform.call(this, {encoding: 'utf8'});

  options = _.extend({

  }, options);

  this._startPat = /<code.+class=(?:"|')lang-(.+)(?:"|')>/i;
  this._endPat = /<\/code>/i;
  this._fragment = '';
};

util.inherits(HtmlStream, Transform);

HtmlStream.prototype._transform = function(chunk, encoding, callback) {
  var startMatch, endMatch, startIndex, endIndex, lang, fragment, code, self,
      codeMatches;
  codeMatches = findMatches(this._fragment + chunk.toString(), this._startPat, this._endPat);
  self = this;

  if (codeMatches.length > 0) {
    async.eachSeries(codeMatches, highlightCode, finalizeChunk);
  } else {
    this.push(chunk);
    return callback();
  }

  function findMatches(fragment, startPat, endPat) {
    var codeMatches = [];
    while(startMatch = startPat.exec(fragment)) {
      startIndex = startMatch.index + startMatch[0].length;

       // Make sure we get an end AFTER the start.
      endMatch = endPat.exec(fragment.substring(startIndex));
      // If we haven't matched a close block for our open block, this fragment
      // is incomplete so we should just move on.
      if (!endMatch) {
        break;
      }
      endMatch.index = startIndex + endMatch.index;

      codeMatches.push({start: startMatch, end: endMatch, chunk: fragment});
      fragment = fragment.substring(endMatch.index);
    }
    this._fragment = fragment;
    return codeMatches;
  }

  function highlightCode (match, callback) {
    var startIndex, endIndex, code, encoded, lang;

    startIndex = match.start.index + match.start[0].length;
    endIndex = match.end.index;
    lang = match.start[1];
    encoded = match.chunk.substring(0, startIndex);
    code = match.chunk.substring(startIndex, endIndex);
    pygmentize({lang: lang,  format: 'html'}, code, 
      function (err, highlighted) {
        if (err) {
          self.emit('error', err);
          return callback(err);
        }
        highlighted = highlighted.toString();
        encoded += highlighted;
        self.push(encoded);
        callback();
      }
    );
  }

  function finalizeChunk (err) {
    self.push(this._fragment);
    callback();
  }
};

module.exports = function(path, options) {
  return new HtmlStream(path, options);
};