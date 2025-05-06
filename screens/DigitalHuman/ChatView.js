"use client"

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react"
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
  Keyboard,
} from "react-native"
import Microphone from "./Microphone"
import Icon from "react-native-vector-icons/Ionicons"
import TypingIndicator from "../utils/TypingIndicator"
const { width, height } = Dimensions.get("window")

const ChatView = forwardRef(({ sessionId, isConnected, audioStream }, ref) => {
  const [input, setInput] = useState("") // 输入框内容
  const [messages, setMessages] = useState([
    // {
    //   id: 1,
    //   text: "你好，我是小明，很高兴认识你。",
    //   isUser: false,
    // },
    // {
    //   id: 2,
    //   text: "你好，我是小明，很高兴认识你。",
    //   isUser: true,
    // },
  ]) // 聊天内容
  const [isLoading, setIsLoading] = useState(false) // 是否正在加载
  const [isExpanded, setIsExpanded] = useState(false) // 聊天内容是否展开
  const [micStatus, setMicStatus] = useState("")
  const [showMicStatus, setShowMicStatus] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false) // 是否正在流式输出
  const [fullText, setFullText] = useState("") // 完整的回复文本
  const [streamIndex, setStreamIndex] = useState(0) // 当前流式输出的索引

  const statusOpacity = useRef(new Animated.Value(0)).current
  const scrollViewRef = useRef(null)
  const inputRef = useRef(null)
  const streamTimerRef = useRef(null)
  const chatContainerHeight = useRef(new Animated.Value(isExpanded ? 300 : 150)).current

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

  // 确保在消息更新后滚动到底部
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }, [messages])

  // 动画展开/收起聊天窗口
  useEffect(() => {
    Animated.timing(chatContainerHeight, {
      toValue: isExpanded ? 300 : 150,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      // 动画完成后滚动到底部
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 100)
    })
  }, [isExpanded])

  // 流式输出效果
  useEffect(() => {
    // 清理函数，确保组件卸载时清除定时器
    return () => {
      if (streamTimerRef.current) {
        clearInterval(streamTimerRef.current)
      }
    }
  }, [])

  // 处理流式输出
  useEffect(() => {
    if (isStreaming && streamIndex < fullText.length) {
      // 每隔一小段时间增加显示的文本长度
      streamTimerRef.current = setInterval(() => {
        // 随机决定每次增加的字符数，模拟真实打字速度的变化
        const increment = Math.floor(Math.random() * 3) + 1
        const nextIndex = Math.min(streamIndex + increment, fullText.length)
        setStreamIndex(nextIndex)

        // 更新消息列表中的最后一条消息
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages]
          if (updatedMessages.length > 0) {
            const lastMessage = updatedMessages[updatedMessages.length - 1]
            if (!lastMessage.isUser) {
              updatedMessages[updatedMessages.length - 1] = {
                ...lastMessage,
                text: fullText.substring(0, nextIndex),
              }
            }
          }
          return updatedMessages
        })

        // 滚动到底部以跟随文本增长
        scrollViewRef.current?.scrollToEnd({ animated: false })

        // 如果已经显示完全部文本，停止流式输出
        if (nextIndex >= fullText.length) {
          clearInterval(streamTimerRef.current)
          setIsStreaming(false)
        }
      }, 30) // 调整时间间隔可以改变打字速度
    }

    return () => {
      if (streamTimerRef.current) {
        clearInterval(streamTimerRef.current)
      }
    }
  }, [isStreaming, streamIndex, fullText])

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    getMessages: () => messages
  }));

  const startStreaming = (text) => {
    // 清除之前的流式输出
    if (streamTimerRef.current) {
      clearInterval(streamTimerRef.current)
    }

    setFullText(text)
    setStreamIndex(0)
    setIsStreaming(true)

    // 添加一个初始的空消息，后续会更新这条消息
    const aiResponse = {
      id: Date.now() + 1,
      text: "",
      isUser: false,
    }
    setMessages((prev) => [...prev, aiResponse])
  }

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

    try {
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
        // 开始流式输出AI回复
        startStreaming(data.llm_response)
      } else {
        // 如果没有有效响应，显示错误消息
        const aiResponse = {
          id: Date.now() + 1,
          text: "抱歉，我无法理解您的问题。",
          isUser: false,
        }
        setMessages((prev) => [...prev, aiResponse])
      }
    } catch (error) {
      console.error("发送消息失败:", error)
      const errorResponse = {
        id: Date.now() + 1,
        text: "发送消息失败，请检查网络连接。",
        isUser: false,
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
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
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 100)
    })

    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      // 键盘隐藏时，确保滚动到底部
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 100)
    })

    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [])

  return (
    <View style={styles.container}>
      {/* 状态提示 */}
      {/* {showMicStatus && (
        <Animated.View style={[styles.statusOverlay, { opacity: statusOpacity }]}>
          <Text style={styles.statusText}>{micStatus}</Text>
        </Animated.View>
      )} */}

      {/* 展开/收起按钮 */}
      <TouchableOpacity style={styles.expandButton} onPress={toggleExpand}>
        <Icon name={isExpanded ? "chevron-down" : "chevron-up"} size={20} color="#3b82f6" />
        <Text style={styles.expandButtonText}>{isExpanded ? "收起" : "展开"}</Text>
      </TouchableOpacity>

      {/* 消息列表区域 */}
      <Animated.View style={[styles.messagesWrapper, { height: chatContainerHeight }]}>
        <ScrollView ref={scrollViewRef} style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
          {messages.map((message) => (
            <View key={message.id} style={[styles.messageBubble, message.isUser ? styles.userBubble : styles.aiBubble]}>
              <Text style={message.isUser ? styles.userMessageText : styles.aiMessageText}>{message.text}</Text>
              {!message.isUser &&
                isStreaming &&
                message.id === messages[messages.length - 1]?.id &&
                message.text !== fullText && (
                  <View style={styles.typingIndicatorWrapper}>
                    <TypingIndicator />
                  </View>
                )}
            </View>
          ))}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={styles.loadingText}>AI思考中...</Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* 输入区域 - 固定在底部 */}
      <View style={styles.inputWrapper}>
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="请输入您的问题..."
            placeholderTextColor="#a0aec0"
            multiline={false}
          />
          <Microphone handleVoiceInput={handleVoiceInput} onStatusChange={showStatusMessage} />
          <TouchableOpacity
            style={[styles.sendButton, input.trim() === "" ? styles.sendButtonDisabled : null]}
            onPress={handleSendMessage}
            disabled={input.trim() === ""}
          >
            <Icon name="send" size={24} color={input.trim() === "" ? "#CBD5E0" : "white"} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
  statusOverlay: {
    position: "absolute",
    top: 10,
    left: "50%",
    transform: [{ translateX: -100 }],
    backgroundColor: "rgba(0, 0, 0, 0.7)",
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
    fontSize: 14,
    textAlign: "center",
  },
  expandButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(203, 213, 224, 0.5)",
  },
  expandButtonText: {
    marginLeft: 5,
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "500",
  },
  messagesWrapper: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  messagesContainer: {
    flex: 1,
    width: "100%",
  },
  messagesContent: {
    padding: 10,
    paddingBottom: 15,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 18,
    marginVertical: 5,
    position: "relative",
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
    fontSize: 16,
    color: "white",
  },
  aiMessageText: {
    fontSize: 16,
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
    fontSize: 14,
    color: "#64748b",
  },
  inputWrapper: {
    width: "100%",
    padding: 10,
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(203, 213, 224, 0.5)",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: 40,
    color: "#334155",
  },
  sendButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
  sendButtonDisabled: {
    backgroundColor: "#E2E8F0",
  },
  typingIndicatorWrapper: {
    marginTop: 4,
    marginLeft: 4,
    height: 16,
  },
})

export default ChatView
