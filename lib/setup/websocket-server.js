import Puppeteer from 'puppeteer';
import http from 'http';
import WebSocket from 'ws';
import TAPDisplayTestResult from '../tap/display-test-result.js';

export default async function setupWebsocketServer(server, promise) {
  const WebSocketServer = new WebSocket.Server({ server });

  promise.resolve(WebSocketServer);
}
