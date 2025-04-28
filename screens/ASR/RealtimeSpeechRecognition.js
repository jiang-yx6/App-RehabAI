"use client"

// RealtimeSpeechRecognition.js
import { useEffect, useState, useRef } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native"
import WebSocketManager from "../utils/WebSocketManager"
import RecorderManager from "../utils/RecorderManager"

const RealtimeSpeechRecognition = () => {
  const [recording, setRecording] = useState(false)
  const [result, setResult] = useState("")
  const [status, setStatus] = useState("点击连接")
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const scrollViewRef = useRef(null)

  useEffect(() => {
    const initRecorder = async () => {
      await RecorderManager.init()
    }

    initRecorder()

    return () => {
      RecorderManager.cleanup()
      WebSocketManager.close()
    }
  }, [])

  useEffect(() => {
    // Scroll to bottom when result changes
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true })
    }
  }, [result])

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

  const startRecording = () => {
    setResult("")
    RecorderManager.start()
    setRecording(true)
    setStatus("录音中...")
  }

  const stopRecording = () => {
    RecorderManager.stop()
    setRecording(false)
    setStatus("发送完数据,请等候,正在识别...")

    setTimeout(() => {
      WebSocketManager.close()
      setStatus("请点击连接")
      setIsConnected(false)
    }, 3000)
  }

  const handleJsonMessage = (jsonMsg) => {
    try {
      const data = JSON.parse(jsonMsg.data)
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
    <View style={styles.container}>
      <Text style={styles.title}>实时语音识别</Text>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>{status}</Text>
        {isLoading && <ActivityIndicator size="small" color="#3b82f6" />}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isConnected ? styles.buttonDisabled : styles.buttonEnabled]}
          onPress={connect}
          disabled={isConnected || isLoading}
        >
          <Text style={styles.buttonText}>连接</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, !isConnected || recording ? styles.buttonDisabled : styles.buttonEnabled]}
          onPress={startRecording}
          disabled={!isConnected || recording}
        >
          <Text style={styles.buttonText}>开始</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, !recording ? styles.buttonDisabled : styles.buttonEnabled]}
          onPress={stopRecording}
          disabled={!recording}
        >
          <Text style={styles.buttonText}>停止</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>识别结果:</Text>
        <ScrollView ref={scrollViewRef} style={styles.resultScrollView} contentContainerStyle={styles.resultContent}>
          <Text style={styles.resultText}>{result}</Text>
        </ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f0f8ff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3b82f6",
    textAlign: "center",
    marginVertical: 16,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    color: "#334155",
    marginRight: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  buttonEnabled: {
    backgroundColor: "#3b82f6",
  },
  buttonDisabled: {
    backgroundColor: "#94a3b8",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  resultContainer: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  resultScrollView: {
    flex: 1,
  },
  resultContent: {
    paddingBottom: 16,
  },
  resultText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#1e293b",
  },
})

export default RealtimeSpeechRecognition
