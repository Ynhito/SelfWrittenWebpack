const express = require('express');
const {
  server: {host, port},
  out,
  sourceDirectory,
} = require('../config');
const http = require('http');
const chokidar = require('chokidar');
const Bundler = require('./bundler');
const WebSocket = require('ws');
const open = require('opn');
const chalk = require('chalk');

const address = `http://${host}:${port}`;
const app = express();
app.use('/static', express.static(out));

app.get('/', (req, res) => {
  res.sendFile(`${out}/index.html`);
});

const server = http.createServer(app);

const webSocketServer = new WebSocket.Server({server});
const bundler = new Bundler();

bundler.writeJsBundle();
bundler.writeHtml();

open(address, {
  app: null,
});

webSocketServer.on('connection', ws => {
  ws.on('message', m => {
    webSocketServer.clients.forEach(client => client.send(m));
  });

  ws.on('error', e => ws.send(e));
  const watcher = chokidar.watch(sourceDirectory, {
    ignoreInitial: true,
    disableGlobbing: false,
  });

  watcher.on('change', path => {
    console.log(chalk.green(`Changes in file [${path}]`));
    const ext = path.split('.').pop();
    if (ext === 'js') {
      bundler.writeJsBundle();
      ws.send('update');
    }
    if (ext === 'html') {
      bundler.writeHtml();
      ws.send('update');
    }
    if (ext === 'css') {
      bundler.writeHtml();
      ws.send('update');
    }
  });
});

app.listen(port);
server.listen(8999, () =>
  console.log('Server started! Waiting for changes...'),
);
