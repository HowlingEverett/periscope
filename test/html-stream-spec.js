var htmlCodify = require('../src/html-codify-stream.js');
var concat = require('concat-stream');
var cheerio = require('cheerio');
var fs = require('fs');
var path = require('path');

describe('Html stream transformer', function () {
  it('should pass normal HTML through unscathed', function (done) {
    var outStream = concat(function(html) {
      var $ = cheerio.load(html);
      // We can tell if pygments has run if there are a bunch of spans
      // generated inside a code tag
      $('code span').length.should.equal(0);

      // The existing elements should exist in the output
      $('h1').length.should.equal(1);
      $('p').length.should.equal(1);

      done();
    });

    var inStream = fs.createReadStream(path.join(__dirname,
      './resources/nocode.html'));
    var htmlStream = htmlCodify();
    htmlStream.on('error', function(error) {
      throw new Error(error);
    });
    inStream.pipe(htmlStream).pipe(outStream);
  });

  it('should pygmentize code blocks', function (done) {
    var outStream = concat(function(html) {
      var $ = cheerio.load(html);
      $('.lang-js span').length.should.be.greaterThan(0);
      done();
    });

    var inStream = fs.createReadStream(path.join(__dirname,
      './resources/code.html'));
    var htmlStream = htmlCodify();
    htmlStream.on('error', function(error) {
      throw new Error(error);
    });
    inStream.pipe(htmlStream).pipe(outStream);
  });

  it('should pygmentize inline code blocks', function (done) {
    var outStream = concat(function(html) {
      var $ = cheerio.load(html);
      $('.lang-html span').length.should.be.greaterThan(0);
      done();
    });

    var inStream = fs.createReadStream(path.join(__dirname,
      './resources/code.html'));
    var htmlStream = htmlCodify();
    htmlStream.on('error', function(error) {
      throw new Error(error);
    });
    inStream.pipe(htmlStream).pipe(outStream);
  });
});