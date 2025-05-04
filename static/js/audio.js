const wsProtocol = location.protocol === "https:" ? "wss://" : "ws://";
const chatSocket = new WebSocket(`${wsProtocol}${location.host}/ws/chat/`);

let localStream = null;
const peerConnections = {}; // key: sender ID, value: RTCPeerConnection
const pendingCandidates = {};

async function setupLocalMedia() {
  if (localStream) return localStream;
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    const myVideo = document.createElement("video");
    myVideo.srcObject = localStream;
    myVideo.autoplay = true;
    myVideo.muted = true;
    document.getElementById("myid").appendChild(myVideo);
    return localStream;
  } catch (e) {
    console.error("Error accessing media:", e);
    alert("Cannot access camera/mic.");
  }
}

function createPeerConnection(peerId) {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  });

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      sendMessage({
        shape: "candidate",
        message: {
          sender: myId,
          target: peerId,
          message: event.candidate,
          collab_id: $(".collab_id").text(),
        }
      });
    }
  };

  pc.ontrack = (event) => {
    let video = document.getElementById(`video_${peerId}`);
    if (!video) {
      video = document.createElement("video");
      video.id = `video_${peerId}`;
      video.autoplay = true;
      document.getElementById("remote_videos").appendChild(video);
    }
    video.srcObject = event.streams[0];
  };

  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
  return pc;
}

async function broadcast() {
  await setupLocalMedia();
  sendMessage({ shape: "join", message: { sender: myId, collab_id: $(".collab_id").text(), } });
}

chatSocket.onmessage = async (e) => {
  const data = JSON.parse(e.data);
  const { shape, message } = data;

  const sender = message.sender;
  const target = message.target;
//message.collab_id === collab_id
console.log("received : "+message.collab_id);
console.log("my collab : "+collab_id);
  if (sender === myId) return;

  if (shape === "join") {
    const pc = createPeerConnection(sender);
    peerConnections[sender] = pc;

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    sendMessage({
      shape: "rtc-offer",
      message: {
        sender: myId,
        target: sender,
        message: offer,
        collab_id: $(".collab_id").text(),
      }
    });
  }

  else if (shape === "rtc-offer") {
    await setupLocalMedia();
    const pc = createPeerConnection(sender);
    peerConnections[sender] = pc;

    await pc.setRemoteDescription(new RTCSessionDescription(message.message));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    sendMessage({
      shape: "rtc-answer",
      message: {
        sender: myId,
        target: sender,
        message: answer,
        collab_id: $(".collab_id").text(),
      }
    });
  }

  else if (shape === "rtc-answer") {
    const pc = peerConnections[sender];
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(message.message));
    }
  }

  else if (shape === "candidate") {
    const pc = peerConnections[sender];
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(message.message));
    } else {
      if (!pendingCandidates[sender]) pendingCandidates[sender] = [];
      pendingCandidates[sender].push(message.message);
    }
  }
  else if (shape === "message"){
    showAlert("[" + data.message.sender_name + "] " + data.message.message);
                $(".message_num").text(parseInt($(".message_num").text()) + 1);
                init_0("message_num");
                $(".chatbox-body").append(' <div class="received_message"><p class="messager_name">' + data.message.sender_name + '</p><p class="message">' + data.message.message + '</p></div>');
                $(".chatbox-body").scrollTop($(".chatbox-body")[0].scrollHeight);
  }
  else {
    handleShapeData(data);
  }
};

function sendMessage(data) {
  chatSocket.send(JSON.stringify(data));
}

const myId = Math.floor(Math.random() * 100000).toString(); // use UUID or auth ID in real case
