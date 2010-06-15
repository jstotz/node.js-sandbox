var sys = require('sys');

var PathDefinition = function(pathdef) {
  this.params = {};
  this.paramNames = [];
  
  this.parse = function(pathdef) {
    var paramNames = this.paramNames;
    var regexpString = pathdef.replace(/:([a-z]*)/g, function(param) {
      paramNames.push(param.slice(1));
      return '(.*)';
    });
    this.regexp = new RegExp('^' + regexpString + '$');
  };
  
  this.parse(pathdef);
  
  this.matches = function(path) {
    var matches = this.regexp.exec(path);
    if(matches != null) {
      var paramValues = matches.slice(1);
      for(i in paramValues)
        this.params[this.paramNames[i]] = paramValues;
      return true;
    } else {
      return false;
    }
  };
};

var Route = function(pathdef, filters, handler) {
  this.pathdef = new PathDefinition(pathdef);
  this.filters = filters;
  this.handler = handler;
  
  this.matches = function(request) {
    return (
      (this.filters.method == undefined || this.filters.method == request.method) &&
      (this.pathdef.matches(request.url))
    );
  };
  
  this.handle = function(request, response) {
    return this.handler.call({request: request, response: response, params: this.pathdef.params});
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
    // no routes matched
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
    this.response.writeHead(404, {'Content-Type': 'text/plain'});
    this.response.end('Not found');
  }
};

exports.createRouter = function() {
  return new Router();
};