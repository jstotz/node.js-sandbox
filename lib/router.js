var sys = require('sys'),
    url = require('url');

var PathDefinition = function(pathdef) {
  this.params = {};
  this.paramNames = [];
  
  this.parse = function(pathdef) {
    var paramNames = this.paramNames;
    
    // named parameters
    var regexpString = pathdef.replace(/:([a-z_]+)/g, function(param) {
      paramNames.push(param.slice(1));
      return '([^/]*)';
    });
    
    // splat parameter
    regexpString = regexpString.replace(/\*$/, function(param) {
      paramNames.push('_splat');
      return '(.*)';
    });
        
    this.regexp = new RegExp('^' + regexpString + '$');
  };
  
  this.parse(pathdef);
  
  this.matches = function(path) {
    var parsedPath = url.parse(path, true);
    var matches = this.regexp.exec(parsedPath.pathname);
    this.params = parsedPath.query || {};
    if(matches != null) {
      this.paramValues = matches.slice(1);
      for(i in this.paramValues)
        this.params[this.paramNames[i]] = decodeURI(this.paramValues[i]);
      return true;
    } else {
      return false;
    }
  };
};

var RouteFilter = function(filters) {
  this.filters = filters;
  this.matches = function(request) {
    return (this.filters.method == undefined || this.filters.method == request.method);
  };
};

var Route = function(pathdef, filters, handler) {
  this.pathdef = new PathDefinition(pathdef);
  this.filter = new RouteFilter(filters);
  this.handler = handler;
  
  this.matches = function(request) {
    return this.filter.matches(request) && this.pathdef.matches(request.url);
  };
  
  this.handle = function(request, response) {
    return this.handler.apply({request: request, response: response, params: this.pathdef.params}, this.pathdef.paramValues);
  };
};

var Router = function() {
  this.routes = [];
  
  this.routeRequest = function(request, response) {
    sys.debug('Attempting to match request: ' + sys.inspect(request));
    for(i in this.routes) { var route = this.routes[i];
      sys.debug('Checking route: ' + sys.inspect(route));
      if(route.matches(request)) {
        sys.debug('Route matches. Invoking handler...');
        return route.handle(request, response);
      } else {
        sys.debug('Route does not match.');
      }        
    }
    sys.debug('No routes matched. Invoking default handler...');    
    return this.defaultHandler(request, response);
  };
  
  var router = this;
  var methodHandler = function(method) {
    return function(pathdef, handler) {
      router.routes.push(new Route(pathdef, {method: method}, handler));
    };
  };
  
  this.get = methodHandler('GET');
  this.head = methodHandler('HEAD');
  this.post = methodHandler('POST');
  this.put = methodHandler('PUT');
  this.del = methodHandler('DELETE');
  
  this.defaultHandler = function(request, response) {
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.end('Not found');
  };
};

exports.createRouter = function() {
  return new Router();
};