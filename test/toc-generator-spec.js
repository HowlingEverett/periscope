var tocGenerator = require('../src/toc-generator-stream.js');
var concat = require('concat-stream');
var cheerio = require('cheerio');
var fs = require('fs');
var path = require('path');

describe('Table-of-contents generator stream', function () {
  it('should generate an unordered list as its root element', function (done) {
    var out = concat(function (html) {
      var $ = cheerio.load(html);
      $('ul').length.should.be.greaterThan(0);
      done();
    });

    var inputStream = fs.createReadStream(path.join(__dirname, 
      './resources/nocode.html'));
    var toc = tocGenerator();
    toc.on('error', function (err) {
      throw new Error(err);
    });
    inputStream.pipe(toc).pipe(out);
  });

  it('should generate a list item for each heading', function (done) {
    var out = concat(function (html) {
      var $ = cheerio.load(html);
      $('li').length.should.equal(4);

      done();
    });

    var inputStream = fs.createReadStream(path.join(__dirname,
      './resources/nocode.html'));
    var toc = tocGenerator();
    toc.on('error', function (err) {
      throw new Error(err);
    });
    inputStream.pipe(toc).pipe(out);
  });

  it('should generate a sub-lists based on heading level', function (done) {
    var out = concat(function (html) {
      var $ = cheerio.load(html);
      // In subheadings.html, we should see four uls based on the structure
      $('ul').length.should.equal(4);
      // The first sub-list should contain two elements and a sublist
      var firstSublist = $('ul').eq(1).children();
      firstSublist[0].tagName.toLowerCase().should.eql('li');
      firstSublist[1].tagName.toLowerCase().should.eql('li');
      firstSublist[2].tagName.toLowerCase().should.eql('ul');
      done();
    });

    var inputStream = fs.createReadStream(path.join(__dirname, 
      './resources/subheadings.html'));
    var toc = tocGenerator();
    toc.on('error', function (err) {
      throw new Error(err);
    });
    inputStream.pipe(toc).pipe(out);
  });

  it('should generate links to the respective content', function (done) {
    var out = concat(function (html) {
      var $ = cheerio.load(html);
      
      var lis = $('li');
      // First heading link
      var h1 = lis.eq(0);
      h1.children().length.should.eql(1);
      h1.children()[0].tagName.toLowerCase().should.eql('a');
      h1.children().eq(0).attr('href').should.eql('#level-1');

      done();
    });

    var inputStream = fs.createReadStream(path.join(__dirname,
      './resources/subheadings.html'));
    var toc = tocGenerator();
    toc.on('error', function (err) {
      throw new Error(err);
    });
    inputStream.pipe(toc).pipe(out);
  });
});