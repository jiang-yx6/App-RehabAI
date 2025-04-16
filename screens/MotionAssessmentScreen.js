import React, { useState, useRef } from "react"
import { StyleSheet, View, Text, Modal, ActivityIndicator, Dimensions, Alert, Platform } from "react-native"
import { BlurView } from "@react-native-community/blur"
import { useCameraDevice, useCameraPermission } from "react-native-vision-camera"
import RNFS from "react-native-fs"

import ChooseVideo from "./MotionAssess/ChooseVideo"
import ShowCamera from "./MotionAssess/ShowCamera"
import ShowResult from "./MotionAssess/ShowResult"

const { width } = Dimensions.get("window")

// Backend API URL
const API_BASE_URL = "https://yfvideo.hf.free4inno.com"

const MotionAssessmentScreen = () => {
  const [selectedStandardVideo, setSelectedStandardVideo] = useState(null)
  const [userVideoRecorded, setUserVideoRecorded] = useState(false)
  const [userVideoPath, setUserVideoPath] = useState(null)
  const [showCamera, setShowCamera] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingStarted, setRecordingStarted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  // const [evaluationScore, setEvaluationScore] = useState(null)
  // const [frameScores, setFrameScores] = useState([])
  // const [worstFrames, setWorstFrames] = useState([])
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
      console.log("exercise:",requestBody.exercise.substring(0,100))
      console.log("standard_numeric_id:",requestBody.standard_numeric_id)
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
        throw new Error("Failed to upload video or get assessment ID")
      }

      setUploadProgress(50)

      // Step 2: Get assessment results using the assessment ID
      const assessmentResult = uploadResult;

      if (!assessmentResult) {
        throw new Error("Failed to get assessment results")
      }
      setResultData(assessmentResult)

      setUploadProgress(100)

      // Step 3: Process and display the results
      // This is just an example - adjust according to your actual API response structure
      // const score = assessmentResult.overall_score || Math.floor(Math.random() * 31) + 70
      // Process frame scores if available

      // Show results
      setIsEvaluating(false)
      setShowResults(true)

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
          resultData={resultData}
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
    width: "100%",
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#334155",
    fontWeight: "500",
    marginBottom: 10,
  },
  progressContainer: {
    width: "80%",
    height: 6,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 10,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#3b82f6",
  },
  progressText: {
    marginTop: 5,
    fontSize: 12,
    color: "#64748b",
  },
})

export default MotionAssessmentScreen