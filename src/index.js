const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words') // Filter profane language 
const { generateMessage, generateLocationMessage } = require('./utils/messages')

// created explicitly , because socket expects raw http server 
// express does it behind the scene but doesnt allow to pass it

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New WebSocket connection')
    
    socket.on('join', ({username,room}) =>{
        socket.join(room)

        socket.emit('message', generateMessage('Welcome!'))  // cmd , var
        socket.broadcast.emit('message', generateMessage('A new user has joined!'))
    })
    
    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }

        io.emit('message', generateMessage(message))
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {                   // send location using (lat , long)
        io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        io.emit('message', generateMessage('A user has left!'))
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})



// server emit -> client receive - countupdate 
// client emit -> server receive - increment



// // .on()   this is done for receiver end 
// io.on('connection', (socket) =>{
//     console.log('New websocket connection');
//     socket.emit('countupdate', count)       // .emit()   this is done for senders end 
//     socket.on('increment',()=>{
//         count++;
//         //server.emit('countupdate', count)

//         io.emit('countupdate', count)       // to increase limit to more than 1 client and show updation in every client end 
//     } )
// })

// .on()   this is done for receiver end