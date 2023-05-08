// TODO: make this a web server
import fs from 'fs/promises';
import express from 'nanoexpress';
import cors from 'cors';
import './before-script-basic.js';

export default async function(config) {
  console.log('Starting before script with:');
  console.log(JSON.stringify(config, null, 2));

  const app = express();

  app.use(cors());

  app.get("/films", (req, res) => {
    console.log('req received');
    res.json({ film: "responsed correctly" });
  });

  app.get("/movies/too-big-to-fail", (req, res) => {
    res.json({ movie: "is too-big-to-fail" });
  });

  await app.listen(4000);
  console.log("Web server started on port 4000");
}

function wait(duration) {
  return new Promise((resolve) => setTimeout(() => { resolve() }, duration));
}
