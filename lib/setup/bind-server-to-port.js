import { promisify } from 'node:util';
import resolvePortNumberFor from '../utils/resolve-port-number-for.js';

// NOTE: there was a race condition between socket.connection and server.listen, check if nanoexpress fixes it
export default async function bindServerToPort(config, server) {
  try {
    let port = await resolvePortNumberFor(config.port);

    console.log(port);
    console.log('server is:');
    console.log(server);

    let listen = (targetPort) => {
      return new Promise((resolve, reject) => {
        try {
          server.listen(targetPort, () => resolve());
        } catch (error) {
          reject(error);
        }
      });
    };

    await listen(port);

    return server;
  } catch(e) {
    console.error('bindServerToPort Error:', e);
    return await bindServerToPort(server, Object.assign(config, { port: config.port + 1 }));
  }
}
