import chalk from 'chalk';
import Puppeteer from 'puppeteer';
import WebSocket from 'ws';
import TAPDisplayTestResult from '../tap/display-test-result.js';
// import Console from '../utils/console.js';

const defaults = { port: 4200, debug: false, socketPort: 65511 };

export default async function(COUNTER, options = { port: 4200, debug: false, socketPort: 65511 }) {
  const OPTIONS = Object.assign({}, defaults, options);
  const WebSocketServer = new WebSocket.Server({ port: OPTIONS.socketPort });

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
