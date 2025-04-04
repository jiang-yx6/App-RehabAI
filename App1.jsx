import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Text } from 'react-native';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatInput from './components/ChatInput';
import ChatHistory from './components/ChatHistory';
import Myheader from './myconponents/MyHeader';
import MySideBar from './myconponents/MySideBar';
import MyChatHistory from './myconponents/MyChatHistory';
import MyChatInput from './myconponents/MyChatInput';

const App = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [messages, setMessages] = useState([
    { text: '你好，用户6985！', isBot: true },
    { text: '我是Lumo，你的语音绘图助手', isBot: true },
    { text: '有什么我可以帮助你的吗？请随时提问。', isBot: true },
  ]);

  const handleSendMessage = (newMessage) => {
    setMessages([...messages, newMessage]);
    
    setTimeout(() => {
      const botResponse = {
        text: '我收到了你的消息，正在处理中...',
        isBot: true
      };
      setMessages(prevMessages => [...prevMessages, botResponse]);
    }, 1000);
  };

  return (
    // <View>
    //   <View style={mystyles.header}>
    //     <TouchableOpacity
    //       style={mystyles.menuButton}
    //       onPress={() => setIsSidebarVisible(!isSidebarVisible)}>
    //       <Text style={mystyles.menuIcon}>☰</Text>
    //     </TouchableOpacity>
    //     <Myheader/>
    //   </View>
    //   <View style={mystyles.content}>
    //       <MySideBar isSidebarVisible={isSidebarVisible}/>
    //       <View style={[mystyles.mainContent, 
    //         {marginLeft:isSidebarVisible ? 250 : 0}]}>
    //         <MyChatHistory/>
    //         <MyChatInput/>
    //       </View>
    //   </View>
    // </View>

    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setIsSidebarVisible(!isSidebarVisible)}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Header />
      </View>
      
      <View style={styles.content}>
        <Sidebar visible={isSidebarVisible} />
        <View style={[
          styles.mainContent,
          { marginLeft: isSidebarVisible ? 250 : 0 }
        ]}>
          <ChatHistory messages={messages} />
          <ChatInput onSendMessage={handleSendMessage} />
        </View>
      </View>
    </View>
  );
};

const mystyles = StyleSheet.create({
  menuButton:{
    margin: 10,
    marginLeft: 20,
  },
 
  menuIcon:{
    fontSize: 40,
  },

  header:{
    flexDirection:'row',
    backgroundColor: '#F5FCFF',
  },

  content:{
    flex: 1,
    flexDirection: 'row',
  },

  mainContent:{
    flex: 1,
    transition: 'margin-left 0.8s',
  }
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  menuButton: {
    padding: 10,
  },
  menuIcon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
    transition: 'margin-left 0.3s',
  },
});

export default App;
