"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const to_1 = require("../util/to");
const collectors_1 = require("./collectors");
const collectors_2 = require("./collectors");
const cheerio_1 = require("./cheerio");
const fs = require("fs");
const path = require("path");
const util = require("util");
const request = require("request");
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const icoListUrl = 'https://cointelegraph.com/ico-calendar';
async function getOngoingIcos(ctx) {
    const filePath = path.resolve('icos.json');
    let [err, icoData] = await to_1.default(readFile(filePath));
    if (err) {
        const noFileYet = err.code === 'ENOENT';
        ctx.status = noFileYet ? 200 : 500;
        ctx.body = { success: noFileYet, payload: { icos: [] } };
        return;
    }
    const icos = JSON.parse(icoData.toString());
    ctx.body = { success: true, payload: icos };
}
exports.getOngoingIcos = getOngoingIcos;
// export async function getOngoingIcos(ctx: Context) {
//
//     const [err, icos]: [Error, Ico[]] = await to(scraper(icoListUrl, collectFromListPage));
//
//     if (err) {
//         ctx.status = 500;
//         ctx.body = { success: false, payload: null };
//         return;
//     }
//
//     const isIcoOngoing = (ico: Ico) => {
//         const now = (new Date()).getTime();
//         return now >= ico.startDate.getTime() && now <= ico.endDate.getTime();
//     };
//     const ongoingIcos = icos.filter(isIcoOngoing);
//
//     ctx.body = { success: true, payload: ongoingIcos };
// }
async function getIcoDetails(ctx) {
    const icoDetailsToken = ctx.params.detailsToken;
    const icoDetailsUrl = `${icoListUrl}/${icoDetailsToken}`;
    const [err, icoDetails] = await to_1.default(cheerio_1.scraper(icoDetailsUrl, collectors_2.collectFromDetailsPage));
    if (err) {
        ctx.status = 500;
        ctx.body = { success: false, payload: null };
        return;
    }
    ctx.body = { success: true, payload: icoDetails };
}
exports.getIcoDetails = getIcoDetails;
async function getOngoingIcosWithFullDetails(ctx) {
    const [err, icos] = await to_1.default(cheerio_1.scraper(icoListUrl, collectors_1.collectFromListPage));
    if (err) {
        ctx.status = 500;
        ctx.body = { success: false, payload: null };
        return;
    }
    const isIcoOngoing = (ico) => {
        const now = (new Date()).getTime();
        return now >= ico.startDate.getTime() && now <= ico.endDate.getTime();
    };
    const ongoingIcos = icos.filter(isIcoOngoing);
    const promises = ongoingIcos.map((ico) => cheerio_1.scraper(`${icoListUrl}/${ico.detailsToken}`, collectors_2.collectFromDetailsPage));
    const [err1, icosDetails] = await to_1.default(Promise.all([...promises]));
    if (err1) {
        ctx.status = 500;
        ctx.body = { success: false, payload: null };
        return;
    }
    const merged = ongoingIcos.map(ico => {
        const icoDetails = icosDetails.find(ico1 => ico.detailsToken === ico1.detailsToken);
        return icoDetails ? Object.assign({}, ico, icoDetails) : ico;
    });
    ctx.body = { success: true, payload: merged };
}
exports.getOngoingIcosWithFullDetails = getOngoingIcosWithFullDetails;
async function updateIcos(ctx) {
    const [scrapeErr, icos] = await to_1.default(scrape());
    if (scrapeErr) {
        ctx.status = 500;
        ctx.body = { success: false, payload: null };
        return;
    }
    const filePath = path.resolve('icos.json');
    let data = { updatedAt: new Date(), icos };
    const [writeErr, foo] = await to_1.default(writeFile(filePath, JSON.stringify(data)));
    if (writeErr) {
        ctx.status = 500;
        ctx.body = { success: false, payload: null };
        return;
    }
    ctx.body = { success: true, payload: null };
}
exports.updateIcos = updateIcos;
async function scrape() {
    const [err, icos] = await to_1.default(cheerio_1.scraper(icoListUrl, collectors_1.collectFromListPage));
    if (err) {
        throw (err);
    }
    const isIcoOngoing = (ico) => {
        const now = (new Date()).getTime();
        return now >= ico.startDate.getTime() && now <= ico.endDate.getTime();
    };
    const ongoingIcos = icos.filter(isIcoOngoing);
    const promises = ongoingIcos.map((ico) => cheerio_1.scraper(`${icoListUrl}/${ico.detailsToken}`, collectors_2.collectFromDetailsPage));
    const [err1, icosDetails] = await to_1.default(Promise.all([...promises]));
    if (err1) {
        throw (err);
    }
    let merged = ongoingIcos.map(ico => {
        const icoDetails = icosDetails.find(ico1 => ico.detailsToken === ico1.detailsToken);
        return icoDetails ? Object.assign({}, ico, icoDetails) : ico;
    });
    const downloadImagesPromises = merged.map(ico => downloadLogoImage(ico.logoUrl, ico.detailsToken));
    const [downloadImgErr, images] = await Promise.all([...downloadImagesPromises]);
    if (downloadImgErr) {
        console.error(downloadImgErr);
    }
    merged.forEach(ico => ico.logoUrl = `/api/assets/images/${ico.detailsToken}.jpg`);
    return merged;
}
async function downloadLogoImage(uri, fileName) {
    const filePath = path.resolve(`assets/images/${fileName}.jpg`);
    return new Promise((resolve, reject) => {
        let file = fs.createWriteStream(filePath);
        return request.get(uri).pipe(file)
            .on('finish', resolve)
            .on('error', reject);
    });
}
// scrape();
//# sourceMappingURL=scraper.js.map