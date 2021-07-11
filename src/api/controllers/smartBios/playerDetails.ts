/* istanbul ignore file */

import axios from '@axios';
import * as express from 'express'
import config from '@exmpl/config'
 
interface PlayerDetail { 
    id: string,
    message: string,
    active: string,
    firstName: string,
    lastName: string,
    position: string, 
    type: string,
    nationality: string,
    dateOfBirth: string,
    height: string,
    weight: string,
    gender: string,
}

export function playerDetails(req: express.Request, res: express.Response): void {
  const playerId = req.params.playerId
    axios.get(`https://api.performfeeds.com/soccerdata/nlgdynamicplayerbio/1wu7u19ujnhix1rgqnyuk6y4nu/${playerId}?_rt=b&_fmt=json`, {
    }).then(response => {
        console.info(response.data.person[0])
        const { ...foo }: PlayerDetail = response.data.person[0];
        res.send(foo)
    }).catch(err => {
        console.error(err)
        if (err.message && `${err.message}`.includes('404')) {
            return res.status(404).send({
                error: {
                    type: 'invalid request',
                    message: 'Invalid playerId',
                    errors: ['Invalid playerId', `No Player found with id ${playerId}`]
                }
            })
        } else {

            /* istanbul ignore next */
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