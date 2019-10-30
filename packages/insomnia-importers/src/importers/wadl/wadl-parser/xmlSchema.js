const simpleType = require('./simpleType');

let rootElements = {};
let rootComplexTypes = {};
let initialized = false;

module.exports.init = function(schema) {
  try {
    parseSchema(schema);
    initialized = true;
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.log(err);
    }
    throw err;
  }
};

// check for root level elements
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
    throw err;
  }
};

function parseSchema(schema) {
  if (schema.hasOwnProperty('complexType')) {
    for (let i = 0; i < schema.complexType.length; ++i) {
      // create hash map with type name as key and complex type obj as value
      rootComplexTypes[schema.complexType[i].$.name] = schema.complexType[i];
    }
  }
  if (schema.hasOwnProperty('element')) {
    for (let i = 0; i < schema.element.length; ++i) {
      rootElements[schema.element[i].$.name] = schema.element[i];
    }
  }
}

function parseComplexType(complexType) {
  try {
    if (complexType.hasOwnProperty('all')) {
      return parseAll(complexType.all[0]);
    } else if (complexType.hasOwnProperty('sequence')) {
      return parseSequence(complexType.sequence[0]);
    } else {
      return {};
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.log(err);
    }
    return {};
  }
}

function parseAll(all) {
  try {
    let obj = {};
    for (let i = 0; i < all.element.length; ++i) {
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
    let arr = [];
    for (let i = 0; i < sequence.element.length; ++i) {
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
    if (element.$.name === undefined) {
      throw new Error('Invalid element');
    }
    let obj = {};
    let defaultVal;
    if (element.hasOwnProperty('complexType')) {
      defaultVal = parseComplexType(element.complexType[0]);
    } else if (element.$.type === undefined) {
      defaultVal = simpleType.generateDefault('');
    } else if (element.$.type.startsWith('tns')) {
      let typeObj = rootComplexTypes[element.$.type.split(':')[1]];
      defaultVal = typeObj ? parseComplexType(typeObj) : {};
    } else if (element.$.type.startsWith('xs')) {
      defaultVal = simpleType.generateDefault(element.$.type);
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
