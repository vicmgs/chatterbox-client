var htmlEncode = function(value) {
  return $('<div/>').text(value).html();
};

var app = {
  server: 'https://api.parse.com/1/classes/messages',
  users: {},
  lastMsg: '',
  appUsername: 'no one and everyone',
  friends: {},

  init: function() {
    $('.submit').on('click submit', this.handleSubmit.bind(this));

    this.refreshFeed();
    setInterval(this.refreshFeed.bind(this), 2000);

    var context = this;
    $(document.body).on('click', '.username', function() {
      var username = $(this).data('username');
      context.handleUsernameClick(username);
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
    var className = 'message';
    if (this.friends[cleanUsername]) {
      className += ' friend-message';
    }
    var $newMessage = $(`<p><span class='${className}' data-username='${cleanUsername}'>${cleanUsername}: ${cleanMessageText} - ${message.createdAt}</span></p>`);
    $('#chats').prepend($newMessage);
  },
  renderRoom: function(room) {
    $('#roomSelect').append(`<h1>${room}</h1>`);
  },
  renderUser: function(username) {
    var $newUser = $(`<p class='username' data-username='${username}'>${username}</p>`);
    $newUser.prependTo('#userList');
  },
  handleUsernameClick: function(friend) {
    if (!this.friends[friend]) {
      $('#friends').append(`<h2>${friend}</h1>`);
      this.friends[friend] = true;
      // find all .username items where data-username=friend
      $('[data-username=harambe].message').addClass('friend-message');
    }
  },
  handleSubmit: function() {
    var message = {
      text: $('#message').val(),
      username: $('#myName').val(),
      roomname: ''
    };
    this.send(message);
    this.refreshFeed();

  },
  // loop through all .username items inside chat
  refreshFeed: function() {
    this.fetch(function (data) {

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

        this.renderMessage(datum);
        if (!(this.users[cleanUsername])) {
          this.users[cleanUsername] = true;
          this.renderUser(cleanUsername);
        }
      }

    }.bind(this));
  }
};

$(document).ready(function() {
  app.init();
});
