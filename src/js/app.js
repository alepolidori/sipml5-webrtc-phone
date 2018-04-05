$(function () {

  $('#init-btn').click(function () {
    webrtcPhone.init({
      server: $('#server-address').val(),
      name: $('#name').val(),
      exten: $('#exten').val(),
      password: $('#password').val(),
      audioId: 'remote-stream-audio',
      localVideoId: 'local-stream-video',
      remoteVideoId: 'remote-stream-video'
    });
  });

  $('#login-btn').click(function () {
    webrtcPhone.login();
  });

  $('#logout-btn').click(function () {
    webrtcPhone.logout();
  });

  $('#call-btn').click(function () {
    var to = $('#call-to').val();
    webrtcPhone.call(to);
  });

  $('#call-video-btn').click(function () {
    var to = $('#call-video-to').val();
    webrtcPhone.callAudioVideo(to);
  });

  $('#answer-btn').click(function () {
    webrtcPhone.answer();
  });

  $('#hangup-btn').click(function () {
    webrtcPhone.hangup();
  });

  // $('#init-btn').click();
  
});