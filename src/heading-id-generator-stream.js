var cheerio = require('cheerio');
var slug = require('slug');
var Transform = require('stream').Transform;
var util = require('util');

var HeadingIdGeneratorStream = function () {
  Transform.call(this, {encoding: 'utf8'});

  this._generateId = false;
};

util.inherits(HeadingIdGeneratorStream, Transform);

HeadingIdGeneratorStream.prototype._transform = function(chunk, encoding, callback) {
  var self, $, headings;
  self = this;
  chunk = chunk.toString();

  $ = cheerio.load(chunk);
  headings = $('h1, h2, h3, h4, h5, h6').each(function () {
    var $heading = $(this);
    // Only modify headings without ids already set
    if (!$heading.attr('id')) {
      var headingText = $heading.text().toLowerCase();
      $heading.attr('id', slug(headingText));
    }
  });
  this.push($.html());
  callback();
};

HeadingIdGeneratorStream.prototype._flush = function(callback) {
  callback();
};

module.exports = function () {
  return new HeadingIdGeneratorStream();
}
