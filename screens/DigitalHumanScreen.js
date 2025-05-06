"use client"

import { useRef, useState, useEffect } from "react"
import {
  StyleSheet,
  View,
  PermissionsAndroid,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from "react-native"
import {
  RTCPeerConnection,
  mediaDevices,
  RTCSessionDescription,
  MediaStream,
  RTCAudioSession,
} from "react-native-webrtc"
import ChatView from "./DigitalHuman/ChatView"
import { DigitView } from "./DigitalHuman/DigitView"
import LinearGradient from "react-native-linear-gradient"
import Icon from "react-native-vector-icons/Ionicons"
import UserEval from "./DigitalHuman/UserEval"
import Admin from "./DigitalHuman/Admin"
const { width, height } = Dimensions.get("window")
const DigitalHumanScreen = ({ navigation }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [localStream, setLocalStream] = useState(null)
  const [remoteVideoStream, setRemoteVideoStream] = useState(null)
  const [remoteAudioStream, setRemoteAudioStream] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [messages, setMessages] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)
  const pcRef = useRef(null)
  const videoRef = useRef(null)
  const audioRef = useRef(null)
  const chatRef = useRef(null)

  const mediaConstraints = {
    audio: true,
    video: {
      frameRate: 30,
      facingMode: "user",
    },
  }

  const sessionConstraints = {
    mandatory: {
      OfferToReceiveAudio: true,
      OfferToReceiveVideo: true,
      VoiceActivityDetection: true,
    },
  }

  // Handle remote audio stream changes
  useEffect(() => {
    if (remoteAudioStream) {
      console.log("Remote audio stream set")

      // Enable audio tracks
      const audioTracks = remoteAudioStream.getAudioTracks()
      console.log(`Remote audio stream has ${audioTracks.length} audio tracks`)

      audioTracks.forEach((track) => {
        console.log(`Enabling audio track: ${track.id}`)
        track.enabled = true

        // 增加音量 - 如果 MediaStreamTrack 支持音量属性
        if (track.getConstraints && track.applyConstraints) {
          try {
            // 尝试设置音量约束 (仅在某些平台支持)
            track.applyConstraints({ volume: 1.0 })
          } catch (e) {
            console.log("音量约束不受支持:", e)
          }
        }

        // Add event listeners to track audio state
        track.onended = () => console.log(`Audio track ${track.id} ended`)
        track.onmute = () => console.log(`Audio track ${track.id} muted`)
        track.onunmute = () => console.log(`Audio track ${track.id} unmuted`)
      })

      // Force audio routing to speaker on Android
      if (Platform.OS === "android") {
        try {
          const AudioManager = require("react-native").NativeModules.AudioManager
          if (AudioManager && AudioManager.setSpeakerphoneOn) {
            console.log("Setting speakerphone on")
            AudioManager.setSpeakerphoneOn(true)

            // 增加媒体音量到最大 (Android特有)
            if (AudioManager.setStreamVolume) {
              // 设置媒体流音量到最大 (通常是15)
              AudioManager.setStreamVolume(3, 15, 0)
              console.log("已将媒体音量设置为最大")
            }
          } else {
            console.warn("AudioManager not available for speaker control")
          }
        } catch (error) {
          console.error("Error setting audio mode:", error)
        }
      }

      // 在iOS上设置音频会话并增加音量
      if (Platform.OS === "ios") {
        try {
          const audioSession = RTCAudioSession.sharedInstance()
          audioSession.setCategory("playAndRecord")
          audioSession.setMode("videoChat")

          // 设置音频会话的首选输出音量 (0.0 到 1.0)
          audioSession.setOutputVolume(1.0)

          // 尝试使用AVAudioSession增加音量 (如果可用)
          const AVAudioSession = require("react-native").NativeModules.AVAudioSession
          if (AVAudioSession && AVAudioSession.setCategory) {
            AVAudioSession.setCategory("playAndRecord", {
              defaultToSpeaker: true,
              allowBluetooth: true,
              allowBluetoothA2DP: true,
              allowAirPlay: true,
              mixWithOthers: true,
            })
          }

          audioSession.setActive(true)
          console.log("iOS音频会话已配置为最大音量")
        } catch (error) {
          console.error("设置iOS音频会话时出错:", error)
        }
      }

      // 创建音频上下文并应用增益 (Web平台)
      if (Platform.OS === "web") {
        try {
          // 创建音频上下文
          const audioContext = new (window.AudioContext || window.webkitAudioContext)()

          // 创建媒体源
          const source = audioContext.createMediaStreamSource(remoteAudioStream)

          // 创建增益节点
          const gainNode = audioContext.createGain()

          // 设置增益值 (1.0是正常音量，大于1.0会增加音量)
          gainNode.gain.value = 2.5 // 将音量增加到原来的2.5倍

          // 连接节点
          source.connect(gainNode)
          gainNode.connect(audioContext.destination)

          console.log("Web平台: 已应用音频增益")
        } catch (error) {
          console.error("设置Web音频增益时出错:", error)
        }
      }
    }
  }, [remoteAudioStream])

  // Handle remote video stream changes
  useEffect(() => {
    if (remoteVideoStream) {
      console.log("Remote video stream set")
      const videoTracks = remoteVideoStream.getVideoTracks()
      console.log(`Remote video stream has ${videoTracks.length} video tracks`)

      videoTracks.forEach((track) => {
        console.log(`Enabling video track: ${track.id}`)
        track.enabled = true
      })
    }
  }, [remoteVideoStream])

  // Configure audio session
  useEffect(() => {
    if (Platform.OS === "ios") {
      const audioSession = RTCAudioSession.sharedInstance()
      audioSession.setCategory("playAndRecord", {
        defaultToSpeaker: true,
        allowBluetooth: true,
        allowBluetoothA2DP: true,
        allowAirPlay: true,
        mixWithOthers: true,
      })
      audioSession.setMode("videoChat")

      // 设置最大音量
      audioSession.setOutputVolume(1.0)

      // 尝试使用系统API增加音量
      try {
        const AVAudioSession = require("react-native").NativeModules.AVAudioSession
        if (AVAudioSession && AVAudioSession.setCategory) {
          AVAudioSession.setCategory("playAndRecord", {
            defaultToSpeaker: true,
            allowBluetooth: true,
            allowBluetoothA2DP: true,
            allowAirPlay: true,
            mixWithOthers: true,
          })
        }
      } catch (error) {
        console.log("AVAudioSession API不可用", error)
      }

      audioSession.setActive(true)
    } else if (Platform.OS === "android") {
      // 在Android上设置音频模式
      try {
        const AudioManager = require("react-native").NativeModules.AudioManager
        if (AudioManager) {
          // 设置为通信模式
          if (AudioManager.setMode) {
            AudioManager.setMode(3) // MODE_IN_COMMUNICATION
          }

          // 打开扬声器
          if (AudioManager.setSpeakerphoneOn) {
            AudioManager.setSpeakerphoneOn(true)
          }

          // 设置媒体音量到最大
          if (AudioManager.setStreamVolume) {
            // 参数: 流类型(3=媒体), 音量(最大), 标志(0)
            AudioManager.setStreamVolume(3, 15, 0)
            console.log("已将媒体音量设置为最大")
          }
        }
      } catch (error) {
        console.error("设置Android音频模式时出错:", error)
      }
    }

    return () => {
      if (Platform.OS === "ios") {
        const audioSession = RTCAudioSession.sharedInstance()
        audioSession.setActive(false)
      }
    }
  }, [])

  useEffect(() => {
    return () => handleDisconnect()
  }, [])

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ])
        return Object.values(granted).every((permission) => permission === PermissionsAndroid.RESULTS.GRANTED)
      } catch (err) {
        console.warn("权限请求失败:", err)
        return false
      }
    }
    return true
  }

  const getLocalStream = async () => {
    try {
      const stream = await mediaDevices.getUserMedia(mediaConstraints)
      setLocalStream(stream)
      return stream
    } catch (err) {
      console.error("获取本地流失败:", err)
      throw err
    }
  }

  const createPeerConnection = () => {
    const config = {
      iceServers: [
        {
          urls: ["stun:stun.l.google.com:19302"],
        },
      ],
      sdpSemantics: "unified-plan",
    }

    const pc = new RTCPeerConnection(config)

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        console.log("收到ICE候选者:", candidate)
      }
    }

    pc.ontrack = (event) => {
      console.log("收到远程轨道:", event.track.kind)

      // Create separate streams for audio and video
      if (event.track.kind === "audio") {
        // Create new audio stream if it doesn't exist
        const audioStream = remoteAudioStream || new MediaStream()

        // Check if we already have this track
        const existingTracks = audioStream.getAudioTracks()
        const trackExists = existingTracks.some((t) => t.id === event.track.id)

        if (!trackExists) {
          console.log(`Adding audio track ${event.track.id} to audio stream`)
          audioStream.addTrack(event.track)
          setRemoteAudioStream(audioStream)
        }
      } else if (event.track.kind === "video") {
        // Create new video stream if it doesn't exist
        const videoStream = remoteVideoStream || new MediaStream()

        // Check if we already have this track
        const existingTracks = videoStream.getVideoTracks()
        const trackExists = existingTracks.some((t) => t.id === event.track.id)

        if (!trackExists) {
          console.log(`Adding video track ${event.track.id} to video stream`)
          videoStream.addTrack(event.track)
          setRemoteVideoStream(videoStream)
        }
      }
    }

    pc.onconnectionstatechange = () => {
      console.log("连接状态变化:", pc.connectionState)
      if (pc.connectionState === "connected") {
        setIsConnected(true)
        setIsLoading(false)
        setShowChat(true)
        // 连接成功后自动显示聊天窗口
        // setTimeout(() => setShowChat(true), 500)
      } else if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
        setIsConnected(false)
        setIsLoading(false)
        setShowChat(false)
      }
    }

    return pc
  }

  const negotiate = async (peerConnection) => {
    try {
      console.log("开始协商过程...")

      // Explicitly add transceivers for audio and video
      peerConnection.addTransceiver("video", { direction: "recvonly" })
      peerConnection.addTransceiver("audio", { direction: "recvonly" })
      console.log("已添加音视频接收器")

      const offer = await peerConnection.createOffer(sessionConstraints)
      await peerConnection.setLocalDescription(offer)
      console.log("本地描述符已设置:", offer)

      // 等待 ICE gathering 完成
      await new Promise((resolve) => {
        if (peerConnection.iceGatheringState === "complete") {
          console.log("ICE收集已完成")
          resolve()
        } else {
          console.log("等待ICE收集...")
          const checkState = () => {
            if (peerConnection.iceGatheringState === "complete") {
              console.log("ICE收集完成")
              peerConnection.removeEventListener("icegatheringstatechange", checkState)
              resolve()
            }
          }
          peerConnection.addEventListener("icegatheringstatechange", checkState)
        }
      })

      console.log("正在发送offer到服务器...")
      const response = await fetch("http://10.3.242.26:8010/offer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sdp: peerConnection.localDescription.sdp,
          type: peerConnection.localDescription.type,
        }),
      })

      const answer = await response.json()
      console.log("收到服务器应答:", answer)
      // 从响应中获取 sessionId
      const { sessionid: newSessionId } = answer
      if (newSessionId) {
        setSessionId(newSessionId)
        console.log("设置新的 sessionId:", newSessionId)
      } else {
        console.warn("未能从服务器响应中获取 sessionId")
      }

      // Set remote description
      const remoteDesc = new RTCSessionDescription(answer)
      await peerConnection.setRemoteDescription(remoteDesc)
      console.log("远程描述符设置完成，连接建立成功！")
    } catch (error) {
      console.error("协商失败:", error)
      throw error
    }
  }

  const handleConnection = async () => {
    try {
      setIsLoading(true)
      console.log("开始建立连接...")

      const hasPermissions = await requestPermissions()
      if (!hasPermissions) {
        console.log("权限请求失败")
        setIsLoading(false)
        return
      } else {
        console.log("权限请求成功")
      }

      const stream = await getLocalStream()
      const pc = createPeerConnection()

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream)
      })

      pcRef.current = pc
      await negotiate(pc)
    } catch (error) {
      console.error("连接失败:", error)
      setIsLoading(false)
      handleDisconnect()
    }
  }

  const handleDisconnect = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
      setLocalStream(null)
    }

    // Clean up both streams
    if (remoteAudioStream) {
      remoteAudioStream.getTracks().forEach((track) => track.stop())
      setRemoteAudioStream(null)
    }

    if (remoteVideoStream) {
      remoteVideoStream.getTracks().forEach((track) => track.stop())
      setRemoteVideoStream(null)
    }

    if (pcRef.current) {
      pcRef.current.close()
      pcRef.current = null
    }

    setIsConnected(false)
    setSessionId(null)
    setShowChat(false)
    console.log("连接已断开")
  }

  const checkadmin = () => {
    console.log("检查管理员")
    setIsAdmin(!isAdmin)
  }

  const toggleChat = () => {
    console.log(chatRef.current);
    setMessages(chatRef.current.getMessages());
    setShowChat(!showChat);
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* 背景渐变 */}
      <LinearGradient
        colors={["#3a0ca3", "#4361ee", "#4cc9f0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />
      {/* 数字人视图 - 占据全屏 */}
      <View style={styles.digitViewContainer}>
        <DigitView
          videoRef={videoRef}
          isConnected={isConnected}
          remoteStream={remoteVideoStream}
          style={styles.digitView}
        />
      </View>

      {/* 顶部导航栏 */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>康复治疗师</Text>

        <TouchableOpacity style={styles.adminButton} onPress={checkadmin}>
          <Icon name="shield-checkmark-outline" size={30} color="white"/>
        </TouchableOpacity>

        {isConnected && (
          <TouchableOpacity style={styles.chatToggleButton} onPress={toggleChat}>
            <Icon name={!showChat ? "chatbubble" : "chatbubble-outline"} size={24} color="#fff" />
          </TouchableOpacity>
        )}
        
      </SafeAreaView>
      <Admin isAdmin={isAdmin} setIsAdmin={setIsAdmin}/>
      <UserEval showChat={showChat} isConnected={isConnected} messages={messages} setShowChat={setShowChat} style={styles.chatToggleButton}/>

      {/* 底部控制区域 */}
      <View style={styles.bottomContainer}>
        {/* 连接按钮 - 未连接时显示 */}
        {!isConnected && !isLoading && (
          <TouchableOpacity style={styles.connectButton} onPress={handleConnection}>
            <LinearGradient
              colors={["#4cc9f0", "#4361ee"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.connectButtonGradient}
            >
              <Icon name="link" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.connectButtonText}>{sessionId ? "重新连接" : "连接数字人"}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* 加载指示器 */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>正在连接...</Text>
          </View>
        )}
      </View>

      {/* 聊天视图 - 仅在连接且showChat为true时显示 */}
      {isConnected && showChat && (
        <View style={styles.chatContainer}>
          <ChatView 
            sessionId={sessionId} 
            isConnected={isConnected} 
            audioStream={remoteAudioStream} 
            ref={chatRef}
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight + 16,
    paddingHorizontal: 20,
    paddingBottom: 10,
    zIndex: 10,
  },
  backButton: {
    position: "absolute",
    left: 20,
    top: Platform.OS === "ios" ? 50 : StatusBar.currentHeight + 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  chatToggleButton: {
    position: "absolute",
    right: 20,
    top: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  adminButton:{
    position: "absolute",
    right: 20,
    top: 50,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  digitViewContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    alignItems: "center",
    zIndex: 10,
  },
  
  connectButton: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  connectButtonGradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonIcon: {
    marginRight: 8,
  },
  connectButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
  },
  loadingText: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 16,
  },
  chatContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: height * 0.6, // 限制最大高度为屏幕高度的60%
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    zIndex: 20,
    backgroundColor: "rgba(255, 255, 255, 0.55)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
})

export default DigitalHumanScreen
