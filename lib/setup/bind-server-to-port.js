import kleur from 'kleur';
import TAPDisplayTestResult from '../tap/display-test-result.js';
import resolvePortNumberFor from '../utils/resolve-port-number-for.js';

// TODO: there is a race condition between socket.connection and server.listen
export default async function bindServerToPort(server, config, promise) {
  try {
    let port = await resolvePortNumberFor(config.httpPort);

    await server.listen(port);

    promise.resolve(server);
  } catch(e) {
    bindServerToPort(server, Object.assign(config, { httpPort: config.httpPort + 1 }), promise);
  }

}
