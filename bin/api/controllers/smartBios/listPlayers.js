"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPlayers = void 0;
var _axios_1 = __importDefault(require("@axios"));
var logger_1 = __importDefault(require("@exmpl/utils/logger"));
var config_1 = __importDefault(require("@exmpl/config"));
var console = logger_1.default;
function listPlayers(req, res) {
    var teamId = req.params.teamId;
    _axios_1.default.get("/soccerdata/squads/" + config_1.default.outletAuthKey + "?_fmt=json&_rt=b&tmcl=7vobsvcksvurqhc540ei5nwq2&ctst=" + teamId, {}).then(function (response) {
        res.send(response.data.squad[0].person.map(function (person) { return ({
            id: person.id,
            active: person.active == 'yes',
            firstName: person.firstName,
            lastName: person.lastName,
            position: person.position,
            type: person.type,
        }); }));
    }).catch(function (err) {
        console.error(err.response.data);
        if (("" + err.message).includes('404')) {
            return res.status(404).send({
                error: {
                    type: 'invalid request',
                    message: 'Invalid teamId',
                    errors: ['Invalid teamId', "No Team found with id " + teamId]
                }
            });
        }
        /* istanbul ignore next */
        else {
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
exports.listPlayers = listPlayers;
