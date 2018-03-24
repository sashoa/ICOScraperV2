"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const scraper_1 = require("./scraper");
const _router = new Router();
_router.get('/ico', scraper_1.getOngoingIcos);
_router.get('/ico/update', scraper_1.updateIcos);
_router.get('/ico/:detailsToken', scraper_1.getIcoDetails);
exports.router = _router;
//# sourceMappingURL=index.js.map