import jwt from 'jsonwebtoken'
import { Server as SocketServer } from 'socket.io'

const createSocketServer = (httpServer) => {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: ['http://localhost:3332', 'https://teod.pl'],
    },
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth.token

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) return next(new Error('Unauthorized [socket.io]'))

      socket.player = {
        email: decoded.UserInfo.email,
        id: decoded.UserInfo.id,
        playerName: decoded.UserInfo.playerName,
      }
      next()
    })
  })

  io.on('connection', (socket) => {
    console.log('New user connected')

    io.emit('joined_game', `${socket.player.playerName} dołączył/a do gry`)

    const onlineSocketsData = Array.from(io.sockets.sockets.values()).map(
      (connectedSocket) => ({
        id: connectedSocket.id,
        playerName: connectedSocket.player.playerName,
      })
    )

    io.emit('online_players', {
      connectedSockets: onlineSocketsData,
      onlineCount: io.sockets.sockets.size,
    })

    // Handle incoming events
    socket.on('message', (data) => {
      io.emit('response', data)
    })

    socket.on('disconnect', () => {
      console.log('User disconnected')
      const connectedSocketsData = Array.from(io.sockets.sockets.values()).map(
        (connectedSocket) => ({
          id: connectedSocket.id,
          playerName: connectedSocket.player.playerName,
        })
      )

      // Emit updated online players count
      io.emit('online_players', {
        connectedSockets: connectedSocketsData,
        onlineCount: io.sockets.sockets.size,
      })
      io.emit('joined_game', `${socket.player.playerName} opuścił/a z gry`)
    })
  })

  return io
}

export default createSocketServer
