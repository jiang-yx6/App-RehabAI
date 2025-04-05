"use client"

import { useState, useRef } from "react"
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  Modal,
  ActivityIndicator,
  Dimensions,
  PermissionsAndroid,
} from "react-native"
import { BlurView } from "@react-native-community/blur"
import Ionicons from "react-native-vector-icons/Ionicons"
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera'
import { LineChart } from "react-native-chart-kit"

import ChooseVideo from '../components/ChooseVideo'
import ShowCamera from '../components/ShowCamera'
import ShowResult from '../components/ShowResult'

const { width } = Dimensions.get("window")

// Mock data for standard videos
const standardVideos = [
  {
    id: "1",
    title: "肩部康复动作",
    thumbnail: require("../assets/shoulder.png"),
    description: "适用于肩周炎和肩部术后康复",
  },
  {
    id: "2",
    title: "膝盖康复动作",
    thumbnail: require("../assets/knee.png"),
    description: "适用于膝关节损伤和术后康复",
  },
  {
    id: "3",
    title: "腰部康复动作",
    thumbnail: require("../assets/back.png"),
    description: "适用于腰椎间盘突出和腰肌劳损",
  },
//   { id: "4", title: "颈部康复动作", thumbnail: require("../assets/neck.png"), description: "适用于颈椎病和颈部疼痛" },
]

const MotionAssessmentScreen = () => {
  const [selectedStandardVideo, setSelectedStandardVideo] = useState(null)
  const [userVideoRecorded, setUserVideoRecorded] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingStarted, setRecordingStarted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evaluationScore, setEvaluationScore] = useState(null)
  const [frameScores, setFrameScores] = useState([])
  const [worstFrames, setWorstFrames] = useState([])

  const cameraRef = useRef(null)
  const device = useCameraDevice('front')
  const { hasPermission, requestPermission } = useCameraPermission()

  const handleSelectStandardVideo = (video) => {
    setSelectedStandardVideo(video)
  }

  const handleStartRecording = async () => {
    if (!hasPermission) {
      const granted = await requestPermission()
      if (!granted) {
        alert("需要相机权限来录制视频")
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
          audio: false
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
      } catch (error) {
        console.error("Error stopping recording:", error)
        setRecordingStarted(false)
        setIsRecording(false)
        setShowCamera(false)
      }
    }
  }

  const handleStartEvaluation = () => {
    if (!selectedStandardVideo || !userVideoRecorded) {
      alert("请先选择标准视频并录制用户视频")
      return
    }
    
    
    setIsEvaluating(true)

    // Simulate evaluation process
    setTimeout(() => {
      const score = Math.floor(Math.random() * 31) + 70
      const frames = Array.from({ length: 10 }, (_, i) => ({
        frame: i + 1,
        score: Math.floor(Math.random() * 31) + 70,
      }))

      const sortedFrames = [...frames].sort((a, b) => a.score - b.score)
      const worst = sortedFrames.slice(0, 3)

      setEvaluationScore(score)
      setFrameScores(frames)
      setWorstFrames(worst)

      setIsEvaluating(false)
      setShowResults(true)
    }, 2000)
  }

  const handleReset = () => {
    setSelectedStandardVideo(null)
    setUserVideoRecorded(false)
    setShowResults(false)
    setEvaluationScore(null)
    setFrameScores([])
    setWorstFrames([])
  }

  return (
    <View style={styles.container}>
      {!showResults ? (
        <ChooseVideo
          selectedStandardVideo={selectedStandardVideo}
          userVideoRecorded={userVideoRecorded}
          onSelectStandardVideo={handleSelectStandardVideo}
          onStartRecording={handleStartRecording}
          onStartEvaluation={handleStartEvaluation}
        />
      ) : (
        <ShowResult
          evaluationScore={evaluationScore}
          frameScores={frameScores}
          worstFrames={worstFrames}
          onReset={handleReset}
        />
      )}

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
      />

      <Modal visible={isEvaluating} transparent={true} animationType="fade">
        <View style={styles.loadingModalContainer}>
          <BlurView
            style={styles.loadingBlur}
            blurType="light"
            blurAmount={10}
            reducedTransparencyFallbackColor="white"
          >
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>正在评估动作...</Text>
            </View>
          </BlurView>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f8ff",
  },
  loadingModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  loadingBlur: {
    width: 200,
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#334155",
    fontWeight: "500",
  },
})

export default MotionAssessmentScreen

