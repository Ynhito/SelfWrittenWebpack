module.exports = {
  entry: 'entry.js',
  out: `${__dirname}/dist`,
  sourceDirectory: './example',
  html: 'index.html',
  server: {
    port: 3000,
    host: 'localhost',
  },
};
