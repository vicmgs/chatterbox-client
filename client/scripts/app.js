var htmlEncode = function(value) {
  return $('<div/>').text(value).html();
};

var app = {
  server: 'https://api.parse.com/1/classes/messages',
  users: {},
  lastMsg: '',

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
    var $newMessage = $(`<p><span class='username' data-username='${cleanUsername}:'>${cleanUsername}: ${cleanMessageText} - ${message.createdAt}</span></p>`);
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
    $('#friends').append(`<h2>${friend}</h1>`);
  },
  handleSubmit: function() {
    var message = {
      text: $('#message').val(),
      username: 'anne, probably',
      roomname: ''
    };
    this.send(message);
    this.refreshFeed();

  },
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

        this.renderMessage(datum);
        if (!(this.users[datum.username])) {
          this.users[datum.username] = true;
          this.renderUser(datum.username);
        }
      }

    }.bind(this));
  }
};

$(document).ready(function() {
  app.init();
});
