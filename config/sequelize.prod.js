const path = require('path');

module.exports = (app) =>{
    return {
        client: {
            name: 'effect',
            username: '',
            password: '',
            modelDir: path.resolve(app.root, 'app', 'model'),
            options: {
                replication: {
                    read: [{
                        psm: 'toutiao.mysql.effect_read',
                        username: 'effect_r',
                        password: 'fbLbpICoRkQXYiM_YDDZ2l2MukgtSUR6',
                    }],
                    write: {
                        psm: 'toutiao.mysql.effect_write',
                        username: 'effect_w',
                        password: 'vuduwtS04jC83z6_9kIken4AaDuYMjCn',
                    },
                },
                timezone: '+08:00',
            },
        },
    };
};

