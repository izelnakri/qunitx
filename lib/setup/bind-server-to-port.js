import TAPDisplayTestResult from '../tap/display-test-result.js';
import resolvePortNumberFor from '../utils/resolve-port-number-for.js';

export default async function bindServerToPort(server, WebSocketServer, COUNTER, config, promise) {
  WebSocketServer.on('connection', (webSocket) => {
    console.log('TAP version 13');

    webSocket.on('message', (message) => {
      const { event, details } = JSON.parse(message);

      if (event === 'testEnd') {
        TAPDisplayTestResult(COUNTER, details)
      }
    });
  });
  let port = await resolvePortNumberFor(config.httpPort);
  server.listen(port, () => {
    if (config.watch || config.debug) {
      const port = server.address().port;
      console.log(`http server running on port ${port}`);
      console.log(`websocket server running on port ${WebSocketServer.address().port}`);
    }

    server.on('close', () => {
      WebSocketServer.close();
    });

    promise.resolve(server);
  });
  server.on('error', async (e) => {
    if (e.code === 'EADDRINUSE') {
      server.close();
      bindServerToPort(server, WebSocketServer, COUNTER, Object.assign(config, { httpPort: port + 1 }), promise);
    }
  });

}
