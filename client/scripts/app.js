var htmlEncode = function(value) {
  return $('<div/>').text(value).html();
};

var app = {
  server: 'https://api.parse.com/1/classes/messages',

  init: function() {
    $('.submit').on('click submit', this.handleSubmit.bind(this));

    this.fetch(function (data) {
      var users = {};
      data.results.forEach(function(datum) {
        this.renderMessage(datum);
        users[datum.username] = true;

      }.bind(this));

      // render each user
      for (var key in users) {
        this.renderUser(key);
      }
    }.bind(this));

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
    var $newMessage = $(`
      <p>
        <span class='username' data-username='${cleanUsername}:'>
        ${cleanUsername}: ${cleanMessageText}
        </span>
      </p>`);
    $('#chats').append($newMessage);
  },
  renderRoom: function(room) {
    $('#roomSelect').append(`<h1>${room}</h1>`);
  },
  renderUser: function(username) {
    var $newUser = $(`<p class='username' data-username='${username}'>${username}</p>`);
    $newUser.appendTo('#userList');
  },
  handleUsernameClick: function(friend) {
    $('#friends').append(`<h2>${friend}</h1>`);
  },
  handleSubmit: function() {
    var message = {
      text: $('#message').val(),
      username: $.url().param('username'),
      roomname: ''
    };
    this.send(message);

  }
};

$(document).ready(function() {
  app.init();
});
