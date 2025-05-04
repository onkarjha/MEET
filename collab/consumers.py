import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = "chatroom"  # Optional: make dynamic based on URL or query param
        self.room_group_name = f"chat_{self.room_name}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        print(f"🟢 {self.channel_name} connected to {self.room_group_name}")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        print(f"🔴 {self.channel_name} disconnected")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            shape = data.get('shape')
            message = data.get('message')
            signal = data.get('signal')  # Optional field
            sender_channel = self.channel_name

            if not shape or not message:
                print("⚠️ Missing shape or message in received data")
                return

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
                    'signal': signal,
                    'sender_channel': sender_channel,
                }
            )

        except json.JSONDecodeError as e:
            print("❌ JSON decode error:", e)
        except Exception as e:
            print("❌ Error in receive:", e)

    async def chat_message(self, event):
        if event['sender_channel'] == self.channel_name:
            return  # Don't echo to sender
        await self.send(text_data=json.dumps({
            'shape': event['shape'],
            'message': event['message']
        }))

    async def webrtc_signal(self, event):
        if event['sender_channel'] == self.channel_name:
            return  # Don't echo to sender
        await self.send(text_data=json.dumps({
            'shape': event['shape'],
            'message': event['message'],
            'signal': event.get('signal')
        }))
