import request from 'supertest'
import {Express} from 'express-serve-static-core'

import {createServer} from '@exmpl/utils/server'

let server: Express

beforeAll(async () => {
  server = await createServer()
})

describe('GET /soccer/{teamId}/players', () => {
  it('should return 200 & valid response', done => {
    request(server)
      .get(`/api/v1/soccer/agxipc0vk4rtg09amjxv10nx0/players`)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        // expect(res.body).toMatchObject({'message': 'Hello, stranger!'})
        done()
      })
  })
  
  it('should return 404 & valid error response team id is invalid', done => {
    request(server)
      .get(`/api/v1/soccer/agxipc0vk4rtg09amjxv10nx/players`)
      .expect('Content-Type', /json/)
      .expect(404)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body).toMatchObject({'error': {
          type: 'invalid request', 
          message: expect.stringMatching('.+'), 
          errors: expect.anything()
        }})
        done()
      })
  })

  // it('should return 500 & valid error', done => {
  //   request(server)
  //     .get(`/api/v2/soccer/884uzyf1wosc7ykji6e18gif/players`)
  //     .expect('Content-Type', /json/)
  //     .expect(500)
  //     .end((err, res) => {
  //       if (err) return done(err)
  //       expect(res.body).toMatchObject({'error': {
  //         type: 'invalid request', 
  //         message: expect.stringMatching('.+'), 
  //         errors: expect.anything()
  //       }})
  //       done()
  //     })
  // })
})