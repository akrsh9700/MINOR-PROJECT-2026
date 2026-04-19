import http from 'http'
import next from 'next'
import { Server } from 'socket.io'

const dev = process.env.NODE_ENV !== 'production'
const port = Number.parseInt(process.env.PORT || '3000', 10)

const app = next({ dev })
const handle = app.getRequestHandler()

await app.prepare()

const server = http.createServer((req, res) => handle(req, res))

const io = new Server(server, {
  path: '/socket.io',
  cors: {
    origin: true,
    credentials: true,
  },
})

globalThis.__io = io

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    if (typeof userId === 'string' && userId.length > 0) {
      socket.join(userId)
    }
  })
})

server.listen(port, () => {
  process.stdout.write(`> Server listening on http://localhost:${port}\n`)
})

