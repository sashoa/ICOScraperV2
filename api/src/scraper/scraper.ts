import {Context} from "koa";
import to from '../util/to'
import {Ico} from '../../../shared/Ico.model'
import {collectFromListPage} from './collectors'
import {collectFromDetailsPage} from './collectors'
import {scraper} from './cheerio'
import * as fs from 'fs'
import * as path from 'path'
import * as util from 'util'

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const icoListUrl = 'https://cointelegraph.com/ico-calendar';

export async function getOngoingIcos(ctx: Context) {

    const filePath = path.resolve('icos.json');

    let [err, icoData] = await to(readFile(filePath));

    if (err) {
        const noFileYet = err.code === 'ENOENT';
        ctx.status = noFileYet ? 200 : 500;
        ctx.body = { success: noFileYet, payload: {icos: []} };
        return
    }

    const icos = JSON.parse(icoData.toString());
    ctx.body = { success: true, payload: icos };
}

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

export async function getIcoDetails(ctx: Context) {
    const icoDetailsToken = ctx.params.detailsToken;
    const icoDetailsUrl = `${icoListUrl}/${icoDetailsToken}`;

    const [err, icoDetails] = await to(scraper(icoDetailsUrl, collectFromDetailsPage));

    if (err) {
        ctx.status = 500;
        ctx.body = { success: false, payload: null };
        return;
    }

    ctx.body = { success: true, payload: icoDetails };
}

export async function getOngoingIcosWithFullDetails(ctx: Context) {
    const [err, icos]: [Error, Ico[]] = await to(scraper(icoListUrl, collectFromListPage));

    if (err) {
        ctx.status = 500;
        ctx.body = { success: false, payload: null };
        return;
    }

    const isIcoOngoing = (ico: Ico) => {
        const now = (new Date()).getTime();
        return now >= ico.startDate.getTime() && now <= ico.endDate.getTime();
    };
    const ongoingIcos: Ico[] = icos.filter(isIcoOngoing);

    const promises = ongoingIcos.map((ico: Ico) =>
        scraper(`${icoListUrl}/${ico.detailsToken}`, collectFromDetailsPage));

    const [err1, icosDetails]: [Error, any[]] = await to(Promise.all([...promises]));

    if (err1) {
        ctx.status = 500;
        ctx.body = { success: false, payload: null };
        return;
    }

    const merged = ongoingIcos.map(ico => {
        const icoDetails = icosDetails.find(ico1 => ico.detailsToken === ico1.detailsToken);
        return icoDetails ? {...ico, ...icoDetails} : ico;
    });

    ctx.body = {success: true, payload: merged};
}

export async function updateIcos(ctx: Context) {

    const [scrapeErr, icos] = await to(scrape());
    if (scrapeErr) {
        ctx.status = 500;
        ctx.body = { success: false, payload: null };
        return;
    }

    const filePath = path.resolve('icos.json');
    let data = { updatedAt: new Date(), icos}
    const [writeErr, foo] = await to(writeFile(filePath, JSON.stringify(data)));

    if (writeErr) {
        ctx.status = 500;
        ctx.body = { success: false, payload: null };
        return;
    }

    ctx.body = { success: true, payload: null };
}

async function scrape(): Promise<Ico[]> {
    const [err, icos]: [Error, Ico[]] = await to(scraper(icoListUrl, collectFromListPage));

    if (err) {
        throw(err);
    }

    const isIcoOngoing = (ico: Ico) => {
        const now = (new Date()).getTime();
        return now >= ico.startDate.getTime() && now <= ico.endDate.getTime();
    };
    const ongoingIcos: Ico[] = icos.filter(isIcoOngoing);

    const promises = ongoingIcos.map((ico: Ico) =>
        scraper(`${icoListUrl}/${ico.detailsToken}`, collectFromDetailsPage));

    const [err1, icosDetails]: [Error, any[]] = await to(Promise.all([...promises]));

    if (err1) {
        throw(err);
    }

    return ongoingIcos.map(ico => {
        const icoDetails = icosDetails.find(ico1 => ico.detailsToken === ico1.detailsToken);
        return icoDetails ? {...ico, ...icoDetails} : ico;
    });
}
