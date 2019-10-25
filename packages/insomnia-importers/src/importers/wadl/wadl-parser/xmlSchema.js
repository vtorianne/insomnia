var simpleType = require('./simpleType');

var rootElements = {};
var rootComplexTypes = {};
var initialized = false;

module.exports.init = function(schema) {
  try {
    parseSchema(schema);
    initialized = true;
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.log(err);
    }
  }
};

//check for root level elements
module.exports.generateDefault = function(schemaElem) {
  try {
    if (!initialized) {
      return {};
    }
    if (rootComplexTypes[schemaElem]) {
      return parseComplexType(rootComplexTypes[schemaElem]);
    }
    if (rootElements[schemaElem]) {
      return parseElement(rootElements[schemaElem]);
    }
    return {};
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.log(err);
    }
  }
};

function parseSchema(schema) {
  if (schema.complexType) {
    for (var i = 0; i < schema.complexType.length; ++i) {
      //create hash map with type name as key and complex type obj as value
      rootComplexTypes[schema.complexType[i].$.name] = schema.complexType[i];
    }
  }
  if (schema.element) {
    for (var i = 0; i < schema.element.length; ++i) {
      rootElements[schema.element[i].$.name] = schema.element[i];
    }
  }
}

function parseComplexType(complexType) {
  try {
    if (complexType.all) {
      return parseAll(complexType.all[0]);
    } else if (complexType.sequence) {
      return parseSequence(complexType.sequence[0]);
    } else {
      return {};
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.log(err);
    }
  }
}

function parseAll(all) {
  try {
    var obj = {};
    for (var i = 0; i < all.element.length; ++i) {
      obj = Object.assign(obj, parseElement(all.element[i]));
    }
    return obj;
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.log(err);
    }
    return {};
  }
}

function parseSequence(sequence) {
  try {
    var arr = [];
    for (var i = 0; i < sequence.element.length; ++i) {
      arr.push(parseElement(sequence.element[i]));
    }
    return arr;
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.log(err);
    }
    return [];
  }
}

function parseElement(element) {
  try {
    var obj = {};
    var defaultVal;
    if (element.complexType) {
      defaultVal = parseComplexType(element.complexType[0]);
    } else if (element.$.type.startsWith('xs')) {
      defaultVal = simpleType.generateDefault(element.$.type);
    } else if (element.$.type.startsWith('tns')) {
      var typeObj = rootComplexTypes[element.$.type.split(':')[1]];
      defaultVal = typeObj ? parseComplexType(typeObj) : {};
    }
    obj[element.$.name] = defaultVal;
    return obj;
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.log(err);
    }
    return {};
  }
}
