var periscope = require('../periscope.js');
var concat = require('concat-stream');
var cheerio = require('cheerio');

describe('Periscope parsing API', function () {
  describe('TOC parsing', function() {
    it('should error unless you pass a files array or TOC path', function () {
      try {
        periscope();
        throw new Error('Bork bork bork');
      } catch (error) {
        error.message.should.equal('Pass opts.files or opts.toc to use Periscope.');
      }
    });

    it('should error if you pass an invalid TOC.', function () {
      try {
        periscope({toc: './test/resources/invalid-toc.json'});
        throw new Error('Bork bork bork');
      } catch (error) {
        error.message.should.startWith('Table of contents must be valid JSON');
      }
    });

    it('should error if you pass TOC that isn\'t JSON', function () {
      try {
        periscope({toc: './test/resources/invalid-json.json'});
        throw new Error('Bork bork bork');
      } catch (error) {
        error.message.should.startWith('Table of contents must be valid JSON');
      }
    });

    // it('should output a valid HTML document', function (done) {
    //   var outStream = concat(function(html) {
    //     var $ = cheerio.load(html);

    //     // Check that we create a valid HTML file
    //     $('html').length.should.equal(1);
    //     $('head').length.should.equal(1);
    //     $('body').length.should.equal(1);
    //     done();
    //   });

    //   periscope({files: ['./test/resources/test.md']}).pipe(outStream);
    // });
  });
});