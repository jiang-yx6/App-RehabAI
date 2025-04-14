import { View, StyleSheet, TouchableOpacity } from 'react-native'
import React, {useState,useEffect } from 'react'
import Icon from "react-native-vector-icons/Ionicons"
import RecorderManager  from "../ASR/utils/RecorderManager"
import WebSocketManager  from "../ASR/utils/WebSocketManager"

const Microphone = ({handleVoiceInput, onStatusChange}) => {
  const [recording, setRecording] = useState(false)
  const [result, setResult] = useState("")
  const [status, setStatus] = useState("点击连接")
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // 当状态改变时通知父组件
  useEffect(() => {
    onStatusChange && onStatusChange(status, isLoading)
  }, [status, isLoading])

  useEffect(() => {
    const initRecorder = async () => {
      await RecorderManager.init()
    }

    initRecorder()

    // return () => {
    //   // 组件卸载时的清理工作
    //   if (recording) {
    //     RecorderManager.stop()
    //   }
    //   WebSocketManager.close()
    //   setIsConnected(false)
    //   RecorderManager.cleanup()
    // }
  }, [recording])


  const connect = () => {
    setIsLoading(true)
    const ret = WebSocketManager.connect("wss://www.funasr.com:10095/", handleJsonMessage, handleConnState)

    if (ret === 1) {
      setStatus("正在连接ASR服务器，请等待...")
    } else {
      setStatus("连接失败，请检查ASR地址和端口")
      setIsLoading(false)
    }
  }
  //处理micro点击事件
  const handleRecording = () => {
    if (!recording) {
        console.log("开始录音")
        startRecording()
    } else {
        stopRecording()
    }
  }

  const startRecording = () => {
    if(!isConnected) {
      setStatus("请先连接ASR服务器")
      setIsLoading(false)
      connect()
      return
    }
    handleVoiceInput("") // 清空结果
    RecorderManager.start()
    setRecording(true)
    setStatus("录音中...")
  }

  const stopRecording = () => {
    RecorderManager.stop()
    setRecording(false)
    setStatus("录音结束,发送完数据,请等候,正在识别...")
  }

  const handleJsonMessage = (jsonMsg) => {
    try {
      const data = JSON.parse(jsonMsg.data)
      handleVoiceInput(data.text)
      setResult((prevResult) => prevResult + data.text)
    } catch (error) {
      console.error("Error parsing JSON message:", error)
    }
  }

  const handleConnState = (connState) => {
    setIsLoading(false)

    if (connState === 0) {
      setStatus("连接成功!请点击开始")
      setIsConnected(true)
    } else if (connState === 1) {
      setStatus("连接关闭")
      setIsConnected(false)
    } else if (connState === 2) {
      setStatus("连接地址失败,请检查ASR地址和端口。")
      setIsConnected(false)
    }
  }

   
  return (
    <View>
      <TouchableOpacity 
        style={styles.voiceButton} 
        onPress={isConnected ? handleRecording : connect}
      >
        <Icon 
          name={isConnected ? (recording ? "mic" : "mic-outline") : "radio-outline"} 
          size={24} 
          color={recording ? "#ef4444" : "#3b82f6"} 
        />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
    voiceButton: {
        marginHorizontal: 5,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default Microphone;