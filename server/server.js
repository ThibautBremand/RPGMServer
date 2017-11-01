// =============================================================================
// Nelderson's Online Core Server
// Version: 0.2.1 - August 3rd, 2017
// =============================================================================
var express = require('express')
var app = express()
var server = require('http').Server(app)
var io = require('socket.io')(server)
var config = require('./configurations/config')
var bodyParser = require('body-parser')
var logger = require('morgan') // For development
var socketioJwt = require('socketio-jwt')
var log = require('tracer').colorConsole(config.loggingConfig)

app.use(logger('dev'))// For development
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1')
  next()
})

server.listen(config.port)
log.info('Server is on bruh and running on port: ' + config.port)

// ----------------------------------
// SET ROUTES FOR EXPRESS API HERE:
// ----------------------------------

// No Authentication required:
app.use('/', require('./api_routes/login_routes'))

// Authentication required:
app.use('/example', require('./api_routes/example.js'))

// Static Server - Used to serve static files (HTNL,PNG,etc.)
app.use('/static', express.static('public'))
// ----------------------------------
// ADD SOCKET IO MODULES HERE:
// ----------------------------------
var exampleSocket = require('./socket_modules/exampleSocket')
var netplayers = require('./socket_modules/netplayer')
var chat = require('./socket_modules/chat')

/* import {exampleSocket} from './socket_modules/exampleSocket'
import {netplayers} from './socket_modules/netplayer'
import {chat} from './socket_modules/chat' */

// Pre Socket Processes Here (Mostly for Database connections)
var loginDBConnection = require('./api_routes/loginDBConnection')()

// Authorize socket connection with token from login
io.set('authorization', socketioJwt.authorize({
  secret: config.jwtSecret,
  handshake: true
}))

// When first connected to Socket.io
io.on('connection', function (socket) {
  io.clients(function (error, clients) {
    if (error) throw error
    log.info('There are ' + clients.length + ' players connected')
  })
})

// ----------------------------------
// BIND SOCKET IO MODULES HERE:
// ----------------------------------
exampleSocket(io)
netplayers(io)
chat(io)
