import resolvePortNumberFor from '../utils/resolve-port-number-for.js';

// NOTE: there was a race condition between socket.connection and server.listen, check if nanoexpress fixes it
export default async function bindServerToPort(server, config) {
  try {
    let port = await resolvePortNumberFor(config.port);

    await server.listen(port);

    return server;
  } catch(e) {
    return await bindServerToPort(server, Object.assign(config, { port: config.port + 1 }));
  }
}
