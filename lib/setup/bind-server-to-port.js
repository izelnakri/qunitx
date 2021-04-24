import kleur from 'kleur';
import TAPDisplayTestResult from '../tap/display-test-result.js';
import resolvePortNumberFor from '../utils/resolve-port-number-for.js';

// TODO: there is a race condition between socket.connection and server.listen
export default async function bindServerToPort(server, WebSocketServer, config, promise) {
  WebSocketServer.on('connection', (webSocket) => {
    console.log('TAP version 13');

    webSocket.on('message', (message) => {
      const { event, details } = JSON.parse(message);

      if (event === 'testEnd') {
        TAPDisplayTestResult(config.COUNTER, details)
      }
    });
  });

  server.listen(await resolvePortNumberFor(config.httpPort), () => {
    if (config.watch || config.debug) {
      const port = server.address().port;
      console.log('#', kleur.blue(`HTTPServer running on port ${port}`));
      console.log('#', kleur.blue(`WebsocketServer running on port ${WebSocketServer.address().port}`));
    }

    promise.resolve(server);
  });

  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      bindServerToPort(server, WebSocketServer, Object.assign(config, { httpPort: config.httpPort + 1 }), promise);
    }
    console.log('UNKNOWN ERROR', e);
  });
}
