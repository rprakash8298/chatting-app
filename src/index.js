const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generatelocation} = require('./utils/messages')
const {addUser,removeUser,getUser,getUsersRoom} = require('./utils/users')
const app = express()
const server = http.createServer(app)
const io = socketio(server)
const port = process.env.PORT || 3000
// app.set('view engine', 'hbs')
app.use(express.static(path.join(__dirname, '../public')))
// app.get('/', (req, res) => {
//     res.render('index')
// })
io.on('connection', (socket) => {
    console.log('new websocket connection')
    
    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })
        if (error) {
            return callback(error)
        }
        socket.join(user.room)
         socket.emit('joinMess', generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('joinMess', generateMessage('Admin', `${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room:user.room,
            users:getUsersRoom(user.room)
        })
        // socket.emit, io.on, socket.braodcast.emit,
        // io.to.emit, socket.broadcast.to.emit
    })

    socket.on('clientMess', (input, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()
        if (filter.isProfane(input)) {
            return callback('bad words not allowed')
        }
        io.to(user.room).emit('joinMess', generateMessage(user.username, input ))
        callback()
    })
    
    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMess', generatelocation(user.username, `https://google.com/maps?q=${coords.lat},${coords.long}`))   
        callback('Delivered')
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('joinMess', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users:getUsersRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log('running successfully at ' + port)
})