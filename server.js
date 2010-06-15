var sys = require('sys'),
    http = require('http');
    router = require('./lib/router').createRouter();

router.get('/', function() {
  this.response.writeHead(200, {'Content-Type': 'text/plain'});
  this.response.end('Hello, world!');
});

router.get('/dog', function() {
  this.response.writeHead(200, {'Content-Type': 'text/plain'});
  this.response.end('Sup, dog!');
});

router.get('/hello/:name', function(name) {
  this.response.writeHead(200, {'Content-Type': 'text/plain'});
  this.response.end('Hello, ' + name + '. Good ' + this.params.time_of_day + '!');
});

router.get('/hello/:name/:time_of_day', function(name) {
  this.response.writeHead(200, {'Content-Type': 'text/plain'});
  this.response.end('Hello, ' + name + '. Good ' + this.params.time_of_day + '!');
});

router.get('/users/:username/:admin', function(username, admin) {
  this.response.writeHead(200, {'Content-Type': 'application/json'});
  this.response.end('{"username": "' + username + '", "admin": ' + admin + '}');
});

router.get('/directory/*', function(hierarchy) {
  this.response.writeHead(200, {'Content-Type': 'text/plain'});
  this.response.end(hierarchy.split('/').join(', '));
});

var httpServer = http.createServer(function (req, res) {
  if(req.url != '/favicon.ico')
    router.routeRequest(req, res);
});

httpServer.addListener("listening", function(listening) {
  sys.puts('Server running at http://127.0.0.1:8000/');
  sys.puts('Routing table:');
  sys.puts(sys.inspect(router.routes, false, null));
});

httpServer.listen(8000);