import axios from '@axios'
import * as express from 'express'
import logger from '@exmpl/utils/logger'
import config from '@exmpl/config'
const console = logger;

interface Person { id: string; active: string; firstName: string; lastName: string; position: string, type: string }

export function listPlayers(req: express.Request, res: express.Response): void {
    const teamId = req.params.teamId
    axios.get(`/soccerdata/squads/${config.outletAuthKey}?_fmt=json&_rt=b&tmcl=7vobsvcksvurqhc540ei5nwq2&ctst=${teamId}`, {
    }).then(response => {
        res.send(response.data.squad[0].person.map((person: Person) => ({
            id: person.id,
            active: person.active == 'yes',
            firstName: person.firstName,
            lastName: person.lastName,
            position: person.position,
            type: person.type,
        })))
    }).catch(err => {
        console.error(err.response.data)
        /* istanbul ignore next */ 
        if (`${err.message}`.includes('404')) {
            return res.status(404).send({
                error: {
                    type: 'invalid request',
                    message: 'Invalid teamId',
                    errors: ['Invalid teamId', `No Team found with id ${teamId}`]
                }
            })
        }
        else {
            res.status(500).send({
                'error': {
                    type: 'Server Error',
                    message: 'Internal Server Error',
                    errors: []
                }
            })
        }
    })
}