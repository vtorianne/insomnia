const xml2js = require('xml2js');
const simpleType = require('./simpleType');
const xmlSchema = require('./xmlSchema');

module.exports.parseMatrix = function(param, context, defaultVal) {
  try {
    context.url += ';' + param.$.name;
    if (param.$.type !== 'xsd:boolean' || param.$.type !== 'xs:boolean') {
      if (!defaultVal) {
        defaultVal = simpleType.generateDefault(param.$.type || '');
      }
      context.url += '=' + defaultVal;
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.log(err);
    }
    throw err;
  }
};

module.exports.parseHeader = function(param, context) {
  try {
    // currently using a string as the value
    // later on could have default map for different request header types
    let header = { name: param.$.name, value: 'header_value' };
    if (!context.hasOwnProperty('headers')) {
      context.headers = [];
    }
    context.headers.push(header);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.log(err);
    }
    throw err;
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
      defaultVal = simpleType.generateDefault(param.$.type || '');
    }
    context.body.params.push({ name: param.$.name, value: defaultVal });
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.log(err);
    }
    throw err;
  }
};

module.exports.parseQueryURI = function(param, context, defaultVal) {
  try {
    if (!context.hasOwnProperty('parameters')) {
      context.parameters = [];
    }
    if (!defaultVal) {
      defaultVal = simpleType.generateDefault(param.$.type || '');
    }
    context.parameters.push({ name: param.$.name, value: defaultVal });
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.log(err);
    }
    throw err;
  }
};

module.exports.parseTemplate = function(param, context, defaultVal) {
  try {
    if (!defaultVal) {
      defaultVal = simpleType.generateDefault(param.$.type || '');
    }
    context.url = context.url.replace('{' + param.$.name + '}', param.$.name + '_' + defaultVal);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.log(err);
    }
    throw err;
  }
};

module.exports.parseText = function(param, context) {
  context.body.text = param.$.name;
};

module.exports.parseJSON = function(param, context) {
  try {
    let obj = generateObj(param.$.name, param.$.type || '');
    if (!context.hasOwnProperty('body')) {
      context.body = {};
    }
    if (!context.body.hasOwnProperty('text')) {
      context.body.text = JSON.stringify(obj);
    } else {
      let oldObj = JSON.parse(context.body.text);
      let newObj = Object.assign(oldObj, obj);
      context.body.text = JSON.stringify(newObj);
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.log(err);
    }
    throw err;
  }
};

module.exports.parseXML = function(param, context) {
  try {
    let obj = generateObj(param.$.name, param.$.type || '');
    if (!context.hasOwnProperty('body')) {
      context.body = {};
    }
    let xmlBuilder = new xml2js.Builder({ renderOpts: { pretty: false } });
    context.body.text = xmlBuilder.buildObject(obj);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.log(err);
    }
    throw err;
  }
};

// generate js obj for text based param (e.g. xml or json)
function generateObj(name, type) {
  let obj = {};
  let typeInfo = type.split(':');
  if (typeInfo[0] === 'tns') {
    obj[name] = xmlSchema.generateDefault(typeInfo[1]);
  } else {
    obj[name] = simpleType.generateDefault(type);
  }
  return obj;
}
