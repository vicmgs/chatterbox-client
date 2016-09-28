var htmlEncode = function(value) {
  return $('<div/>').text(value).html();
};

// set universal on focus to be regular title
// on new messages, set some new messages var count
// if not on page, alert user with title
// once BACK on page after having unread messages, reset inactive page title to
  // be default

var app = {
  server: 'https://api.parse.com/1/classes/messages',
  users: {},
  lastMsg: '',
  appUsername: 'no one and everyone',
  friends: {},
  rooms: {'View all': true},
  activeRoom: 'View all',
  newMsgs: 0,
  titleTimer: null,

  init: function() {

    var context = this;
    $('.submit').on('click submit', this.handleSubmit.bind(this));

    $(window).focus(function() {
      context.newMsgs = 0;
      document.title = 'chatterbox';
      clearInterval(context.titleTimer);
      context.titleTimer = null;
    });

    this.refreshFeed();
    setInterval(this.refreshFeed.bind(this), 2000);

    this.renderRoom(this.activeRoom);
    $('.roomname').addClass('active-room');


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
    $(document.body).on('click', '.friendname', function() {
      $(this).remove();
      delete context.friends[$(this).text()];
      $(`[data-username='${$(this).text()}'].message`).removeClass('friend-message');
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
      data: {order: '-createdAt'},
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

    $('#roomSelect').append(`<div class='roomname' data-roomname='${room}'>${room}</div>`);
  },
  renderUser: function(username) {
    var $newUser = $(`<li class='username' data-username='${username}'>${username}</li>`);
    $newUser.prependTo('#userList');
  },
  handleUsernameClick: function(friend) {
    if (!this.friends[friend]) {
      $('#friends .people-list').append(`<li class='friendname'>${friend}</li>`);
      this.friends[friend] = true;
      $(`[data-username='${friend}'].message`).addClass('friend-message');
    }
  },
  handleRoomnameClick: function(room) {
    this.activeRoom = room;
    $('.active-room').removeClass('active-room');
    $(`[data-roomname='${room}'].roomname`).addClass('active-room');

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
    $('#message').val('');
  },
  handleNewRoom: function(roomname) {
    this.rooms[roomname] = true;
    this.renderRoom(roomname);
  },
  updateTitle: function() {
    var isShowingCount = false;
    if (!this.titleTimer) {
      this.titleTimer = setInterval( () => {
        if (isShowingCount) {
          document.title = 'chatterbox';
          isShowingCount = false;
        } else {
          document.title = `*${this.newMsgs} new messages*`;
          isShowingCount = true;
        }
      }, 500);
    }
  },
  refreshFeed: function() {
    this.fetch(function (data) {
      if (!this.lastMsg) {
        this.lastMsg = data.results[data.results.length - 1].objectId;
      }

      var newMessages = [];

      // Construct array of any new messages
      for (var datum of data.results) {
        if (datum.objectId === this.lastMsg) {
          this.lastMsg = data.results[0].objectId;
          break;
        }

        newMessages.push(datum);
      }

      // Flash document title (or not) based on whether window is focused
      // and number of new messages
      if (newMessages.length) {
        this.newMsgs += newMessages.length;
        if (!document.hasFocus()) {
          this.updateTitle();
        } else {
          this.newMsgs = 0;
        }
      }


      // Update the UI, based on every new message
      this.updateDisplay(newMessages);

    }.bind(this));
  },
  updateDisplay: function(newMessages) {
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
  }
};

$(document).ready(function() {
  app.init();
});
