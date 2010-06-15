var sys = require('sys'),
    http = require('http');
    router = require('./lib/router').createRouter();
    repl = require('repl');

router.get('/', function() {
  this.response.writeHead(200, {'Content-Type': 'text/plain'});
  this.response.end('Hello, world!');
});

router.get('/hello/:name', function(name) {
  this.response.writeHead(200, {'Content-Type': 'text/plain'});
  this.response.end('Hello, ' + name + '!');
});

router.get('/dog', function() {
  this.response.writeHead(200, {'Content-Type': 'text/plain'});
  this.response.end('Sup, dog!');
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