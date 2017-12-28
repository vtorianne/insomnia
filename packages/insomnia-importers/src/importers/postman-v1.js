const postman = require('postman-collection');

module.exports.id = 'postman';
module.exports.name = 'Postman';
module.exports.description = 'Importer for Postman collections';

module.exports.convert = function (rawData) {
  let data;
  try {
    data = JSON.parse(rawData);
    if (data.id && data.order && !!data.folders && data.requests) {
      return importCollection(data);
    }
  } catch (e) {
    // Nothing
  }

  return null;
};

function importCollection (data) {
  const collection = new postman.Collection(data);
  return [
    importWorkspace(collection)
  ];
}

function importWorkspace (collection) {
  return {
    _id: collection.id,
    _type: 'workspace',
    name: collection.name,
    environment: {},
    description: collection.description.toString()
  };
}
