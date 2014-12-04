var idGen = require('../src/heading-id-generator-stream.js');
var cheerio = require('cheerio');
var concat = require('concat-stream');
var fs = require('fs');
var path = require('path');

describe('Html heading id generator stream', function () {
  it('should ignore headings with existing ids', function (done) {
    var out = concat(function (html) {
      var $ = cheerio.load(html);
      var weirdHeading = $('h1').eq(0);
      weirdHeading.attr('id').should.eql('my-weird-id');
      done();
    });

    var inStream = fs.createReadStream(path.join(__dirname, 
      './resources/headings-ids.html'));
    var ids = idGen();
    ids.on('error', function (err) {
      throw new Error(err);
    });
    inStream.pipe(ids).pipe(out);
  });

  it('should generate a hyphenated id based on the heading\'s text content', 
      function (done) {
    var out = concat(function (html) {
      var $ = cheerio.load(html);
      var headingNoId = $('h1').eq(1);
      headingNoId.attr('id').should.eql('use-this-text');
      done();
    });

    var inStream = fs.createReadStream(path.join(__dirname, 
      './resources/headings-ids.html'));
    var ids = idGen();
    ids.on('error', function (err) {
      throw new Error(err);
    });
    inStream.pipe(ids).pipe(out);
  });
});