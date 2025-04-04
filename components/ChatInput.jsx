import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

const ChatInput = ({onSendMessage}) => {
  const [message, setMessage] = useState('');


  const sendMessage = () => {
    if (message.trim()) {
      console.log('发送消息:', message);
      // 创建一个新的消息对象
      const newMessage = {
        text: message,
        isBot: false,
      };
      onSendMessage(newMessage);
      setMessage('');
      // TODO: 将消息添加到聊天历史记录中
      // 这里需要通过props或context来更新父组件的状态
      
      // TODO: 调用API发送消息到后端
      // 这里需要添加与后端的通信逻辑     
    }
  };

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        value={message}
        onChangeText={setMessage}
        placeholder="输入消息..."
        multiline
        maxLength={500}
      />
      <TouchableOpacity 
        style={[
          styles.sendButton,
          !message.trim() && styles.sendButtonDisabled
        ]}
        onPress={sendMessage}
        disabled={!message.trim()}
      >
        <Text style={styles.sendButtonText}>发送</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#1890ff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ChatInput; 