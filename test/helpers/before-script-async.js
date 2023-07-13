import express from 'express';
import cors from "cors";
import kleur from 'kleur';
import bindServerToPort from '../../lib/setup/bind-server-to-port.js';
import './before-script-basic.js';
import QUnit from '../../index.js';

export default async function(config) {
  console.log('Starting before script with:');

  let hasServerRunning = !!config.expressApp;

  config.expressApp = config.expressApp || express();
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
    let server = await bindServerToPort(config.expressApp, config);

    QUnit.config.port = config.port;
    console.log(`Web server started on port ${QUnit.config.port}`);
  }
}

function wait(duration) {
  return new Promise((resolve) => setTimeout(() => { resolve() }, duration));
}

