var markdown = require('../src/markdown-stream.js');
var concat = require('concat-stream');
var cheerio = require('cheerio');
var path = require('path');

describe('Markdown parsing readable stream', function () {
  it('should produce a readable stream', function () {

  });

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

    var markdownStream = markdown(path.join(__dirname, './resources/test.md'));
    markdownStream.on('error', function(error) {
      throw new Error(error);
    });
    markdownStream.pipe(outStream);
  });

  it('should run code through pygments and generate highlighted output', function (done) {
    var outStream = concat(function(html) {
      var $ = cheerio.load(html);
      var pre = $('pre');
      var code = $('code');
      pre.length.should.be.greaterThan(0);
      code.length.should.equal(1);
      code.hasClass('lang-javascript').should.be.true;
      done();
    });

    var markdownStream = markdown(path.join(__dirname, './resources/test.md'));
    markdownStream.on('error', function(error) {
      throw new Error(error);
    });
    markdownStream.pipe(outStream);
  });

  it('should emit an error if a source file doesn\'t exist', function (done) {
    var outStream = concat(function(html) {
      done();
    });

    var markdownStream = markdown(path.join(__dirname, './resources/nothere.md'));
    markdownStream.on('error', function(error) {
      done();
    });
    markdownStream.on('end', function() {
      throw new Error('Got to the end of the stream without emitting an error.');
    });
    markdownStream.pipe(outStream);
  });
});