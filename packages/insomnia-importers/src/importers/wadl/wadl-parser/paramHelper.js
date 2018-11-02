var xml2js = require('xml2js');
var simpleType = require('./simpleType');
var xmlSchema = require('./xmlSchema');

module.exports.parseMatrix = function(param, context, defaultVal) {
  try {
    context.url += ';' + param.$.name;
    if (param.$.type != 'xsd:boolean' || param.$.type != 'xs:boolean') {
      if (!defaultVal) {
        defaultVal = simpleType.generateDefault(param.$.type);
      }
      context.url += '=' + defaultVal;
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports.parseHeader = function(param, context, defaultVal) {
  try {
    //??? have default header map?
    var header = { name: param.$.name, value: '' };
    if (!context.hasOwnProperty('headers')) {
      context.headers = [];
    }
    context.headers.push(header);
  } catch (err) {
    console.log(err);
  }
};

module.exports.parseQueryFormBody = function(param, context, defaultVal) {
  try {
    if (!context.hasOwnProperty('body')) {
      context.body = {};
    }
    if (!context.body.hasOwnProperty('params')) {
      context.body.params = [];
    }
    if (!defaultVal) {
      defaultVal = simpleType.generateDefault(param.$.type);
    }
    context.body.params.push({ name: param.$.name, value: defaultVal });
  } catch (err) {
    console.log(err);
  }
};

module.exports.parseQueryURI = function(param, context, defaultVal) {
  try {
    if (!context.hasOwnProperty('parameters')) {
      context.parameters = [];
    }
    if (!defaultVal) {
      defaultVal = simpleType.generateDefault(param.$.type);
    }
    context.parameters.push({ name: param.$.name, value: defaultVal });
  } catch (err) {
    console.log(err);
  }
};

module.exports.parseTemplate = function(param, context, defaultVal) {
  try {
    if (!defaultVal) {
      defaultVal = simpleType.generateDefault(param.$.type);
    }
    context.url = context.url.replace('{' + param.$.name + '}', param.$.name + '_' + defaultVal);
  } catch (err) {
    console.log(err);
  }
};

module.exports.parseJSON = function(param, context) {
  try {
    var obj = generateObj(param.$.name, param.$.type);
    if (!context.body) {
      context.body = {};
    }
    if (!context.body.text) {
      context.body.text = JSON.stringify(obj);
    } else {
      var oldObj = JSON.parse(context.body.text);
      var newObj = Object.assign(oldObj, obj);
      context.body.text = JSON.stringify(newObj);
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports.parseXML = function(param, context) {
  try {
    var obj = generateObj(param.$.name, param.$.type);
    if (!context.body) {
      context.body = {};
    }
    var xmlBuilder = new xml2js.Builder({ renderOpts: { pretty: false } });
    context.body.text = xmlBuilder.buildObject(obj);
  } catch (err) {
    console.log(err);
  }
};

//generate js obj for text based param (e.g. xml or json)
function generateObj(name, type) {
  var obj = {};
  var typeInfo = type.split(':');
  if (typeInfo[0] === 'tns') {
    obj[name] = xmlSchema.generateDefault(typeInfo[1]);
  } else {
    obj[name] = simpleType.generateDefault(type);
  }
  return obj;
}
