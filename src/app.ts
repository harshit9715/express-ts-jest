import {createServer} from './utils/server'
import logger from '@exmpl/utils/logger'
const console = logger;

createServer()
  .then(server => {
    server.listen(3000, () => {
      console.info(`Listening on http://localhost:3000`)
    })
  })
  .catch(err => {
    console.error(`Error: ${err}`)
  })