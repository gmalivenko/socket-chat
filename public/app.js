Date.prototype.getFullMinutes = function () {
  if (this.getMinutes() < 10) {
    return '0' + this.getMinutes();
  }
  return this.getMinutes();
}

Date.prototype.getFullHours = function () {
  if (this.getHours() < 10) {
    return '0' + this.getHours();
  }
  return this.getHours();
}

Date.prototype.getFullSeconds = function () {
  if (this.getSeconds() < 10) {
    return '0' + this.getSeconds();
  }
  return this.getSeconds();
}

var getConvertedTime = function(datestring) {
  var date = new Date(datestring);
  return date.getFullHours() + ':' + date.getFullMinutes() + ':' + date.getFullSeconds();
}

var putMessage = function(msg) {
  var text =  '<strong>[' + getConvertedTime(msg.time) + '] ' + msg.user.username + ':</strong> ' + msg.message;
  $("<p></p>").addClass('message-item').html(text).appendTo('.chat-history');
  $('.chat-history').scrollTop($('.chat-history')[0].scrollHeight);
}

var addUser = function(user) {
  console.log('add user', user);
  var user = $('<p/>', {
    'class': 'user-item',
    'data-user': user.username,
    'text': user.username,
  });
 
  user.appendTo('.chat-online');

}

var delUser = function(user) {
  console.log('del user', user);
  $('.chat-online *[data-user="' + user.username + '"]').remove();
}

$(document).ready(function() {
  var socket = io.connect('http://192.168.1.15:8000');

  socket.on('connect', function (data) {

    socket.on('user.login', addUser);
    socket.on('user.logout', delUser);
    socket.on('message.send', putMessage);

    socket.emit('message.history', {}, function(messages) {
      $('.chat-history').html('');
      messages.forEach(putMessage);
    });

    socket.emit('user.list', {}, function(users) {
      $('.chat-online').html('');
      users.forEach(addUser);
    });

    $('#chat_sendBtn').click(function() {
      socket.emit('message.send', {
        message: $('#chat_line').val(),
      });
      $('#chat_line').val('');
    });

    $('#chat_line').keypress(function (e) {
      if (e.which == 13) {
        socket.emit('message.send', {
          message: $('#chat_line').val(),
        });
        $('#chat_line').val('');
        return false;
      }
    });

    $('#chat_logoutBtn').click(function() {
      socket.emit('user.logout', {});
      window.location.reload();
    });

    $('#loginModal').modal('show');

    $('#loginModal_loginBtn').click(function() {
      socket.emit('user.login', {
        username: $('#loginModal_username').val(),
      }, function(user) {
        console.log(user);

        $('#loginModal').modal('hide');
        $('.chat').show();

      });
    });

  });

});