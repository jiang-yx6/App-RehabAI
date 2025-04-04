import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const ChatHistory = ({ messages }) => {
  return (
    <ScrollView 
      style={styles.historyContainer}
      ref={ref => {
        if (ref) {
          ref.scrollToEnd({ animated: true });
        }
      }}
    >
      {messages.map((msg, index) => (
        <View 
          key={index} 
          style={[
            styles.messageContainer,
            msg.isBot ? styles.botMessage : styles.userMessage
          ]}
        >
          <View style={styles.messageContent}>
            <Text style={styles.messageText}>{msg.text}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  historyContainer: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  messageContainer: {
    marginVertical: 10,
    maxWidth: '80%',
    backgroundColor: '#fff',
  },
  messageContent: {
    padding: 12,
    borderRadius: 15,
  },
  botMessage: {
    alignSelf: 'flex-start',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
});

export default ChatHistory; 