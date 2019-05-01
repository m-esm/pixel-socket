const WebSocket = require('ws');

const wss = new WebSocket.Server({ noServer: true });
const fs = require('fs');
const http = require('http');


wss.on('connection', function connection(ws, req) {

    ws.url = req.url;

    console.log('new connection', req.url);
    ws.on('message', function incoming(message) {
        console.log('received message', message.length);


        //     fs.writeFileSync('out/' + Date.now() + '.jpg', message, { encoding: 'Base64' })

        wss.clients.forEach((wsc) => {
            if (wsc.url != ws.url) {
                wsc.send(message);
            }
        })
    });

});


const server = http.createServer((req, res) => {




    var filePath = req.url == '/' ? '/client.html' : req.url;

    filePath = filePath.slice(1,filePath.length)
    if (fs.existsSync(filePath)) {
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        fs.createReadStream(filePath).pipe(res);

    } else {

        res.end();

    }


});


server.on('upgrade', function upgrade(req, socket, head) {

    if (req.url === '/socket_host' || req.url == '/socket_client') {


        wss.handleUpgrade(req, socket, head, function done(ws) {
            wss.emit('connection', ws, req);
        });
    } else {
        socket.destroy();
    }
});

server.listen(8081);





