import express from 'nanoexpress';
import cors from "cors";
import kleur from 'kleur';
import bindServerToPort from '../../lib/setup/bind-server-to-port.js';
import './before-script-basic.js';
import QUnit from '../../index.js';

export default async function(config) {
  console.log('Starting before script with:');

  let ServerConsole = ['log', 'error', 'done', 'warn', 'info'].reduce((result, type) => {
    return Object.assign(result, {
      [type]: (...messages) => {
        console.log(`# HTTPServer[${type}] :`, ...messages);
      }
    });
  }, {});
  ServerConsole.debug = (...messages) => {
    console.log('#', kleur.blue(`HTTPServer`), ...messages);
  };

  let hasServerRunning = !!config.expressApp;
  config.expressApp = config.expressApp || express({ console: ServerConsole });
  config.expressApp.use(cors());
  config.expressApp.get("/films", (req, res) => {
    console.log('req received');
    res.json({ film: "responsed correctly" });
  });
  config.expressApp.get("/movies/too-big-to-fail", (req, res) => {
    res.json({ movie: "is too-big-to-fail" });
  });

  if (!hasServerRunning) {
    console.log('DOESNT HAVE SERVER RUNNING');
    let server = await bindServerToPort(config, config.expressApp);

    QUnit.config.port = server.config.port;
    console.log(`Web server started on port ${QUnit.config.port}`);
  }
}

function wait(duration) {
  return new Promise((resolve) => setTimeout(() => { resolve() }, duration));
}

