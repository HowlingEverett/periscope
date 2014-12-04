var markdown = require('../src/markdown-stream.js');
var concat = require('concat-stream');
var cheerio = require('cheerio');
var fs = require('fs');
var path = require('path');

describe('Markdown parsing readable stream', function () {
  it('should create a HTML fragment from input markdown', function (done) {
    var outStream = concat(function(html) {
      var $ = cheerio.load(html);

      // Check that the generated markup equates to the input Markdown
      $('h1').length.should.equal(1);
      $('h2').length.should.equal(1);
      $('li').length.should.equal(2);
      $('p').length.should.equal(1);
      done();
    });

    var inputStream = fs.createReadStream(path.join(__dirname, './resources/test.md'));
    var markdownStream = markdown();
    markdownStream.on('error', function(error) {
      throw new Error(error);
    });
    inputStream.pipe(markdownStream).pipe(outStream);
  });

  it('should run code through pygments and generate highlighted output', function (done) {
    var outStream = concat(function(html) {
      var $ = cheerio.load(html);
      var pre = $('pre');
      var code = $('code');
      pre.length.should.be.greaterThan(0);
      code.length.should.equal(1);
      code.hasClass('lang-js').should.be.true;
      done();
    });

    var inputStream = fs.createReadStream(path.join(__dirname, './resources/test.md'));
    var markdownStream = markdown();
    markdownStream.on('error', function(error) {
      throw new Error(error);
    });
    inputStream.pipe(markdownStream).pipe(outStream);
  });
});