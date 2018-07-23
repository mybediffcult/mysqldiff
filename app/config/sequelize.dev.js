/**
 *  开发库使用线下库，不区分读写
 */
const path = require('path');

module.exports = (app) => ({
    client: {
        name: 'effect_dev',
        username: 'effect_dev_w',
        password: '1kQo4m9cQMbdDghL_xQ8EJ8sR0NHy2pL',
        modelDir: path.resolve(app.root, 'app', 'model'),
        options: {
            host: '10.6.19.35',
            port: 3307,
            timezone: '+08:00',
            logging: function (str) {
                console.log(str + '\n');
            },
        },
    },
});
