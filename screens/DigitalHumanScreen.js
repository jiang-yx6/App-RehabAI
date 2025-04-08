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
        const trackExists = existingTracks.some(t => t.id === event.track.id)
        
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
        const trackExists = existingTracks.some(t => t.id === event.track.id)
        
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
      } else if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
        setIsConnected(false)
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