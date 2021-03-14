import chalk from 'chalk';
import Puppeteer from 'puppeteer';
import WebSocket from 'ws';
import TAPDisplayTestResult from '../tap/display-test-result.js';

export default async function(COUNTER, options = { httpPort: 4200, debug: false, watch: false, wsPort: 65511 }) {
  const WebSocketServer = new WebSocket.Server({ port: options.wsPort });

  if (options.debug || options.watch) {
    console.log(`WS Server running on ${options.wsPort}`);
  }

  WebSocketServer.on('connection', (webSocket) => {
    console.log('TAP version 13');

    webSocket.on('message', (message) => {
      const { event, details } = JSON.parse(message);

      if (event === 'testEnd') {
        TAPDisplayTestResult(COUNTER, details)
      }
    });
  });

  return WebSocketServer;
}
