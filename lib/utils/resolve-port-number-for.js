export default async function resolvePortNumberFor(portNumber) {
  if (await portIsAvailable(portNumber)) {
    return portNumber;
  }

  return (await resolvePortNumberFor(portNumber + 1));
}

function portIsAvailable(portNumber) {
  return new Promise(async (resolve) => {
    const net = await import('net');
    const server = net.createServer();

    server.once('error', function(err) {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      }
    });

    server.once('listening', function() {
      server.close();
      resolve(true);
    });

    server.listen(portNumber);
  });
}
