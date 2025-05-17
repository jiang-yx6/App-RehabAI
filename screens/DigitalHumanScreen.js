"use client"

import { useRef, useState, useEffect } from "react"
import { StyleSheet, View, PermissionsAndroid, Platform } from "react-native"
import { RTCPeerConnection, mediaDevices, RTCSessionDescription, MediaStream, RTCAudioSession } from "react-native-webrtc"
import ChatView from "./DigitalHuman/ChatView"
import { DigitView } from "./DigitalHuman/DigitView"

const DigitalHumanScreen = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [localStream, setLocalStream] = useState(null)
  // Separate streams for audio and video
  const [remoteVideoStream, setRemoteVideoStream] = useState(null)
  const [remoteAudioStream, setRemoteAudioStream] = useState(null)
  const pcRef = useRef(null)
  const videoRef = useRef(null)
  const audioRef = useRef(null)

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
          } else {
            console.warn("AudioManager not available for speaker control")
          }
        } catch (error) {
          console.error("Error setting audio mode:", error)
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
    if (Platform.OS === 'ios') {
      const audioSession = RTCAudioSession.sharedInstance()
      audioSession.setCategory('playAndRecord')
      audioSession.setMode('videoChat')
      audioSession.setActive(true)
    }
    
    return () => {
      if (Platform.OS === 'ios') {
        const audioSession = RTCAudioSession.sharedInstance()
        audioSession.setActive(false)
      }
    }
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

  const handleAudioTrack = (track) => {
    console.log("处理音频轨道:", track.id);
    
    // 创建新的音频流或使用现有的
    const audioStream = remoteAudioStream || new MediaStream();
    
    // 检查轨道是否已存在
    const existingTracks = audioStream.getAudioTracks();
    const trackExists = existingTracks.some((t) => t.id === track.id);
    
    if (!trackExists) {
      // 设置音频处理优先级和属性
      if (track.applyConstraints) {
        console.log("应用音频轨道约束");
        try {
          track.applyConstraints({
            echoCancellation: false, // 关闭回声消除，减少处理负担
            noiseSuppression: true,
            autoGainControl: true,
            sampleSize: 16,
            channelCount: 1
          });
        } catch (e) {
          console.warn("无法应用音频约束:", e);
        }
      }
      
      // 提高音频轨道优先级
      track.enabled = true;
      audioStream.addTrack(track);
      setRemoteAudioStream(audioStream);
      
      // 应用增强音频设置
      enhanceAudioOutput(audioStream);
    }
  };

  const enhanceAudioOutput = (audioStream) => {
    if (!audioStream) return;
    
    const audioTracks = audioStream.getAudioTracks();
    console.log(`音频流有 ${audioTracks.length} 个音轨`);
    
    audioTracks.forEach((track) => {
      console.log(`启用音轨: ${track.id}`);
      track.enabled = true;
      
      // 设置高优先级
      if (track.contentHint) {
        track.contentHint = "speech";
      }
    });
    
    // Android平台特定优化
    if (Platform.OS === "android") {
      try {
        const AudioManager = require("react-native").NativeModules.AudioManager;
        if (AudioManager) {
          // 设置音频模式为语音通话模式
          if (AudioManager.setMode) {
            AudioManager.setMode(3); // MODE_IN_COMMUNICATION
          }
          
          // 打开扬声器
          if (AudioManager.setSpeakerphoneOn) {
            AudioManager.setSpeakerphoneOn(true);
          }
          
          // 增加音频缓冲区大小，减少卡顿
          if (AudioManager.setParameters) {
            AudioManager.setParameters("audio_hw_buffer_size=4096;audio_hw_buffer_count=8");
          }
          
          // 设置音频流类型和音量
          if (AudioManager.setStreamVolume) {
            AudioManager.setStreamVolume(3, 15, 0); // 最大音量
          }
        }
      } catch (error) {
        console.error("设置音频模式出错:", error);
      }
    }
  };

  const createPeerConnection = () => {
    const config = {
      iceServers: [
        {
          urls: ["stun:stun.l.google.com:19302"],
        },
      ],
      // 优化ICE收集
      iceTransportPolicy: "all",
      iceCandidatePoolSize: 10,
      // 优化SDP语义
      sdpSemantics: "unified-plan",
      // 优化传输策略
      bundlePolicy: "max-bundle",
      rtcpMuxPolicy: "require"
    }

    const pc = new RTCPeerConnection(config)

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        console.log("收到ICE候选:", candidate.type)
      }
    }

    pc.ontrack = (event) => {
      console.log("收到远程轨道:", event.track.kind)
    
      if (event.track.kind === "audio") {
        handleAudioTrack(event.track)
      } else if (event.track.kind === "video") {
        // 处理视频轨道
        const videoStream = remoteVideoStream || new MediaStream()
        const existingTracks = videoStream.getVideoTracks()
        const trackExists = existingTracks.some(t => t.id === event.track.id)
        
        if (!trackExists) {
          console.log(`添加视频轨道 ${event.track.id}`)
          videoStream.addTrack(event.track)
          setRemoteVideoStream(videoStream)
        }
      }
    }

    pc.onconnectionstatechange = () => {
      console.log("连接状态变化:", pc.connectionState)
      if (pc.connectionState === "connected") {
        setIsConnected(true)
        
        // 连接成功后设置音频输出增强
        setTimeout(() => {
          if (remoteAudioStream) {
            enhanceAudioOutput(remoteAudioStream)
          }
        }, 500)
      } else if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
        setIsConnected(false)
      }
    }

    // 添加ICE连接状态变化处理
    pc.oniceconnectionstatechange = () => {
      console.log("ICE连接状态:", pc.iceConnectionState)
      
      // 如果ICE连接成功但有问题，尝试重启ICE
      if (pc.iceConnectionState === "disconnected") {
        console.log("ICE连接断开，尝试重启...")
        try {
          pc.restartIce()
        } catch (error) {
          console.error("ICE重启失败:", error)
        }
      }
    }

    return pc
  }

  const negotiate = async (peerConnection) => {
    try {
      console.log("开始协商...")
      
      // 明确添加仅接收的收发器
      peerConnection.addTransceiver("video", { 
        direction: "recvonly",
        streams: [] 
      })
      peerConnection.addTransceiver("audio", { 
        direction: "recvonly", 
        streams: [] 
      })
      
      // 创建并设置本地描述
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
        voiceActivityDetection: false, // 禁用语音活动检测，减少处理
        iceRestart: true // 允许ICE重启
      })
      
      // 修改SDP，优化音频设置
      let sdp = offer.sdp
      
      // 增加音频优先级
      sdp = sdp.replace(/a=mid:audio\r\n/g, 'a=mid:audio\r\na=priority:high\r\n')
      
      // 设置更适合实时通信的音频编解码器优先级
      sdp = sdp.replace(/a=rtpmap:(.*) opus\/48000\/2/g, 
        'a=rtpmap:$1 opus/48000/2\r\na=fmtp:$1 minptime=10;useinbandfec=1;stereo=0;sprop-stereo=0;cbr=1')
      
      // 禁用视频高比特率，节省资源
      sdp = sdp.replace(/a=rtpmap:(.*) H264\/.*\r\n/g, 
        'a=rtpmap:$1 H264/90000\r\na=fmtp:$1 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f;x-google-max-bitrate=1000;x-google-min-bitrate=500;x-google-start-bitrate=800\r\n')
      
      offer.sdp = sdp
      
      await peerConnection.setLocalDescription(offer)
      console.log("已设置本地描述...")
      
      // 等待ICE收集完成
      await new Promise((resolve) => {
        if (peerConnection.iceGatheringState === "complete") {
          resolve()
          return
        }
        
        const checkState = () => {
          if (peerConnection.iceGatheringState === "complete") {
            peerConnection.removeEventListener("icegatheringstatechange", checkState)
            resolve()
          }
        }
        
        peerConnection.addEventListener("icegatheringstatechange", checkState)
        
        // 设置超时，避免卡住
        setTimeout(() => {
          peerConnection.removeEventListener("icegatheringstatechange", checkState)
          resolve()
        }, 5000) // 5秒后超时
      })
      
      // 发送Offer到服务器
      const response = await fetch("http://10.3.242.27:8010/offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sdp: peerConnection.localDescription.sdp,
          type: peerConnection.localDescription.type,
        }),
      })
      
      const answer = await response.json()
      const { sessionid: newSessionId } = answer
      if (newSessionId) {
        setSessionId(newSessionId)
      }
      
      // 设置远程描述
      const remoteDesc = new RTCSessionDescription(answer)
      await peerConnection.setRemoteDescription(remoteDesc)
      console.log("远程描述设置完成")
    } catch (error) {
      console.error("协商失败:", error)
      throw error
    }
  }

  const handleConnenction = async () => {
    try {
      console.log("开始建立连接...")

      const hasPermissions = await requestPermissions()
      if (!hasPermissions) {
        console.log("权限请求失败")
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
  }

  return (
    <View style={styles.container}>
      <DigitView 
        videoRef={videoRef} 
        isConnected={isConnected} 
        remoteStream={remoteVideoStream} 
      />
      <ChatView 
        sessionId={sessionId} 
        isConnected={isConnected} 
        clickConnection={handleConnenction} 
        audioStream={remoteAudioStream}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
})

export default DigitalHumanScreen