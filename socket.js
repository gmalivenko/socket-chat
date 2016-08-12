'use strict';

let messageBufferSize = 30;
let usernameMaxLength = 12;
let messageMaxLength = 256;

let escape = require('escape-html');

let debug = require('debug')('socket');
let users = [];
let messages = [];

module.exports = (io) =>
  (socket) => {
    var user = {};
    user.id = socket.id;
    user.loginTime = new Date();

    debug('New connection', user);

    let messageHistoryCB = (data, cb) => {
      cb(messages);
    }

    let messageCB = (data) => {
      let message = {
        time: new Date(),
        message: escape(data.message).substring(0, messageMaxLength),
        user: user,
      }
      
      messages.push(message);

      if (messages.length > messageBufferSize) {
        messages.shift();
      }
      
      io.sockets.emit('message.send', message);
    }

    let userLoginCB = (data, cb) => {
      let index = users.indexOf(user);
      if (index < 0) {
        user.username = escape(data.username).substring(0, usernameMaxLength);
        users.push(user);

        io.sockets.emit('user.login', user);
      }
      
      cb(user);
    }

    let userListCB = (data, cb) => {
      cb(users);
    }

    let userLogoutCB = (data) => {
      let index = users.indexOf(user);
      users.splice(index, 1);

      debug('Disconnected', user);
      io.sockets.emit('user.logout', user);
    }

    socket.on('message.send', messageCB);
    socket.on('message.history', messageHistoryCB);
    socket.on('user.list', userListCB);
    socket.on('user.login', userLoginCB);
    socket.on('user.logout', userLogoutCB);
    socket.on('disconnect', userLogoutCB);
  
}