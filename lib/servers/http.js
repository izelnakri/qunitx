import http from 'node:http';
import WebSocket, { WebSocketServer } from 'ws';
import bindServerToPort from '../setup/bind-server-to-port.js';

export const MIME_TYPES = {
  html: "text/html; charset=UTF-8",
  js: "application/javascript",
  css: "text/css",
  png: "image/png",
  jpg: "image/jpg",
  gif: "image/gif",
  ico: "image/x-icon",
  svg: "image/svg+xml",
};

export default class HTTPServer {
  static serve(config = { port: 1234 }, handler) {
    let onListen = config.onListen || ((server) => {});
    let onError = config.onError || ((error) => {});

    return new Promise((resolve, reject) => {
      let server = http.createServer((req, res) => {
        return handler(req, res);
      });
      server = server;
      server.on('error', (error) => {
        onError(error);
        reject(error);
      }).once('listening', () => {
        onListen(Object.assign({ hostname: '127.0.0.1', server }, config));
        resolve(server);
      })

      server.wss = new WebSocketServer({ server });
      server.wss.on('error', (error) => {
        console.log('# [WebSocketServer] Error:');
        console.trace(error);
      });

      bindServerToPort(server, config)
    });
  }

  constructor() {
    this.routes = {
      GET: {},
      POST: {},
      DELETE: {},
      PUT: {}
    };
    this.middleware = [];
    this._server = http.createServer((req, res) => {
      res.send = (data) => {
        res.setHeader('Content-Type', 'text/plain');
        res.end(data);
      };
      res.json = (data) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
      };

      return this.handleRequest(req, res);
    });
    this.wss = new WebSocketServer({ server: this._server });
    this.wss.on('error', (error) => {
      console.log('# [WebSocketServer] Error:');
      console.log(error);
    });
  }

  close() {
    return this._server.close();
  }

  get(path, handler) {
    this.registerRouteHandler('GET', path, handler);
  }

  listen(port = 0, callback = () => {}) {
    return new Promise((resolve, reject) => {
      this._server.listen(port, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve(callback());
        }
      });
    });
  }

  publish(data) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  post(path, handler) {
    this.registerRouteHandler('POST', path, handler);
  }

  delete(path, handler) {
    this.registerRouteHandler('DELETE', path, handler);
  }

  put(path, handler) {
    this.registerRouteHandler('PUT', path, handler);
  }

  use(middleware) {
    this.middleware.push(middleware);
  }

  registerRouteHandler(method, path, handler) {
    if (!this.routes[method]) {
      this.routes[method] = {};
    }

    this.routes[method][path] = {
      path,
      handler,
      paramNames: this.extractParamNames(path),
      isWildcard: path === '/*'
    };
  }

  handleRequest(req, res) {
    const { method, url } = req;
    const matchingRoute = this.findRouteHandler(method, url);

    if (matchingRoute) {
      req.params = this.extractParams(matchingRoute, url);
      this.runMiddleware(req, res, matchingRoute.handler);
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Not found');
    }
  }

  runMiddleware(req, res, callback) {
    let index = 0;
    const next = () => {
      if (index >= this.middleware.length) {
        callback(req, res);
      } else {
        const middleware = this.middleware[index];
        index++;
        middleware(req, res, next);
      }
    };
    next();
  }

  findRouteHandler(method, url) {
    const routes = this.routes[method];
    if (!routes) {
      return null;
    }

    return routes[url] || Object.values(routes).find(route => {
      const { path, isWildcard } = route;

      if (!isWildcard && !path.includes(':')) {
        return false;
      }

      if (isWildcard || this.matchPathSegments(path, url)) {
        if (route.paramNames.length > 0) {
          const regexPattern = this.buildRegexPattern(path, route.paramNames);
          const regex = new RegExp(`^${regexPattern}$`);
          const regexMatches = regex.exec(url);
          if (regexMatches) {
            route.paramValues = regexMatches.slice(1);
          }
        }
        return true;
      }

      return false;
    }) || routes['/*'] || null;
  }

  matchPathSegments(path, url) {
    const pathSegments = path.split('/');
    const urlSegments = url.split('/');

    if (pathSegments.length !== urlSegments.length) {
      return false;
    }

    for (let i = 0; i < pathSegments.length; i++) {
      const pathSegment = pathSegments[i];
      const urlSegment = urlSegments[i];

      if (pathSegment.startsWith(':')) {
        continue;
      }

      if (pathSegment !== urlSegment) {
        return false;
      }
    }

    return true;
  }

  buildRegexPattern(path, paramNames) {
    let regexPattern = path.replace(/:[^/]+/g, '([^/]+)');
    regexPattern = regexPattern.replace(/\//g, '\\/');

    return regexPattern;
  }

  extractParamNames(path) {
    const paramRegex = /:(\w+)/g;
    const paramMatches = path.match(paramRegex);

    return paramMatches ? paramMatches.map(match => match.slice(1)) : [];
  }

  extractParams(route, url) {
    const { paramNames, paramValues } = route;
    const params = {};

    for (let i = 0; i < paramNames.length; i++) {
      params[paramNames[i]] = paramValues[i];
    }

    return params;
  }
}
