module.exports = {
    router: '/effect/api/graphql', // GraphQL路由
    graphiql: true, // 是否开启GraphIQL
    before: async (ctx) => {
        if (!ctx.session.user) {
            throw new Error('登录失效，请重新登陆后再操作');
        }
    },
};