"use strict";
/* istanbul ignore file */
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.playerDetails = void 0;
var _axios_1 = __importDefault(require("@axios"));
function playerDetails(req, res) {
    var playerId = req.params.playerId;
    _axios_1.default.get("https://api.performfeeds.com/soccerdata/nlgdynamicplayerbio/1wu7u19ujnhix1rgqnyuk6y4nu/" + playerId + "?_rt=b&_fmt=json", {}).then(function (response) {
        console.info(response.data.person[0]);
        var foo = __rest(response.data.person[0], []);
        res.send(foo);
    }).catch(function (err) {
        console.error(err);
        if (err.message && ("" + err.message).includes('404')) {
            return res.status(404).send({
                error: {
                    type: 'invalid request',
                    message: 'Invalid playerId',
                    errors: ['Invalid playerId', "No Player found with id " + playerId]
                }
            });
        }
        else {
            /* istanbul ignore next */
            res.status(500).send({
                'error': {
                    type: 'Server Error',
                    message: 'Internal Server Error',
                    errors: []
                }
            });
        }
    });
}
exports.playerDetails = playerDetails;
