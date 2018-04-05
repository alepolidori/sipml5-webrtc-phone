var webrtcPhone = (function () {

  var server,
      wssAddress,
      name,
      exten,
      impi,
      impu,
      audioId,
      localVideoId,
      remoteVideoId,
      sipStack,
      callSession,
      registerSession;

  var ringing = new Audio('sounds/ringing.mp3');
  var calling = new Audio('sounds/calling.mp3');
  ringing.loop = true;
  calling.loop = true;

  function init(data) {
    if (!SIPml.isInitialized()) {
      server = data.server;
      name = data.name;
      exten = data.exten;
      password = data.password;
      impi = exten;
      impu = 'sip:' + exten + '@' + server;
      wssAddress = 'wss://' + server + ':8089/ws';
      audioId = data.audioId;
      localVideoId = data.localVideoId;
      remoteVideoId = data.remoteVideoId;
      remoteVideo = document.getElementById(remoteVideoId);
      SIPml.init(engineReadyCb, engineErrorCb);
    }
  }

  function engineReadyCb(e) {
    createSipStack();
  }

  function engineErrorCb(e) {
    console.log(e);
  }

  function sipEventsListener (e) {
    console.log('- sip event: ' + e.type);
    if (e.type === 'started') {
      login();
    }
    else if (e.type === 'i_new_call') {
      ringing.play();
      callSession = e.newSession;
      callSession.setConfiguration({
        video_local: document.getElementById(localVideoId),
        video_remote: document.getElementById(remoteVideoId),
        audio_remote: document.getElementById(audioId),
        events_listener: {
          events: '*',
          listener: callEventsListener
        }
      });
    }
  }

  function createSipStack() {
    sipStack = new SIPml.Stack({
      realm: server,
      impi: impi,
      impu: impu,
      password: password,
      display_name: name,
      enable_rtcweb_breaker: false,
      websocket_proxy_url: wssAddress,
      events_listener: {
        events: '*',
        listener: sipEventsListener
      },
      sip_headers: [
        { name: 'User-Agent', value: 'WebRTC-Phone sipML' }
      ]
    });
    sipStack.start();
  }

  function registerEventsListener (e) {
    console.log('- register session event: ' + e.type);
  }

  function login() {
    registerSession = sipStack.newSession('register', {
      events_listener: {
        events: '*',
        listener: registerEventsListener
      }
    });
    registerSession.register();
  }

  function logout() {
    registerSession.unregister();
  }

  function callEventsListener (e) {
    console.log('- call session event: ' + e.type);
    if (e.type === 'terminating' ||
      e.type === 'terminated' ||
      e.type === 'connected') {

      ringing.pause();
      calling.pause();
    }
  }

  function call(to) {
    callSession = sipStack.newSession('call-audio', {
      audio_remote: document.getElementById(audioId),
      events_listener: {
        events: '*',
        listener: callEventsListener
      }
    });
    callSession.call('sip:' + to + '@' + server);
    calling.play();
  }

  function callAudioVideo(to) {
    callSession = sipStack.newSession('call-audiovideo', {
      video_local: document.getElementById(localVideoId),
      video_remote: document.getElementById(remoteVideoId),
      audio_remote: document.getElementById(audioId),
      events_listener: {
        events: '*',
        listener: callEventsListener
      }
    });
    callSession.call('sip:' + to + '@' + server);
    calling.play();
  }

  function answer(e) {
    callSession.accept();
  }

  function hangup(e) {
    callSession.reject();
  }

  function stopStack(e) {
    if (sipStack) {
      sipStack.stop();
      sipStack = null;
      callSession = null;
    }
  }

  return {
    init: init,
    call: call,
    login: login,
    logout: logout,
    answer: answer,
    hangup: hangup,
    stopStack: stopStack,
    callAudioVideo: callAudioVideo
  };

})();