const setAVelms = (call, localV, remoteV, remoteA) => {
  var localVideo = document.getElementById('local')
  var remoteVideo = document.getElementById('remoteVideo')
  var remoteAudio = document.getElementById('remoteAudio')
  call.setLocalVideoElement(localVideo)
  call.setRemoteVideoElement(remoteVideo)
  call.setRemoteAudioElement(remoteAudio)
}
const callListerner = (call) => {
  let lastError = "";
  call.on("hangup", function () {
    document.getElementById("result").innerHTML = (
      "<p>Call ended. Last error: " + lastError + "</p>"
    );
  });
  call.on("send_event_error", function (err) {
    console.error(err);
    document.getElementById("result").innerHTML = (
      "<p>Call ended. Last error: " + err + "</p>"
    );
  });
  call.on("error", function (err) {
    lastError = err.message;
    console.log(err)
    document.getElementById("result").innerHTML = (
      "<p>Call ended. Last error: " + lastError + "</p>"
    );
    call.hangup();
  });
}
export default {
  setAVelms, callListerner
}