"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Koa = require("koa");
const scraper_1 = require("./scraper");
const serve = require("koa-static");
const path = require("path");
const app = new Koa();
app.use(serve('.'));
app.use(async (ctx, next) => {
    console.log(ctx.req.url);
    await next;
});
app.use(scraper_1.router.routes());
app.listen(8090);
console.log('Server running on port 8090');
console.log(path.resolve(__dirname));
//# sourceMappingURL=server.js.map