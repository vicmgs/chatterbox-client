var app = {
  server: 'https://api.parse.com/1/classes/messages',
  init: function() {

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
  fetch: function() {
    $.ajax({
      url: this.server,
      type: 'GET',
      success: function (data) {
        console.log('chatterbox: Message received', data);
      },
      error: function (data) {
        console.error('chatterbox: Failed to receive message', data);
      }
    });
  },
  clearMessages: function() {
    $('#chats').html('');
  },
  renderMessage: function(message) {
    $('#chats').append(`<p>${message.text}</p>`);
  },
  renderRoom: function(room) {
    $('#roomSelect').append(`<h1>${room}</h1>`);
  }
};
