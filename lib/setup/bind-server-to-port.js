import kleur from 'kleur';
import TAPDisplayTestResult from '../tap/display-test-result.js';
import resolvePortNumberFor from '../utils/resolve-port-number-for.js';

// NOTE: there was a race condition between socket.connection and server.listen, check if nanoexpress fixes it
export default async function bindServerToPort(config, server) {
  try {
    let port = await resolvePortNumberFor(config.httpPort);

    await server.listen(port);

    return server;
  } catch(e) {
    return await bindServerToPort(server, Object.assign(config, { httpPort: config.httpPort + 1 }));
  }
}
