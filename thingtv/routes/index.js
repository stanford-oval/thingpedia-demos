const Url = require('url');
const http = require('http');

module.exports = function(app) {
    app.get('/', function(req, res, next) {
        res.render('index');
    });

    app.get('/placeholder', function(req, res, next) {
        res.render('placeholder');
    });

    app.ws('/client', function(ws, req) {
        console.log('Client connected on websocket');

        var clients = req.app.thingtv.clients;
        var webhooks = req.app.thingtv.webhooks;

        ws.on('close', function() {
            var idx = clients.indexOf(ws);
            if (idx >= 0)
                clients.splice(idx, 1);
        });
        ws.on('message', function(msg) {
            var parsed = JSON.parse(msg);
            if (parsed.type === 'event') {
                webhooks.forEach(function(url) {
                    var opts = Url.parse(url);
                    opts.method = 'POST';
                    opts.headers = {
                        'Content-Type': 'application/json'
                    };
                    var req = http.request(opts);
                    req.end(JSON.stringify(parsed.event));
                });
            }
        });

        clients.push(ws);
    });
}

