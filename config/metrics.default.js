module.exports = {
    host: process.env.ROUTE_IP,
    port: 9123,
    defaultPrefix: 'ies.fe.effect',
    bufferSize: 10,
    flushInterval: 30 * 1000,
};