const wsProtocol = location.protocol === "https:" ? "wss://" : "ws://";
const roomName = $(".collab_id").text();
const chatSocket = new WebSocket(`${wsProtocol}${location.host}/ws/chat/${roomName}/`);

let localStream = null;
const peerConnections = {};
const pendingCandidates = {};

const myId = Math.floor((Math.random() * 1000000) + 1);


async function setupLocalMedia() {
   if (localStream) return localStream;
   try {
      localStream = await navigator.mediaDevices.getUserMedia({
         audio: true,
         video: true
      });
      const myVideo = document.createElement("video");
      myVideo.srcObject = localStream;
      myVideo.autoplay = true;
      myVideo.muted = true;
      myVideo.className = "onkar_user_video";
      document.getElementById("myid").appendChild(myVideo);
      return localStream;
   } catch (e) {
      console.error("Error accessing media:", e);
      alert("Cannot access camera/mic.");
   }
}

function createPeerConnection(peerId) {
   const pc = new RTCPeerConnection({
      iceServers: [{
         urls: "stun:stun.l.google.com:19302"
      }]
   });

   localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

   pc.onicecandidate = (event) => {
      if (event.candidate) {
         sendMessage({
            shape: "candidate",
            message: {
               sender: myId,
               target: peerId,
               candidate: event.candidate,
               collab_id: roomName,
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
         video.className = "onkar_user_video";
         const wrapper = document.createElement("div");
         wrapper.className = "onkar_user_video_container";
         wrapper.appendChild(video);
         document.getElementById("remote_videos").appendChild(wrapper);
      }
      video.srcObject = event.streams[0];
   };

   if (pendingCandidates[peerId]) {
      pendingCandidates[peerId].forEach(candidate => {
         pc.addIceCandidate(new RTCIceCandidate(candidate));
      });
      delete pendingCandidates[peerId];
   }

   return pc;
}

function sendMessage(data) {
   chatSocket.send(JSON.stringify(data));
}

async function broadcast() {
   await setupLocalMedia();
   sendMessage({
      shape: "join",
      message: {
         sender: myId,
         collab_id: roomName,
      }
   });
}

chatSocket.onmessage = async (e) => {
   const data = JSON.parse(e.data);
   const {
      shape,
      message
   } = data;
   const sender = message.sender;
   const target = message.target;

   if (sender === myId) return;

   if (shape === "user_list") {

      await setupLocalMedia();
      message.users.forEach(async peerId => {
         if (peerId !== myId && !peerConnections[peerId]) {
            const pc = createPeerConnection(peerId);
            peerConnections[peerId] = pc;

            if (myId > peerId) {
               const offer = await pc.createOffer();
               await pc.setLocalDescription(offer);
               sendMessage({
                  shape: "rtc-offer",
                  message: {
                     sender: myId,
                     target: peerId,
                     offer: offer,
                     collab_id: roomName,
                  }
               });
            }
         }
      });
   } else if (shape === "join") {

      await setupLocalMedia();
      const peerId = sender;
      if (!peerConnections[peerId]) {
         const pc = createPeerConnection(peerId);
         peerConnections[peerId] = pc;

         if (myId > peerId) {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            sendMessage({
               shape: "rtc-offer",
               message: {
                  sender: myId,
                  target: peerId,
                  offer: offer,
                  collab_id: roomName,
               }
            });
         }
      }
   } else if (shape === "rtc-offer") {
      await setupLocalMedia();
      let pc = peerConnections[sender];
      if (!pc) {
         pc = createPeerConnection(sender);
         peerConnections[sender] = pc;
      }
      await pc.setRemoteDescription(new RTCSessionDescription(message.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendMessage({
         shape: "rtc-answer",
         message: {
            sender: myId,
            target: sender,
            answer: answer,
            collab_id: roomName,
         }
      });
   } else if (shape === "rtc-answer") {
      const pc = peerConnections[sender];
      if (pc) {
         await pc.setRemoteDescription(new RTCSessionDescription(message.answer));
      }
   } else if (shape === "candidate") {
      const pc = peerConnections[sender];
      if (pc) {
         await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
      } else {
         if (!pendingCandidates[sender]) pendingCandidates[sender] = [];
         pendingCandidates[sender].push(message.candidate);
      }
   } else if (shape === "user_left") {

      const peerId = sender;
      if (peerConnections[peerId]) {
         peerConnections[peerId].close();
         delete peerConnections[peerId];
      }
      const video = document.getElementById(`video_${peerId}`);
      if (video) video.remove();
   } else if (shape === "message") {
      showAlert(`[${data.message.sender_name}] ${data.message.message}`);
      $(".message_num").text(parseInt($(".message_num").text()) + 1);
      init_0("message_num");
      $(".chatbox-body").append(`<div class="received_message"><p class="messager_name">${data.message.sender_name}</p><p class="message">${data.message.message}</p></div>`);
      $(".chatbox-body").scrollTop($(".chatbox-body")[0].scrollHeight);
   } else {
      console.log("Unhandled shape:", shape);
      handleShapeData(data);
   }
};

function toggleMic() {
   if (!localStream) return;
   const audioTrack = localStream.getAudioTracks()[0];
   if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      if (audioTrack.enabled) {
         $(".mic_off").css({
            "background": "#000"
         });
         console.log("Mic On!");
      } else {
         $(".mic_off").css({
            "background": "red"
         });
         console.log("Mic Off!");
      }
   }
}

function toggleCamera() {
   if (!localStream) return;
   const videoTrack = localStream.getVideoTracks()[0];
   if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      if (videoTrack.enabled) {
         $(".video_off").css({
            "background": "#000"
         });
      } else {
         $(".video_off").css({
            "background": "red"
         });
      }
      //videoTrack.enabledapplication ?
      //  $(".video_off").css({"background":"#000"}) : $(".video_off").css({"background":"red"});
   }
}

function getCookie(name) {
   let cookieValue = null;
   if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
         const cookie = cookies[i].trim();
         if (cookie.substring(0, name.length + 1) === name + "=") {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            break;
         }
      }
   }
   return cookieValue;
}
setInterval(() => {

   const containers = document.querySelectorAll('.onkar_user_video_container');

   const vids = document.querySelectorAll('.remote_videos');
   vids.forEach(vid => {
      $(".part").text(vid.children.length);
      vid.children.length;
   });
   containers.forEach(container => {

      if (container.children.length === 0) {
         container.remove();
      }
   });
}, 10000);
