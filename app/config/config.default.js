module.exports = (app) => {
    return {
        middleware: [
            'koa-json',
            'koa-body',
            // 'permission',
        ],
        plugin: [
            'byted-gulu-runtime-ies',
            'byted-gulu-graphql',
            'byted-gulu-redis',
            'byted-gulu-sequelize',
            // 'byted-gulu-tos',
            'byted-gulu-metrics',
            'byted-gulu-session',
            'tos-hub',
            'tosUtil',
        ],
        koaBody: {
            multipart: true,
        },
        koaJson: {
            pretty: false,
        },
    };
};