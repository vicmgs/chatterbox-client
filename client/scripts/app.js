var htmlEncode = function(value) {
  return $('<div/>').text(value).html();
};

var app = {
  server: 'https://api.parse.com/1/classes/messages',
  users: {},
  lastMsg: '',
  appUsername: 'no one and everyone',
  friends: {},
  rooms: {'View all': true},
  activeRoom: 'View all',

  init: function() {
    $('.submit').on('click submit', this.handleSubmit.bind(this));

    this.refreshFeed();
    setInterval(this.refreshFeed.bind(this), 2000);

    this.renderRoom(this.activeRoom);

    var context = this;
    $(document.body).on('click', '.username', function() {
      var username = $(this).data('username');
      context.handleUsernameClick(username);
    });
    $(document.body).on('click', '.roomname', function() {
      var roomname = $(this).data('roomname');
      context.handleRoomnameClick(roomname);
    });
    $(document.body).on('click', '.addRoom', function() {
      var roomname = $('#newRoom').val();
      context.handleNewRoom(roomname);
    });
  },
  send: function(message) {
    $.ajax({
      url: this.server,
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent');
      },
      error: function (data) {
        console.error('chatterbox: Failed to send message', data);
      }
    });
  },
  fetch: function(callback) {
    $.ajax({
      url: this.server,
      type: 'GET',
      success: callback,
      error: callback
    });
  },
  clearMessages: function() {
    $('#chats').html('');
  },
  renderMessage: function(message) {
    var cleanMessageText = htmlEncode(message.text);
    var cleanUsername = htmlEncode(message.username);
    var cleanRoomname = htmlEncode(message.roomname);
    var className = 'message';
    if (this.friends[cleanUsername]) {
      className += ' friend-message';
    }
    var $newMessage = $(`<p><span class='${className}' data-roomname='${cleanRoomname}' data-username='${cleanUsername}'>${cleanUsername}: ${cleanMessageText}</span></p>`);
    $('#chats').prepend($newMessage);
  },
  renderRoom: function(room) {

    $('#roomSelect').append(`<span class='roomname' data-roomname='${room}'>${room}    </span>`);
  },
  renderUser: function(username) {
    var $newUser = $(`<span class='username' data-username='${username}'>${username}    </span>`);
    $newUser.prependTo('#userList');
  },
  handleUsernameClick: function(friend) {
    if (!this.friends[friend]) {
      $('#friends').append(`<h2>${friend}</h1>`);
      this.friends[friend] = true;
      $(`[data-username='${friend}'].message`).addClass('friend-message');
    }
  },
  handleRoomnameClick: function(room) {
    this.activeRoom = room;

    var context = this;
    $('.message').each(function() {
      var $message = $(this);
      $message.removeClass('hidden-message');
      if (context.activeRoom !== 'View all' && context.activeRoom !== $message.data('roomname')) {
        $message.addClass('hidden-message');
      }
    });
  },
  handleSubmit: function() {
    var message = {
      text: $('#message').val(),
      username: $('#myName').val(),
      roomname: this.activeRoom
    };
    this.send(message);
    this.refreshFeed();

  },
  handleNewRoom: function(roomname) {
    this.rooms[roomname] = true;
    this.renderRoom(roomname);
  },
  refreshFeed: function() {
    this.fetch(function (data) {
      console.log(data);
      if (!this.lastMsg) {
        this.lastMsg = data.results[data.results.length - 1].objectId;
      }

      var newMessages = [];

      for (var datum of data.results) {
        if (datum.objectId === this.lastMsg) {
          this.lastMsg = data.results[0].objectId;
          break;
        }

        newMessages.push(datum);
      }


      for (var i = newMessages.length - 1; i >= 0; i--) {
        var datum = newMessages[i];
        var cleanUsername = htmlEncode(datum.username);
        var cleanRoomname = htmlEncode(datum.roomname);

        if (this.activeRoom === 'View all' || this.activeRoom === cleanRoomname) {
          this.renderMessage(datum);
        }

        if (!(this.users[cleanUsername])) {
          this.users[cleanUsername] = true;
          this.renderUser(cleanUsername);
        }
        if (!(this.rooms[cleanRoomname])) {
          this.rooms[cleanRoomname] = true;
          this.renderRoom(cleanRoomname);
        }
      }

    }.bind(this));
  }
};

$(document).ready(function() {
  app.init();
});
