const date = new Date();
const day = date.getDate() > 9 ? date.getDate() : '0' + date.getDate();
const month = date.getMonth() >= 9 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1);

const defaultTypes = {
  string: 'string',
  boolean: true,
  int: 1, // signed 32 bit integer
  integer: 1, // integer
  unsignedInt: 1, // unsigned integer
  negativeInteger: -1, // integers of value -1 or less
  nonNegativeInteger: 1, // integers of value 0 or greater
  positiveInteger: 1, // integers of value 1 or greater
  nonPositiveInteger: -1, // integers of value 0 or less
  short: 1, // signed 16-bit integer
  unsignedShort: 1, // unsigned 16-bit integer
  long: 1, // signed 64-bit integer
  unsignedLong: 1, // unsigned 64-bit integer
  byte: 1, // signed 8-bit integer
  unsignedByte: 1, // unsigned 8-bit integer
  decimal: 3.14, // arbitrary precision number
  double: 3.14, // double-precision 64-bit floating-point number
  float: 3.14, // single-precision 32-bit floating-point number
  duration: 'P1Y2M3DT4H5M6S', // duration of time, number of years, months, days, hours, minutes, and seconds
  date: date.toISOString().split('T')[0],
  time: date.toISOString().split('T')[1],
  dateTime: date.toISOString(),
  gDay: day.toString(), // Gregorgian day
  gMonth: month.toString(), // Gregorian month
  gMonthDay: month + '-' + day, // Gregorian month and day
  gYear: date.getFullYear().toString(), // Gregorian year
  gYearMonth: date.getFullYear() + '-' + month, // Gregorian year and month
  base64Binary: '0FB8',
  hexBinary: '0FB8',
  anyURI: 'http://example.com',
  QName: 'pre:myElement', // XML namespace-qualified name
};

module.exports.generateDefault = function(type) {
  try {
    let typeInfo = type.split(':');
    if (typeInfo[0] === 'xs' || typeInfo[0] === 'xsd') {
      // if not in type map, use string as default
      return defaultTypes[typeInfo[1]] || 'string';
    } else {
      return 'string';
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.log(err);
    }
  }
};
