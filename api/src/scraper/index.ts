import * as Router from "koa-router";
import {getOngoingIcos, getOngoingIcosWithFullDetails, getIcoDetails, updateIcos} from './scraper'

const _router = new Router();

_router.get('/ico', getOngoingIcos);
_router.get('/ico/update', updateIcos);
_router.get('/ico/:detailsToken', getIcoDetails);

export const router = _router;