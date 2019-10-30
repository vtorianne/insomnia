const xml2js = require('xml2js');
const paramHelper = require('./paramHelper');
const xmlSchema = require('./xmlSchema');

let crossReferences = {
  methods: {},
  representations: {},
  params: {},
  resource_types: {},
};

module.exports.parse = async function(wadl, callback) {
  await xml2js.Parser().parseString(wadl, function(err, result) {
    if (err) {
      if (process.env.NODE_ENV === 'development') {
        console.log('PARSING ERROR: ', err);
      }
      callback(null);
    } else {
      if (result.hasOwnProperty('application')) {
        callback(parseApplication(result.application));
      } else {
        callback(null);
      }
    }
  });
};

function setUpCrossReferences(application) {
  try {
    if (application.hasOwnProperty('method')) {
      for (let i = 0; i < application.method.length; ++i) {
        crossReferences.methods[application.method[i].$.id] = application.method[i];
      }
    }
    if (application.hasOwnProperty('representation')) {
      for (let i = 0; i < application.representation.length; ++i) {
        crossReferences.representations[application.representation[i].$.id] =
          application.representation[i];
      }
    }
    if (application.hasOwnProperty('param')) {
      for (let i = 0; i < application.param.length; ++i) {
        crossReferences.params[application.param[i].$.id] = application.param[i];
      }
    }
    if (application.hasOwnProperty('resource_type')) {
      for (let i = 0; i < application.resource_type.length; ++i) {
        crossReferences.resource_types[application.resource_type[i].$.id] =
          application.resource_type[i];
      }
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.log('SET UP CROSS REFERENCES ERROR: ', err);
    }
    throw err;
  }
}

function parseApplication(application) {
  try {
    setUpCrossReferences(application);
    if (application.hasOwnProperty('grammars')) {
      parseGrammars(application.grammars[0]);
    }
    // note: according to WADL specs, should be 1 & only 1 resources element
    return parseResources(application.resources[0]);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.log('APPLICATION ERROR: ', err);
    }
    return null;
  }
}

function parseGrammars(grammars) {
  try {
    if (grammars.hasOwnProperty('schema')) xmlSchema.init(grammars.schema[0]);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.log('GRAMMARS ERROR: ', err);
    }
    throw err;
  }
}

function parseResources(resources) {
  try {
    // return obj
    let result = {
      base: resources.$.base,
      requests: [],
    };
    // context for parsing resources
    let context = {
      url: resources.$.base,
    };
    for (let i = 0; i < resources.resource.length; ++i) {
      // have separate copies of context obj so by-reference updates don't mess up parsing
      let childContext = JSON.parse(JSON.stringify(context));
      result.requests.push(parseResource(resources.resource[i], childContext));
    }
    // flatten nested arrays into single dimension array of requests
    result.requests = [].concat.apply([], result.requests);
    return result;
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.log('RESOURCES ERROR:   ', err);
    }
    return null;
  }
}

function parseResource(resource, context) {
  try {
    let requests = [];
    // update context url
    if (resource.$.hasOwnProperty('path')) {
      if (!context.url.endsWith('/')) context.url += '/';
      context.url += resource.$.path;
    }
    // handle type attribute i.e. resource_type
    if (resource.$.hasOwnProperty('type')) {
      let resourceTypes = resource.$.type.split(' '); // type field is space delimited
      for (let i = 0; i < resourceTypes.length; ++i) {
        let id = resourceTypes[i].split('#')[1];
        if (crossReferences.resource_types[id]) {
          // updates the context and resource objects by reference to apply the resource type
          parseResourceType(crossReferences.resource_types[id], context, resource);
        }
      }
    }
    // parse params
    if (resource.hasOwnProperty('param')) {
      for (let i = 0; i < resource.param.length; ++i) {
        parseParam(resource.param[i], context, { type: 'resource' });
      }
    }
    // parse methods
    if (resource.hasOwnProperty('method')) {
      for (let i = 0; i < resource.method.length; ++i) {
        // have separate copies of context obj so by reference updates don't mess up parsing
        let childContext = JSON.parse(JSON.stringify(context));
        requests.push(parseMethod(resource.method[i], childContext));
      }
    }
    // handle sub-resources
    if (resource.hasOwnProperty('resource')) {
      for (let i = 0; i < resource.resource.length; ++i) {
        // sub-resources only inherit URI context - no headers or query params
        requests.push(parseResource(resource.resource[i], { url: context.url }));
      }
    }
    // flatten nested arrays into single dimension array of requests
    return [].concat.apply([], requests);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.log('RESOURCE ERROR:    ', err);
    }
    return null;
  }
}

function parseResourceType(resourceType, context, resource) {
  try {
    // update the context object with the param info for resources of this resourceType
    if (resourceType.hasOwnProperty('param')) {
      for (let i = 0; i < resourceType.param.length; ++i) {
        parseParam(resourceType.param[i], context, { type: 'resource_type' });
      }
    }
    // add methods to the resource object's method field
    if (resourceType.hasOwnProperty('method')) {
      if (resource.hasOwnProperty('method')) {
        resource.method = resource.method.concat(resourceType.method);
      } else {
        resource.method = resourceType.method;
      }
    }
    // add subresources to the resource object's resource field
    if (resourceType.hasOwnProperty('resource')) {
      if (resource.hasOwnProperty('resource')) {
        resource.resource = resource.resource.concat(resourceType.resource);
      } else {
        resource.resource = resourceType.resource;
      }
    }
    return;
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.log('RESOURCE TYPE ERROR: ', err);
    }
    throw err;
  }
}

// context is an object, so it is passed by reference, thus changes will be reflected in caller function
function parseParam(param, context, parent) {
  try {
    if (param.$.hasOwnProperty('href')) {
      // handle reference param
      let id = param.$.href.split('#')[1];
      if (crossReferences.params[id]) {
        parseParam(crossReferences.params[id], context, parent);
      }
      return;
    } else {
      if (param.$.name === undefined) {
        throw new Error('Invalid param');
      }
      let defaultVal = null;
      if (param.$.hasOwnProperty('default')) {
        defaultVal = param.$.default;
      } else if (param.$.hasOwnProperty('fixed')) {
        defaultVal = param.$.fixed;
      } else if (param.hasOwnProperty('option')) {
        defaultVal = parseOption(param.option[0]);
      }

      switch (param.$.style) {
        case 'matrix':
          paramHelper.parseMatrix(param, context, defaultVal);
          break;
        case 'header':
          paramHelper.parseHeader(param, context);
          break;
        case 'query':
          if (parent.type === 'representation') {
            // parse as form body params
            paramHelper.parseQueryFormBody(param, context, defaultVal);
          } else {
            // parse as URI query params
            paramHelper.parseQueryURI(param, context, defaultVal);
          }
          break;
        case 'template':
          paramHelper.parseTemplate(param, context, defaultVal);
          break;
        case 'plain':
        default:
          if (parent.type === 'representation') {
            switch (parent.mediaType) {
              case 'application/x-www-form-urlencoded':
              case 'multipart/form-data':
                paramHelper.parseQueryFormBody(param, context, defaultVal);
                break;
              case 'application/json':
                paramHelper.parseJSON(param, context);
                break;
              case 'application/xml':
                paramHelper.parseXML(param, context);
                break;
              default:
                // handle text/* media types
                if (parent.mediaType.startsWith('text')) {
                  paramHelper.parseText(param, context);
                }
            }
          }
      }
      return;
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.log('PARAM ERROR:    ', err);
    }
    throw err;
  }
}

function parseOption(option) {
  try {
    return option.$.value;
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.log('OPTION ERROR:  ', err);
    }
    return null;
  }
}

function parseMethod(method, context) {
  try {
    if (method.$.hasOwnProperty('href')) {
      // handle reference method
      let id = method.$.href.split('#')[1];
      if (crossReferences.methods[id]) {
        return parseMethod(crossReferences.methods[id], context);
      } else {
        throw new Error('Invalid method reference');
      }
    } else {
      context.method = method.$.name;
      // handle simple requests (e.g. GET) that don't require further specification
      if (!method.request) return context;
      return parseRequest(method.request[0], context);
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.log('METHOD ERROR:    ', err);
    }
    return null;
  }
}

function parseRequest(request, context) {
  try {
    if (request.hasOwnProperty('param')) {
      for (let i = 0; i < request.param.length; ++i) {
        parseParam(request.param[i], context, { type: 'request' });
      }
    }

    if (request.hasOwnProperty('representation')) {
      for (let i = 0; i < request.representation.length; ++i) {
        parseRepresentation(request.representation[i], context);
      }
    }
    return context;
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.log('REQUEST ERROR:    ', err);
    }
    return null;
  }
}

// context is an object, so it is passed by reference, thus changes will be reflected in caller function
function parseRepresentation(representation, context) {
  try {
    if (representation.$.hasOwnProperty('href')) {
      // handle reference representation
      let id = representation.$.href.split('#')[1];
      if (crossReferences.representations[id]) {
        parseRepresentation(crossReferences.representations[id], context);
      }
      return;
    } else {
      if (representation.$.hasOwnProperty('mediaType')) {
        if (!context.hasOwnProperty('body')) {
          context.body = {};
        }
        if (!context.hasOwnProperty('headers')) {
          context.headers = [];
        }
        context.body.mimeType = representation.$.mediaType;
        context.headers.push({ name: 'Content-Type', value: representation.$.mediaType });
      }
      if (representation.hasOwnProperty('param')) {
        for (let i = 0; i < representation.param.length; ++i) {
          parseParam(representation.param[i], context, {
            type: 'representation',
            mediaType: representation.$.mediaType,
          });
        }
      }
      return;
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.log('REPRESENTATION ERROR:    ', err);
    }
    throw err;
  }
}
