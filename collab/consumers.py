import json
from channels.generic.websocket import AsyncWebsocketConsumer

ROOM_USERS = {}  # room_name: {channel_name: user_id}

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f"chat_{self.room_name}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        print(f"🟢 {self.channel_name} connected to {self.room_group_name}")

    async def disconnect(self, close_code):
        # Remove user from ROOM_USERS
        users = ROOM_USERS.get(self.room_name, {})
        user_id = users.pop(self.channel_name, None)
        if user_id:
            # Notify others that user left
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'shape': 'user_left',
                    'message': {'sender': user_id}
                }
            )
        if not users:
            ROOM_USERS.pop(self.room_name, None)
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        print(f"🔴 {self.channel_name} disconnected")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            shape = data.get('shape')
            message = data.get('message')
            sender_channel = self.channel_name

            if shape == "join":
                # Register user in ROOM_USERS
                user_id = message.get("sender")
                users = ROOM_USERS.setdefault(self.room_name, {})
                users[self.channel_name] = user_id

                # Send current user list to the joining user
                await self.send(text_data=json.dumps({
                    'shape': 'user_list',
                    'message': {'users': list(users.values())}
                }))

                # Notify others about the new user
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'shape': 'join',
                        'message': {'sender': user_id}
                    }
                )
                return

            # Forward other signaling messages
            event_type = (
                'webrtc_signal'
                if shape in ['rtc-offer', 'rtc-answer', 'candidate']
                else 'chat_message'
            )

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': event_type,
                    'shape': shape,
                    'message': message,
                    'sender_channel': sender_channel,
                }
            )

        except Exception as e:
            print("❌ Error in receive:", e)

    async def chat_message(self, event):
        if event.get('sender_channel') == self.channel_name:
            return  # Don't echo to sender
        await self.send(text_data=json.dumps({
            'shape': event['shape'],
            'message': event['message']
        }))

    async def webrtc_signal(self, event):
        # Only send to the intended target
        target = event['message'].get('target')
        users = ROOM_USERS.get(self.room_name, {})
        for channel, user_id in users.items():
            if user_id == target and channel != self.channel_name:
                await self.channel_layer.send(channel, {
                    "type": "forward_signal",
                    "shape": event['shape'],
                    "message": event['message']
                })

    async def forward_signal(self, event):
        await self.send(text_data=json.dumps({
            'shape': event['shape'],
            'message': event['message']
        }))
