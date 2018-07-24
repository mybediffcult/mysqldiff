
const devClient = require('./common').devClient;

console.log('before client:\n', devClient.connection);

devClient.query('show tables')
    .then(_=>console.log('after clien:\n', devClient))
    .then(_=>process.exit(0));