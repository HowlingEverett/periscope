var marked = require('marked');
var pygmentize = require('pygmentize-bundled');
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
    throw new Error('Couldn\'t read TOC file.', error);
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

  if (opts.toc) {
    files = filesFromToc(opts.toc);
  } else {
    files = opts.files;
  }
