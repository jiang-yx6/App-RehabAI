import React, { useState,  useRef, useEffect } from 'react';
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
} from "react-native"
import AudioRecord from "react-native-audio-record"
import Microphone from './Microphone';
import { PermissionsAndroid } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
const { height } = Dimensions.get("window")

const ChatView = ({sessionId, isConnected, clickConnection, audioStream}) => {
    const [input, setInput] = useState("") // 输入框内容
    const [messages, setMessages] = useState([]) // 聊天内容
    const [isRecording, setIsRecording] = useState(false) // 是否正在录音
    const [isLoading, setIsLoading] = useState(false) // 是否正在加载
    const [isExpanded, setIsExpanded] = useState(false) // 聊天内容是否展开
    const [micStatus, setMicStatus] = useState("")
    const [showMicStatus, setShowMicStatus] = useState(false)
    const statusOpacity = useRef(new Animated.Value(0)).current

    const scrollViewRef = useRef() // 滚动视图
    // const animation = useRef(null) // 动画
    useEffect(() => {
      if (audioStream) {
        console.log("Audio stream available in ChatView")
        
        // You can create an audio element for web if needed
        if (Platform.OS === "web") {
          const audioElement = new Audio()
          audioElement.srcObject = audioStream
          audioElement.play().catch(e => console.error("Error playing audio:", e))
        }
        
        // For native platforms, the audio should play automatically
        // through the RTCPeerConnection
      }
    }, [audioStream])

    const requestMicrophonePermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, {
          title: "麦克风权限",
          message: "需要麦克风权限来进行语音交互",
          buttonNeutral: "稍后询问",
          buttonNegative: "取消",
          buttonPositive: "确定",
        })
        return granted === PermissionsAndroid.RESULTS.GRANTED
      } catch (err) {
        console.warn(err)
        return false
      }
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

      const response = await fetch('http://10.3.242.26:8010/human', {
        body: JSON.stringify({
          text: input.trim(),
          type: 'chat',
          interrupt: true,
          sessionid: sessionId
        }),
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST'
      });
    

    const data = await response.json();
    if(data.llm_response){
        console.log('AI响应');
        // setTimeout(async () => {
            const aiResponse = {
                id: Date.now() + 1,
                text: data.llm_response,
                isUser: false,
            }
            setMessages((prev) => [...prev, aiResponse])
            setIsLoading(false)
        // }, 1000)
      }
      // if(!response.ok){
      // console.error('网络请求失败:', response.status, response.statusText);
      //     setIsLoading(false);
      //     return;
      // }

      // const data = await response.json();
      // Simulate AI response
      
    }
  
    const handleVoiceInput = (result) =>{
      setInput(result);
    }
    // const handleVoiceInput = async () => {
    //   try {
    //     if (isRecording) {
    //       // Stop recording
    //       setIsRecording(false)
    //       animation.current?.pause()
    //       AudioRecord.stop()
  
    //       // Simulate processing voice and getting text
    //       setTimeout(() => {
    //         const voiceText = "这是语音输入的模拟文本"
    //         const userMessage = {
    //           id: Date.now(),
    //           text: voiceText,
    //           isUser: true,
    //         }
  
    //         setMessages([...messages, userMessage])
    //         setIsLoading(true)
  
    //         // Simulate AI response
    //         setTimeout(() => {
    //           const aiResponse = {
    //             id: Date.now() + 1,
    //             text: generateResponse(voiceText),
    //             isUser: false,
    //           }
    //           setMessages((prev) => [...prev, aiResponse])
    //           setIsLoading(false)
    //         }, 1500)
    //       }, 1000)
    //     } else {
    //       // Start recording
    //       const hasPermission = await requestMicrophonePermission()
    //       if (!hasPermission) {
    //         alert("需要麦克风权限来进行语音交互")
    //         return
    //       }
  
    //       const options = {
    //         sampleRate: 16000,
    //         channels: 1,
    //         bitsPerSample: 16,
    //         audioSource: 6,
    //         wavFile: "voice_input.wav",
    //       }
  
    //       AudioRecord.init(options)
    //       AudioRecord.start()
  
    //       setIsRecording(true)
    //       animation.current?.play()
    //     }
    //   } catch (error) {
    //     console.error("Error with voice recording:", error)
    //   }
    // }
  
    // Simple response generator (would be replaced with actual AI model)
    const generateResponse = (query) => {
      const responses = [
        "根据医学研究，每天进行适当的康复训练可以加速恢复进程。",
        "您的康复进展良好，请继续保持当前的训练频率。",
        "这种症状是正常的康复反应，不必过于担心。",
        "建议您增加休息时间，避免过度训练导致二次伤害。",
        "您可以尝试我们推荐的新康复动作，它对您的情况可能更有效。",
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    }    

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

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
                useNativeDriver: true
            }).start(() => setShowMicStatus(false))
        }, 1500)
    }

    return (
      isConnected ? (
        <View style={[
            styles.chatContainer, 
            isExpanded ? styles.chatContainerExpanded : null
        ]}>
            {showMicStatus && (
                <Animated.View style={[styles.statusOverlay, { opacity: statusOpacity }]}>
                    <Text style={styles.statusText}>{micStatus}</Text>
                    {/* <ActivityIndicator size="small" color="#fff" /> */}
                </Animated.View>
            )}
            
            <TouchableOpacity 
                style={styles.expandButton} 
                onPress={toggleExpand}
            >
                <Icon 
                    name={isExpanded ? "chevron-down" : "chevron-up"} 
                    size={20} 
                    color="#3b82f6" 
                />
            </TouchableOpacity>
            
            <ScrollView
                ref={scrollViewRef}
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
                onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
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
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="请输入您的问题..."
                placeholderTextColor="#a0aec0"
                multiline
            />
            <Microphone 
                handleVoiceInput={handleVoiceInput}
                onStatusChange={showStatusMessage}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage} disabled={input.trim() === ""}>
                <Icon name="send" size={24} color="white" />
            </TouchableOpacity>
            </View>
        </View>
      ) : (
        <View style={styles.connectionContainer}>
          <TouchableOpacity style={styles.connectionButton} onPress={clickConnection}>
            <Text style={styles.connectionButtonText}>连接</Text>
          </TouchableOpacity>
        </View>
      )
    )
}


const styles = StyleSheet.create({
    chatContainer: {
        position: "absolute",
        maxHeight: "30%",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 10,
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: "white",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.5,
        shadowRadius: 3,
        elevation: 3,
        opacity: 0.6,
    },
    connectionContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
    },
    connectionButton: {
        padding: 10,
        borderRadius: 30,
        backgroundColor: "#3b82f6",
        alignItems: "center",
        flex: 1,
        marginHorizontal: 10,
        paddingVertical: 15,
    },
    connectionButtonText: {
        color: "white",
        fontSize: 16,
    },
        
    chatContainerExpanded: {
        maxHeight: "80%",
        opacity: 0.7,
    },
    expandButton: {
        alignSelf: 'center',
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
        fontSize: 12,
        color: "white",
    },
    aiMessageText: {
        fontSize: 12,
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
        backgroundColor: "white",
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        opacity: 0.95,
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
        position: 'absolute',
        top: 10,
        left: '50%',
        transform: [{ translateX: -100 }],
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        padding: 10,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 1000,
        width: 200,
        justifyContent: 'center',
    },
    statusText: {
        color: '#fff',
        marginRight: 8,
        fontSize: 14,
    },
})

export default ChatView;
