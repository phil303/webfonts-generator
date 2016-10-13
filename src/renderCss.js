var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var handlebars = require('handlebars');
var urlJoin = require('url-join');

var createFilenameFn = require('./createFilenameFn');


var makeUrls = function(options) {
  var baseUrl = options.cssFontsUrl && options.cssFontsUrl.replace(/\\/g, '/');
  var buildFilename = createFilenameFn(options);

  var urls = options.types.map(function(type) {
    var fileName = buildFilename(type);
    return baseUrl ? urlJoin(baseUrl, fileName) : fileName;
  });

  return _.object(options.types, urls);
};

var makeSrc = function(options, urls) {
  var templates = {
    eot: _.template('url("<%= url %>?#iefix") format("embedded-opentype")'),
    woff: _.template('url("<%= url %>") format("woff")'),
    ttf: _.template('url("<%= url %>") format("truetype")'),
    svg: _.template('url("<%= url %>#<%= fontName %>") format("svg")')
  };

  // Order used types according to 'options.order'.
  var orderedTypes = _.filter(options.order, function(type) {
    return options.types.indexOf(type) !== -1
  });

  var src = _.map(orderedTypes, function(type) {
    return templates[type]({
      url: urls[type],
      fontName: options.fontName
    });
  }).join(',\n');

  return src;
}

var makeCtx = function(options, urls) {
  // Transform codepoints to hex strings
  var codepoints = _.object(_.map(options.codepoints, function(codepoint, name) {
    return [name, codepoint.toString(16)]
  }));

  return _.extend({
    fontName: options.fontName,
    src: makeSrc(options, urls),
    codepoints: codepoints
  }, options.templateOptions);
}

var renderCss = function(options, urls) {
  if (typeof urls === 'undefined') {
    urls = makeUrls(options);
  }
  var ctx = makeCtx(options, urls);
  var source = fs.readFileSync(options.cssTemplate, 'utf8');
  var template = handlebars.compile(source);
  return template(ctx);
}

module.exports = renderCss;
