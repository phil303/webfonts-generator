var fs = require('fs')
var crypto = require('crypto')


var calcHash = function(options) {
  var hash = crypto.createHash('md5');
  options.files.forEach(function(file) {
    hash.update(fs.readFileSync(file, 'utf8'));
  });
  return hash.digest('hex');
}


var createFilenameFn = function(options) {
  var hash = calcHash(options);
  return function(type) {
    var baseUrl = options.cssFontsUrl && options.cssFontsUrl.replace(/\\/g, '/');
    return options.fontName + '.' + hash + '.' + type;
  };
}


module.exports = createFilenameFn;
