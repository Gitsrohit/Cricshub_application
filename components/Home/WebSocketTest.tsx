import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import SockJS from 'sockjs-client';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import 'react-native-url-polyfill/auto';

const WebSocketTest: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [received, setReceived] = useState<string>('');
  const stompClientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);

  useEffect(() => {
    const socket = new SockJS('http://34.47.150.57:8081/ws');

    const stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str: string) => console.log('[STOMP]', str),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('Connected ✅');

        subscriptionRef.current = stompClient.subscribe('/topic/messages', (msg: IMessage) => {
          setReceived(msg.body);
        });
      },
      onStompError: (frame) => {
        console.error('STOMP Error:', frame);
      },
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      stompClient.deactivate();
    };
  }, []);

  const sendMessage = () => {
    if (stompClientRef.current?.connected) {
      stompClientRef.current.publish({
        destination: '/app/sendMessage',
        body: message,
      });
      setMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>WebSocket Test</Text>
      <TextInput
        style={styles.input}
        placeholder="Type message"
        value={message}
        onChangeText={setMessage}
      />
      <Button title="Send" onPress={sendMessage} />
      <Text style={styles.label}>Server Response:</Text>
      <Text style={styles.response}>{received}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 60 },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  label: { fontWeight: 'bold', marginTop: 20 },
  response: { marginTop: 10, fontSize: 16, color: 'green' },
});

export default WebSocketTest;
