import request from 'supertest'
import {Express} from 'express-serve-static-core'

import {createServer} from '@exmpl/utils/server'

let server: Express

beforeAll(async () => {
  server = await createServer()
})

describe('GET /soccer/{teamId}/players', () => {
  it('should return 200 & valid response', done => {
    
        done()
      })
  })