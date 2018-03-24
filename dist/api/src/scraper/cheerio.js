"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio = require("cheerio");
const requestPromise = require("request-promise");
const to_1 = require("../util/to");
async function scraper(uri, collectorFn) {
    const transform = (body) => cheerio.load(body);
    const [err, $] = await to_1.default(requestPromise.get(uri, { transform }));
    if (err) {
        console.error('An error occured while collecting data.');
        console.log(err);
        return;
    }
    return collectorFn($, uri);
}
exports.scraper = scraper;
//# sourceMappingURL=cheerio.js.map