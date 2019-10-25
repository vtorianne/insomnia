var wadl = require('wadl-parser');

module.exports.id = 'wadl';
module.exports.name = 'WADL';
module.exports.description = 'Importer for WADL specification (xml)';

module.exports.convert = async function(rawData) {
  var resources = null;
  await wadl.parse(rawData, function(result) {
    if (result) {
      resources = formatResources(result);
    }
  });
  return resources;
};

//mapping requests to Insomnia request objects here
function formatResources(resources) {
  try {
    //create parent folder for request to be imported
    var request_group = {
      _type: 'request_group',
      _id: '__FOLDER_1__',
      name: resources.base
    };
    //format requests for Insomnia's format
    for (var i = 0; i < resources.requests.length; ++i) {
      resources.requests[i]._id = `__REQUEST_${i + 1}__`;
      resources.requests[i]._type = 'request';
      resources.requests[i].name = resources.requests[i].url;
      resources.requests[i].parentId = request_group._id;
    }
    //merge parent folder and requests into single array as per Insomnia's export format
    var resources_obj = [request_group];
    resources_obj = resources_obj.concat(resources.requests);
    return resources_obj;
  } catch (err) {
    return null;
  }
}
