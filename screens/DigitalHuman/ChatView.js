"use client"

import { useState, useRef, useEffect } from "react"
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Animated,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native"
import Microphone from "./Microphone"
import Icon from "react-native-vector-icons/Ionicons"

const { height } = Dimensions.get("window")

const ChatView = ({ sessionId, isConnected, audioStream }) => {
  const [input, setInput] = useState("") // 输入框内容
  const [messages, setMessages] = useState([]) // 聊天内容
  const [isLoading, setIsLoading] = useState(false) // 是否正在加载
  const [isExpanded, setIsExpanded] = useState(false) // 聊天内容是否展开
  const [micStatus, setMicStatus] = useState("")
  const [showMicStatus, setShowMicStatus] = useState(false)
  const statusOpacity = useRef(new Animated.Value(0)).current
  const scrollViewRef = useRef(null) // 确保使用 null 初始化
  const inputRef = useRef(null)

  useEffect(() => {
    if (audioStream) {
      console.log("Audio stream available in ChatView")

      // You can create an audio element for web if needed
      if (Platform.OS === "web") {
        const audioElement = new Audio()
        audioElement.srcObject = audioStream
        audioElement.play().catch((e) => console.error("Error playing audio:", e))
      }

      // For native platforms, the audio should play automatically
      // through the RTCPeerConnection
    }
  }, [audioStream])

  const handleSendMessage = async () => {
    if (input.trim() === "") return

    const userMessage = {
      id: Date.now(),
      text: input,
      isUser: true,
    }

    setMessages([...messages, userMessage])
    setInput("")
    setIsLoading(true)
    console.log("发送给服务器的文本：", input.trim())
    const response = await fetch("http://10.3.242.26:8010/human", {
      body: JSON.stringify({
        text: input.trim(),
        type: "chat",
        interrupt: true,
        sessionid: sessionId,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    })

    const data = await response.json()
    if (data.llm_response) {
      console.log("AI响应")
      const aiResponse = {
        id: Date.now() + 1,
        text: data.llm_response,
        isUser: false,
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)
    } else {
      const aiResponse = {
        id: Date.now() + 1,
        text: "抱歉，我无法理解您的问题。",
        isUser: false,
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)
    }
  }

  const handleVoiceInput = (result) => {
    setInput(result)
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const showStatusMessage = (status, isLoading) => {
    setMicStatus(isLoading ? `${status}...` : status)
    setShowMicStatus(true)

    // 重置透明度并开始显示动画
    statusOpacity.setValue(1)

    // 3秒后开始淡出动画
    setTimeout(() => {
      Animated.timing(statusOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setShowMicStatus(false))
    }, 1500)
  }

  // 监听键盘事件
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      // 键盘显示时，确保滚动到底部
      scrollViewRef.current?.scrollToEnd({ animated: true })
    })

    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      // 键盘隐藏时，确保滚动到底部
      scrollViewRef.current?.scrollToEnd({ animated: true })
      // 键盘隐藏时，让输入框失去焦点
      inputRef.current?.blur()
    })

    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [])

  return (
    <KeyboardAvoidingView style={styles.keyboardAvoidingView} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={[styles.chatContainer, isExpanded ? styles.chatContainerExpanded : null]}>
        {showMicStatus && (
          <Animated.View style={[styles.statusOverlay, { opacity: statusOpacity }]}>
            <Text style={styles.statusText}>{micStatus}</Text>
          </Animated.View>
        )}

        {/* 展开菜单 */}
        <TouchableOpacity style={styles.expandButton} onPress={toggleExpand}>
          <Icon name={isExpanded ? "chevron-down" : "chevron-up"} size={20} color="#3b82f6" />
        </TouchableOpacity>

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="always"
        >
          {messages.map((message) => (
            <View key={message.id} style={[styles.messageBubble, message.isUser ? styles.userBubble : styles.aiBubble]}>
              <Text style={message.isUser ? styles.userMessageText : styles.aiMessageText}>{message.text}</Text>
            </View>
          ))}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={styles.loadingText}>AI思考中...</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="请输入您的问题..."
            placeholderTextColor="#a0aec0"
          />
          <Microphone handleVoiceInput={handleVoiceInput} onStatusChange={showStatusMessage} />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage} disabled={input.trim() === ""}>
            <Icon name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  chatContainer: {
    position: "absolute",
    maxHeight: height * 0.2,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  chatContainerExpanded: {
    maxHeight: height * 0.5,
  },
  expandButton: {
    position: "absolute",
    top: -5,
    alignSelf: "center",
    padding: 2,
    marginBottom: 2,
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 8,
  },
  messagesContent: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 18,
    marginVertical: 5,
  },
  userBubble: {
    backgroundColor: "#3b82f6",
    alignSelf: "flex-end",
    borderTopRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: "#e2e8f0",
    alignSelf: "flex-start",
    borderTopLeftRadius: 4,
  },
  userMessageText: {
    fontSize: 14,
    color: "white",
  },
  aiMessageText: {
    fontSize: 14,
    color: "#334155",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#e2e8f0",
    padding: 10,
    borderRadius: 18,
    marginVertical: 5,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 12,
    color: "#64748b",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 1000001, // 确保输入框在最上层
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 10,
    color: "#334155",
  },
  voiceButton: {
    marginHorizontal: 5,
    padding: 8,
  },
  sendButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 10,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  statusOverlay: {
    position: "absolute",
    top: 10,
    left: "50%",
    transform: [{ translateX: -100 }],
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    padding: 10,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1000,
    width: 200,
    justifyContent: "center",
  },
  statusText: {
    color: "#fff",
    marginRight: 8,
    fontSize: 14,
  },
})

export default ChatView
