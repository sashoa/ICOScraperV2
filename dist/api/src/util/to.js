"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function to(promise) {
    return promise
        .then(data => [null, data])
        .catch(err => [err, null]);
}
exports.default = to;
//# sourceMappingURL=to.js.map