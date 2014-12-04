var path = require('path');
var fs = require('fs');
var util = require('util');

var _ = require('underscore');

var through2 = require('through2');
var markdown = require('./src/markdown-stream.js');
var htmlCodify = require('./src/html-codify-stream.js');
var idGen = require('./src/heading-id-generator-stream.js');
var toc = require('./src/toc-generator-stream.js');
var streamcombiner = require('./src/streamcombiner.js');

/*
Synchronously parse a JSON-formatted TOC file. Expects the TOC in the format
[
  {
     "title": "My section title",
     "file": "./files/mysection.md"
  },
  {
    "title": "My other section",
    "files": "./files/othersection.html"
  }
]

Returns the parsed JSON if it's in the right format.
*/
function filesFromToc (tocPath) {
  var toc;

  tocPath = path.resolve(tocPath);
  try {
    toc = fs.readFileSync(tocPath, {encoding: 'utf8'});
  } catch (error) {
    throw new Error('Couldn\'t read TOC file ' + tocPath);
  }

  try {
    toc = JSON.parse(toc);
    if (!util.isArray(toc)) {
      throw new Error();
    }
    toc.forEach(function(tocEntry) {
      if (!tocEntry.title || !tocEntry.file) {
        throw new Error();
      }
    });
  } catch (error) {
    throw new Error('Table of contents must be valid JSON in the format' +
      '[{"title": "Section Title", "file": "./my/file/path"}, ...]');
  }
}

function createMarkdownStream (markdownPath) {
  
}

function createHtmlStream (htmlPath) {
  
}

var DEFAULTS = {

};

function periscope (options) {
  var opts, files, streams;
  
  opts = _.extend({}, DEFAULTS, options);
  if (!opts.files && !opts.toc) {
    throw new Error('Pass opts.files or opts.toc to use Periscope.');
  }
  if (opts.toc) {
    files = filesFromToc(opts.toc);
  } else {
    files = opts.files;
  }

  streams = [];
  files.forEach(function (file) {
    var parseStream, fileStream;

    fileStream = fs.createReadStream(path.resolve(file));
    if (path.extname(file) === '.html') {
      parseStream = htmlCodify();
      
    } else if (path.extname === '.md') {
      parseStream = markdown();
    }
    fileStream.pipe(parseStream);
  });
  var combined = streamcombiner(streams);
  streamcombiner
    .pipe(idGen)
    .pipe(toc)
    .pipe(fs.createWriteStream(__dirname, 'docs.html'));
}

module.exports = periscope;
