var simpleType = require('./simpleType');

var types = {};
var initialized = false;

module.exports.init = function(complexTypes) {
  try {
    for (var i = 0; i < complexTypes.length; ++i) {
      //create hash map with type name as key and complex type obj as value
      types[complexTypes[i].$.name] = complexTypes[i];
    }
    initialized = true;
  } catch (err) {
    console.log(err);
  }
};

module.exports.generateDefault = function(complexType) {
  try {
    if (!initialized || !types[complexType]) {
      return {};
    }
    return parseComplexType(types[complexType]);
  } catch (err) {
    console.log(err);
  }
};

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
    console.log(err);
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
    console.log(err);
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
    console.log(err);
    return [];
  }
}

function parseElement(element) {
  try {
    var obj = {};
    var defaultVal;
    if (element.$.type.startsWith('xs')) {
      defaultVal = simpleType.generateDefault(element.$.type);
    } else if (element.$.type.startsWith('tns')) {
      var typeObj = types[element.$.type.split(':')[1]];
      defaultVal = typeObj ? parseComplexType(typeObj) : {};
    }
    obj[element.$.name] = defaultVal;
    return obj;
  } catch (err) {
    console.log(err);
    return {};
  }
}
