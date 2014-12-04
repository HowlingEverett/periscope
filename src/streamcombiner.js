var util = require('util');
var PassThrough = require('stream').PassThrough;

/*
Combine multiple streams into one pipeline

Example:
  
  var stream3 = new StreamCombiner(stream1, stream2);
  process.stdin.pipe(stream3).pipe(process.stdout);

  OR

  var stream3 = new StreamCombiner([stream1, stream2]);
  process.stdin.pipe(stream3).pipe(process.stdout);
*/
var StreamCombiner = function() {
  if (arguments.length === 1 && util.isArray(arguments[0])) {
    this.streams = Array.prototype.slice.apply(arguments[0]);
  } else {
    this.streams = Array.prototype.slice.apply(arguments);
  }

  this.on('pipe', function(source) {
    source.unpipe(this);
    this.streams.forEach(function(stream) {
      source = source.pipe(stream);
    });
    this.transformStream = source;
  });
};

util.inherits(StreamCombiner, PassThrough);

StreamCombiner.prototype.pipe = function(dest, options) {
  return this.transformStream.pipe(dest, options);
};

module.exports = function () {
  var args = Array.prototype.slice.call(arguments, 0);
  return new StreamCombiner(args);
};
