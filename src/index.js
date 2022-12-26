const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words') // Filter profane language 
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, getUser, getUsersInRoom, removeUser } = require('./utils/users')

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
    
    socket.on('join', (options, callback) => {
        const {error , user } = addUser({ id : socket.id , ...options})
        
        if(error)
        {
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('message', generateMessage('Admin',`Welcome to ${user.room}`))

        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room : user.room,
            users : getUsersInRoom(user.room)
        })

        callback()  // calling the callback letting the client know that there is no error (thats why no parameters )

        // socket.emit, io.emit, socket.broadcast.emit
        // io.to.emit, socket.broadcast.to.emit
    })
    
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }

        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {                   // send location using (lat , long)
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user)
        {
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left!`))
            io.to(user.room).emit('roomData',{
                room : user.room,
                users : getUsersInRoom(user.room)        // keep active list to users 
            })
        }
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

