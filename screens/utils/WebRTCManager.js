"use client"

import {
  RTCPeerConnection,
  mediaDevices,
  RTCSessionDescription,
  MediaStream,
  RTCAudioSession,
} from "react-native-webrtc"
import { Platform, PermissionsAndroid } from "react-native"

class WebRTCManager {
  constructor() {
    this.peerConnection = null
    this.localStream = null
    this.remoteVideoStream = null
    this.remoteAudioStream = null
    this.sessionId = null
    this.isConnected = false
    this.onConnectionStateChange = null
    this.onRemoteStreamUpdate = null
    this.onError = null
    this.onSessionIdReceived = null
    this.mediaConstraints = {
      audio: true,
      video: {
        frameRate: 30,
        facingMode: "user",
      },
    }
    this.sessionConstraints = {
      mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true,
        VoiceActivityDetection: true,
      },
    }
    this.serverUrl = "http://10.3.242.26:8010/offer"
  }

  // 初始化 WebRTC 相关配置
  initialize(callbacks) {
    // 设置回调函数
    this.onConnectionStateChange = callbacks?.onConnectionStateChange
    this.onRemoteStreamUpdate = callbacks?.onRemoteStreamUpdate
    this.onError = callbacks?.onError
    this.onSessionIdReceived = callbacks?.onSessionIdReceived

    // 配置平台相关的音频设置
    this._configureAudioSession()

    return this
  }

  // 请求必要的权限
  async requestPermissions() {
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

  // 获取本地媒体流
  async getLocalStream() {
    try {
      const stream = await mediaDevices.getUserMedia(this.mediaConstraints)
      this.localStream = stream
      return stream
    } catch (err) {
      console.error("获取本地流失败:", err)
      throw err
    }
  }

  // 创建对等连接
  createPeerConnection() {
    const config = {
      iceServers: [
        {
          urls: ["stun:stun.l.google.com:19302"],
        },
      ],
      sdpSemantics: "unified-plan",
    }

    const pc = new RTCPeerConnection(config)

    // 监听 ICE 候选
    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        console.log("收到ICE候选者:", candidate)
      }
    }

    // 监听远程轨道
    pc.ontrack = (event) => {
      console.log("收到远程轨道:", event.track.kind)

      // 分别处理音频和视频轨道
      if (event.track.kind === "audio") {
        this._handleAudioTrack(event.track)
      } else if (event.track.kind === "video") {
        this._handleVideoTrack(event.track)
      }
    }

    // 监听连接状态变化
    pc.onconnectionstatechange = () => {
      console.log("连接状态变化:", pc.connectionState)
      
      if (pc.connectionState === "connected") {
        this.isConnected = true
        this._enhanceAudioOutput()
      } else if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
        this.isConnected = false
      }
      
      // 调用外部状态变化回调
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(pc.connectionState, this.isConnected)
      }
    }

    this.peerConnection = pc
    return pc
  }

  // 处理音频轨道
  _handleAudioTrack(track) {
    // 创建新的音频流或使用现有的
    const audioStream = this.remoteAudioStream || new MediaStream()

    // 检查轨道是否已存在
    const existingTracks = audioStream.getAudioTracks()
    const trackExists = existingTracks.some((t) => t.id === track.id)

    if (!trackExists) {
      console.log(`Adding audio track ${track.id} to audio stream`)
      audioStream.addTrack(track)
      this.remoteAudioStream = audioStream
      
      // 调用外部流更新回调
      if (this.onRemoteStreamUpdate) {
        this.onRemoteStreamUpdate({
          type: "audio",
          stream: audioStream
        })
      }
    }
  }

  // 处理视频轨道
  _handleVideoTrack(track) {
    // 创建新的视频流或使用现有的
    const videoStream = this.remoteVideoStream || new MediaStream()

    // 检查轨道是否已存在
    const existingTracks = videoStream.getVideoTracks()
    const trackExists = existingTracks.some((t) => t.id === track.id)

    if (!trackExists) {
      console.log(`Adding video track ${track.id} to video stream`)
      videoStream.addTrack(track)
      this.remoteVideoStream = videoStream
      
      // 调用外部流更新回调
      if (this.onRemoteStreamUpdate) {
        this.onRemoteStreamUpdate({
          type: "video",
          stream: videoStream
        })
      }
    }
  }

  // 增强音频输出（增加音量等）
  _enhanceAudioOutput() {
    if (!this.remoteAudioStream) return

    // 启用音频轨道
    const audioTracks = this.remoteAudioStream.getAudioTracks()
    console.log(`Remote audio stream has ${audioTracks.length} audio tracks`)

    audioTracks.forEach((track) => {
      console.log(`Enabling audio track: ${track.id}`)
      track.enabled = true

      // 增加音量 - 如果 MediaStreamTrack 支持音量属性
      if (track.getConstraints && track.applyConstraints) {
        try {
          track.applyConstraints({ volume: 1.0 })
        } catch (e) {
          console.log("音量约束不受支持:", e)
        }
      }

      // 添加事件监听器
      track.onended = () => console.log(`Audio track ${track.id} ended`)
      track.onmute = () => console.log(`Audio track ${track.id} muted`)
      track.onunmute = () => console.log(`Audio track ${track.id} unmuted`)
    })

    // Android 特定音频增强
    if (Platform.OS === "android") {
      try {
        const AudioManager = require("react-native").NativeModules.AudioManager
        if (AudioManager && AudioManager.setSpeakerphoneOn) {
          console.log("Setting speakerphone on")
          AudioManager.setSpeakerphoneOn(true)

          // 增加媒体音量到最大 (Android特有)
          if (AudioManager.setStreamVolume) {
            AudioManager.setStreamVolume(3, 15, 0)
            console.log("已将媒体音量设置为最大")
          }
        }
      } catch (error) {
        console.error("Error setting audio mode:", error)
      }
    }

    // iOS 特定音频增强
    if (Platform.OS === "ios") {
      try {
        const audioSession = RTCAudioSession.sharedInstance()
        audioSession.setCategory("playAndRecord")
        audioSession.setMode("videoChat")
        audioSession.setOutputVolume(1.0)

        // 尝试使用 AVAudioSession 增加音量
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
      } catch (error) {
        console.error("设置iOS音频会话时出错:", error)
      }
    }

    // Web 平台特定音频增强
    if (Platform.OS === "web") {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const source = audioContext.createMediaStreamSource(this.remoteAudioStream)
        const gainNode = audioContext.createGain()
        gainNode.gain.value = 2.5
        source.connect(gainNode)
        gainNode.connect(audioContext.destination)
      } catch (error) {
        console.error("设置Web音频增益时出错:", error)
      }
    }
  }

  // 配置音频会话
  _configureAudioSession() {
    if (Platform.OS === "ios") {
      try {
        const audioSession = RTCAudioSession.sharedInstance()
        audioSession.setCategory("playAndRecord", {
          defaultToSpeaker: true,
          allowBluetooth: true,
          allowBluetoothA2DP: true,
          allowAirPlay: true,
          mixWithOthers: true,
        })
        audioSession.setMode("videoChat")
        audioSession.setOutputVolume(1.0)
        audioSession.setActive(true)
      } catch (error) {
        console.error("设置iOS音频会话时出错:", error)
      }
    } else if (Platform.OS === "android") {
      try {
        const AudioManager = require("react-native").NativeModules.AudioManager
        if (AudioManager) {
          if (AudioManager.setMode) {
            AudioManager.setMode(3) // MODE_IN_COMMUNICATION
          }
          if (AudioManager.setSpeakerphoneOn) {
            AudioManager.setSpeakerphoneOn(true)
          }
          if (AudioManager.setStreamVolume) {
            AudioManager.setStreamVolume(3, 15, 0)
          }
        }
      } catch (error) {
        console.error("设置Android音频模式时出错:", error)
      }
    }
  }

  // 启动协商过程
  async negotiate() {
    if (!this.peerConnection) {
      throw new Error("Peer connection not initialized")
    }

    try {
      console.log("开始协商过程...")

      // 添加收发器
      this.peerConnection.addTransceiver("video", { direction: "recvonly" })
      this.peerConnection.addTransceiver("audio", { direction: "recvonly" })
      console.log("已添加音视频接收器")

      // 创建并设置本地描述
      const offer = await this.peerConnection.createOffer(this.sessionConstraints)
      await this.peerConnection.setLocalDescription(offer)
      console.log("本地描述符已设置")

      // 等待 ICE 收集完成
      await this._waitForIceGatheringComplete()

      // 发送 offer 到服务器
      console.log("正在发送offer到服务器...")
      const response = await fetch(this.serverUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sdp: this.peerConnection.localDescription.sdp,
          type: this.peerConnection.localDescription.type,
        }),
      })

      const answer = await response.json()
      console.log("收到服务器应答")
      
      // 处理会话 ID
      const { sessionid: newSessionId } = answer
      if (newSessionId) {
        this.sessionId = newSessionId
        console.log("设置新的 sessionId:", newSessionId)
        
        // 调用外部会话 ID 接收回调
        if (this.onSessionIdReceived) {
          this.onSessionIdReceived(newSessionId)
        }
      } else {
        console.warn("未能从服务器响应中获取 sessionId")
      }

      // 设置远程描述
      const remoteDesc = new RTCSessionDescription(answer)
      await this.peerConnection.setRemoteDescription(remoteDesc)
      console.log("远程描述符设置完成，连接建立中")
    } catch (error) {
      console.error("协商失败:", error)
      if (this.onError) {
        this.onError(error)
      }
      throw error
    }
  }

  // 等待 ICE 收集完成
  _waitForIceGatheringComplete() {
    return new Promise((resolve) => {
      if (this.peerConnection.iceGatheringState === "complete") {
        console.log("ICE收集已完成")
        resolve()
      } else {
        console.log("等待ICE收集...")
        const checkState = () => {
          if (this.peerConnection.iceGatheringState === "complete") {
            console.log("ICE收集完成")
            this.peerConnection.removeEventListener("icegatheringstatechange", checkState)
            resolve()
          }
        }
        this.peerConnection.addEventListener("icegatheringstatechange", checkState)
      }
    })
  }

  // 建立连接
  async connect() {
    try {
      // 请求权限
      const hasPermissions = await this.requestPermissions()
      if (!hasPermissions) {
        console.log("权限请求失败")
        throw new Error("Permission denied")
      }

      // 获取本地流
      const stream = await this.getLocalStream()
      
      // 创建对等连接
      const pc = this.createPeerConnection()

      // 添加本地轨道到对等连接
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream)
      })

      // 开始协商
      await this.negotiate()
      
      return true
    } catch (error) {
      console.error("连接失败:", error)
      if (this.onError) {
        this.onError(error)
      }
      this.disconnect()
      return false
    }
  }

  // 断开连接
  disconnect() {
    // 停止并清理本地流
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop())
      this.localStream = null
    }

    // 停止并清理远程音频流
    if (this.remoteAudioStream) {
      this.remoteAudioStream.getTracks().forEach((track) => track.stop())
      this.remoteAudioStream = null
    }

    // 停止并清理远程视频流
    if (this.remoteVideoStream) {
      this.remoteVideoStream.getTracks().forEach((track) => track.stop())
      this.remoteVideoStream = null
    }

    // 关闭并清理对等连接
    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }

    // 重置状态
    this.isConnected = false
    this.sessionId = null
    
    console.log("连接已断开")
    
    // 通知连接状态变化
    if (this.onConnectionStateChange) {
      this.onConnectionStateChange("closed", false)
    }
  }

  // 清理资源
  cleanup() {
    this.disconnect()
    
    // 在 iOS 平台上关闭音频会话
    if (Platform.OS === "ios") {
      try {
        const audioSession = RTCAudioSession.sharedInstance()
        audioSession.setActive(false)
      } catch (error) {
        console.error("关闭iOS音频会话时出错:", error)
      }
    }
  }
}

// 导出单例
export default new WebRTCManager() 