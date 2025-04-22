import React, { useState, useRef } from "react"
import { 
  StyleSheet, 
  View, 
  Text, 
  Modal, 
  ActivityIndicator, 
  Dimensions, 
  Alert, 
  Platform,
  TouchableOpacity,
  StatusBar,
  SafeAreaView
} from "react-native"
import { BlurView } from "@react-native-community/blur"
import { useCameraDevice, useCameraPermission } from "react-native-vision-camera"
import RNFS from "react-native-fs"
import LinearGradient from "react-native-linear-gradient"
import Icon from "react-native-vector-icons/Ionicons"

import ChooseVideo from "./MotionAssess/ChooseVideo"
import ShowCamera from "./MotionAssess/ShowCamera"
import ShowResult from "./MotionAssess/ShowResult"

const { width, height } = Dimensions.get("window")

// Backend API URL
const API_BASE_URL = "https://yfvideo.hf.free4inno.com"

const MotionAssessmentScreen = ({ navigation }) => {
  const [selectedStandardVideo, setSelectedStandardVideo] = useState(null)
  const [userVideoRecorded, setUserVideoRecorded] = useState(false)
  const [userVideoPath, setUserVideoPath] = useState(null)
  const [showCamera, setShowCamera] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingStarted, setRecordingStarted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [resultData, setResultData] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const cameraRef = useRef(null)
  const device = useCameraDevice("front")
  const { hasPermission, requestPermission } = useCameraPermission()

  const handleSelectStandardVideo = (video) => {
    setSelectedStandardVideo(video)
  }

  const handleStartRecording = async () => {
    if (!hasPermission) {
      const granted = await requestPermission()
      if (!granted) {
        Alert.alert("权限请求", "需要相机权限来录制视频", [
          { text: "取消", style: "cancel" },
          { text: "设置", onPress: () => requestPermission() }
        ])
        return
      }
    }

    setShowCamera(true)
  }

  const onClickAtCamera = async () => {
    setCountdown(3)
    const countdownInterval = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(countdownInterval)
          startRecording()
          return null
        }
        return prevCount - 1
      })
    }, 1000)
  }

  const startRecording = async () => {
    if (cameraRef.current && !isRecording) {
      setIsRecording(true)

      try {
        await cameraRef.current.startRecording({
          onRecordingFinished: (video) => {
            console.log("Video recorded:", video.path)
            setUserVideoPath(video.path) // Store the video path for later upload
            setRecordingStarted(false)
            setIsRecording(false)
            setShowCamera(false)
            setUserVideoRecorded(true)
          },
          onRecordingError: (error) => {
            console.error("Error recording video:", error)
            setRecordingStarted(false)
            setIsRecording(false)
            setShowCamera(false)
          },
          audio: false,
        })
        setRecordingStarted(true)

        setTimeout(() => {
          if (recordingStarted) {
            stopRecording()
          }
        }, 5000)
      } catch (error) {
        console.error("Error starting video recording:", error)
        setIsRecording(false)
        setRecordingStarted(false)
      }
    }
  }

  const stopRecording = async () => {
    if (cameraRef.current && recordingStarted) {
      try {
        await cameraRef.current.stopRecording()
        console.log("视频录制结束")
      } catch (error) {
        console.error("Error stopping recording:", error)
        setRecordingStarted(false)
        setIsRecording(false)
        setShowCamera(false)
      }
    }
  }

  // Convert video file to Base64
  const convertVideoToBase64 = async (filePath) => {
    try {
      const base64 = await RNFS.readFile(filePath, "base64")
      return base64
    } catch (error) {
      console.error("Error converting video to Base64:", error)
      return null
    }
  }

  // Upload video to server
  const uploadVideo = async () => {
    if (!userVideoPath) {
      console.error("No user video path available")
      return null
    }

    try {
      // Convert video to Base64
      const base64Video = await convertVideoToBase64(userVideoPath)
      if (!base64Video) {
        throw new Error("Failed to convert video to Base64")
      }

      const requestBody = {
        exercise: base64Video,
        standard_numeric_id: selectedStandardVideo.numeric_id.toString(),
      }

      console.log("Uploading video to server...")

      const response = await fetch(`${API_BASE_URL}/upload-video/`, {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("Upload result:", result)
      return result
    } catch (error) {
      console.error("Error uploading video:", error)
      return null
    }
  }

  // Get assessment results from server
  const getAssessmentResults = async (assessmentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/assessment/result/${assessmentId}`)

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("Assessment results:", result)
      return result
    } catch (error) {
      console.error("Error getting assessment results:", error)
      return null
    }
  }

  const handleStartEvaluation = async () => {
    if (!selectedStandardVideo || !userVideoRecorded) {
      Alert.alert("提示", "请先选择标准视频并录制用户视频")
      return
    }

    setIsEvaluating(true)
    setUploadProgress(0)

    try {
      // Step 1: Upload the video and get assessment ID
      setUploadProgress(10)
      const uploadResult = await uploadVideo()

      if (!uploadResult) {
        throw new Error("Failed to upload video")
      }

      setUploadProgress(50)
      
      // 模拟进度增加
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return 95
          }
          return prev + 5
        })
      }, 300)

      // 延迟一下，模拟处理时间
      setTimeout(() => {
        clearInterval(progressInterval)
        setUploadProgress(100)
        setResultData(uploadResult)
        setIsEvaluating(false)
        setShowResults(true)
      }, 2000)
    } catch (error) {
      console.error("Evaluation error:", error)
      Alert.alert("评估失败", "无法完成动作评估，请重试。" + (error.message || ""), [
        { text: "确定", onPress: () => setIsEvaluating(false) },
      ])
    }
  }

  const handleReset = () => {
    setSelectedStandardVideo(null)
    setUserVideoRecorded(false)
    setUserVideoPath(null)
    setShowResults(false)
    setResultData(null)
    setUploadProgress(0)
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* 背景渐变 */}
      <LinearGradient
        colors={['#53bee8', '#128aea', '#4cc9f0']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.background}
      />
      
      {/* 顶部导航栏 */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>动作评估</Text>
        <TouchableOpacity 
          style={styles.helpButton}
          onPress={() => Alert.alert("帮助", "动作评估功能可以帮助您评估康复动作的准确性。\n\n1. 选择标准视频\n2. 录制您的动作\n3. 开始评估\n4. 查看结果")}
        >
          <Icon name="help-circle-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>
      
      {/* 主内容区域 */}
      <View style={styles.contentContainer}>
        {!showResults ? (
          <View style={styles.chooseVideoContainer}>
            <ChooseVideo
              selectedStandardVideo={selectedStandardVideo}
              userVideoRecorded={userVideoRecorded}
              onSelectStandardVideo={handleSelectStandardVideo}
              onStartRecording={handleStartRecording}
              onStartEvaluation={handleStartEvaluation}
              customStyles={chooseVideoStyles}
            />
          </View>
        ) : (
          <View style={styles.resultContainer}>
            <ShowResult
              resultData={resultData}
              onReset={handleReset}
              customStyles={resultStyles}
            />
          </View>
        )}
      </View>

      {/* 相机组件 */}
      <ShowCamera
        showCamera={showCamera}
        device={device}
        cameraRef={cameraRef}
        countdown={countdown}
        isRecording={isRecording}
        recordingStarted={recordingStarted}
        onStopRecording={stopRecording}
        onClickAtCamera={onClickAtCamera}
        onCloseCamera={() => setShowCamera(false)}
        customStyles={cameraStyles}
      />

      {/* 评估加载模态框 */}
      <Modal visible={isEvaluating} transparent={true} animationType="fade">
        <View style={styles.loadingModalContainer}>
          <BlurView
            style={styles.loadingBlur}
            blurType="light"
            blurAmount={10}
            reducedTransparencyFallbackColor="white"
          >
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color="#4361ee" />
              <Text style={styles.loadingText}>{uploadProgress < 50 ? "正在上传视频..." : "正在评估动作..."}</Text>
              {/* Progress indicator */}
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
              </View>
              <Text style={styles.progressText}>{uploadProgress}%</Text>
            </View>
          </BlurView>
        </View>
      </Modal>
    </View>
  )
}

// 为子组件提供的自定义样式
const chooseVideoStyles = {
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  videoItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  videoItemSelected: {
    backgroundColor: 'rgba(67, 97, 238, 0.3)',
    borderColor: '#4361ee',
  },
  videoTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  videoDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: 'rgba(67, 97, 238, 0.8)',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(100, 116, 139, 0.5)',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  recordedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  recordedText: {
    color: '#4ade80',
    marginLeft: 5,
    fontSize: 14,
  }
}

const cameraStyles = {
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  camera: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  controlsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 15,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 10,
  },
  captureButton: {
    backgroundColor: '#4361ee',
    borderRadius: 35,
    height: 70,
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    color: '#fff',
    fontSize: 60,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  recordingIndicator: {
    backgroundColor: 'rgba(239, 68, 68, 0.7)',
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 15,
  }
}

const resultStyles = {
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  scoreContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  scoreText: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
  },
  feedbackContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  feedbackTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  feedbackText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    lineHeight: 22,
  },
  button: {
    backgroundColor: 'rgba(67, 97, 238, 0.8)',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 16,
    paddingHorizontal: 20,
    paddingBottom: 10,
    zIndex: 10,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  helpButton: {
    position: 'absolute',
    right: 20,
    top: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 10,
  },
  chooseVideoContainer: {
    flex: 1,
  },
  resultContainer: {
    flex: 1,
  },
  loadingModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  loadingBlur: {
    width: 220,
    height: 220,
    borderRadius: 20,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
    marginBottom: 10,
  },
  progressContainer: {
    width: "80%",
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 10,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4361ee",
  },
  progressText: {
    marginTop: 5,
    fontSize: 14,
    color: "#fff",
  },
})

export default MotionAssessmentScreen