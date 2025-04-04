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

  const onClickAtCamera = async ()=>{
    // Start countdown
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

        // 设置5秒后自动停止录制
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
      // Generate mock evaluation results
      const score = Math.floor(Math.random() * 31) + 70 // Score between 70-100
      const frames = Array.from({ length: 10 }, (_, i) => ({
        frame: i + 1,
        score: Math.floor(Math.random() * 31) + 70,
      }))

      // Find worst frames (lowest scores)
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

  const renderStandardVideoItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.videoItem, selectedStandardVideo?.id === item.id && styles.selectedVideoItem]}
      onPress={() => handleSelectStandardVideo(item)}
    >
      <Image source={item.thumbnail} style={styles.thumbnail} />
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle}>{item.title}</Text>
        <Text style={styles.videoDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      {selectedStandardVideo?.id === item.id && (
        <View style={styles.checkmark}>
          <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
        </View>
      )}
    </TouchableOpacity>
  )
  const CameraControls = ({ isRecording, onStopRecording, onClose, onClickAtCamera }) => (
    <TouchableOpacity
      style={{
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 40,
      }}
      onPress={isRecording ? onStopRecording : onClickAtCamera}
    >
      <Ionicons 
        name={isRecording ? "stop-circle" : "camera-outline"} 
        size={64}
        color={isRecording ? "#ef4444" : "white"} 
      />
      <Text style={{position: 'absolute', bottom: -30, color: 'white'}}>{isRecording ? "停止" : "开始"}</Text>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      {!showResults ? (
        <>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, selectedStandardVideo && styles.activeButton]}
              onPress={() => {}}
            >
              <Ionicons name="videocam-outline" size={24} color={selectedStandardVideo ? "#3b82f6" : "#64748b"} />
              <Text style={[styles.buttonText, selectedStandardVideo && styles.activeButtonText]}>
                选择标准视频 {selectedStandardVideo ? "✓" : ""}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, userVideoRecorded && styles.activeButton]}
              onPress={handleStartRecording}
            >
              <Ionicons name="camera-outline" size={24} color={userVideoRecorded ? "#3b82f6" : "#64748b"} />
              <Text style={[styles.buttonText, userVideoRecorded && styles.activeButtonText]}>
                录制用户视频 {userVideoRecorded ? "✓" : ""}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>标准康复动作视频</Text>
            <FlatList
              data={standardVideos}
              renderItem={renderStandardVideoItem}
              keyExtractor={(item) => item.id}
              horizontal={false}
              scrollEnabled={false}
            />
          </ScrollView>

          <View style={styles.evaluateButtonContainer}>
            <TouchableOpacity
              style={[styles.evaluateButton, (!selectedStandardVideo || !userVideoRecorded) && styles.disabledButton]}
              onPress={handleStartEvaluation}
              disabled={!selectedStandardVideo || !userVideoRecorded}
            >
              <Text style={styles.evaluateButtonText}>开始评估</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <ScrollView style={styles.resultsContainer} contentContainerStyle={styles.resultsContent}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreTitle}>动作评估得分</Text>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreValue}>{evaluationScore}</Text>
              <Text style={styles.scoreMax}>/100</Text>
            </View>
            <Text style={styles.scoreDescription}>
              {evaluationScore >= 90 ? "优秀" : evaluationScore >= 80 ? "良好" : "需要改进"}
            </Text>
          </View>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>每帧得分</Text>
            <ScrollView 
              horizontal={true} 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chartScrollContent}
            >
            <LineChart
              data={{
                labels: ["January", "February", "March", "April", "May", "June"],
                datasets: [
                  {
                    data: [
                      Math.random() * 100,
                      Math.random() * 100,
                      Math.random() * 100,
                      Math.random() * 100,
                      Math.random() * 100,
                      Math.random() * 100
                    ]
                  }
                ]
              }}
              width={Math.max(width - 40, frameScores.length * 50)}              
              height={220}
              yAxisLabel="$"
              yAxisSuffix="k"
              yAxisInterval={1} // optional, defaults to 1
              chartConfig={{
                backgroundColor: "#3b82f6",
                backgroundGradientFrom: "#fb8c00",
                backgroundGradientTo: "#ffa726",
                decimalPlaces: 2, // optional, defaults to 2dp
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: "#ffa726"
                }
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16
              }}/>
              </ScrollView>
          </View>

          <View style={styles.worstFramesContainer}>
            <Text style={styles.worstFramesTitle}>需要改进的动作帧</Text>
            <View style={styles.worstFramesGrid}>
              {worstFrames.map((frame, index) => (
                <View key={index} style={styles.worstFrameItem}>
                  {/* <Image source={require("../assets/frame-placeholder.png")} style={styles.worstFrameImage} /> */}
                  <View style={styles.worstFrameInfo}>
                    <Text style={styles.worstFrameNumber}>帧 {frame.frame}</Text>
                    <Text style={styles.worstFrameScore}>得分: {frame.score}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>重新选择</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Camera Modal */}
      <Modal visible={showCamera} transparent={true} animationType="slide">
        <View style={styles.cameraContainer}>


          {device && (
            <Camera
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={true}
              video={true}
              audio={false}
            />
          )}

          {countdown !== null && (
            <View style={styles.countdownContainer}>
              <Text style={styles.countdownText}>{countdown}</Text>
            </View>
          )}

          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>录制中...</Text>
            </View>
          )}

          <CameraControls 
            isRecording={isRecording}
            onStopRecording={stopRecording}
            onClose={() => setShowCamera(false)}
            onClickAtCamera={onClickAtCamera}
          />
          {/* <TouchableOpacity
            style={styles.closeCameraButton}
            onPress={() => {
              if (recordingStarted) {
                stopRecording()
              } else {
                setShowCamera(false)
              }
            }}
          >
            <Icon name="close-circle" size={36} color="white" />
          </TouchableOpacity> */}
        </View>
      </Modal>

      {/* Evaluation Loading Modal */}
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
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "white",
    borderRadius: 15,
    margin: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    flex: 1,
    marginHorizontal: 5,
    justifyContent: "center",
  },
  activeButton: {
    backgroundColor: "#dbeafe",
  },
  buttonText: {
    marginLeft: 8,
    color: "#64748b",
    fontWeight: "500",
  },
  activeButtonText: {
    color: "#3b82f6",
  },
  contentContainer: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 15,
  },
  videoItem: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedVideoItem: {
    borderColor: "#3b82f6",
    borderWidth: 2,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#e2e8f0",
  },
  videoInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 4,
  },
  videoDescription: {
    fontSize: 14,
    color: "#64748b",
  },
  checkmark: {
    justifyContent: "center",
    alignItems: "center",
    width: 30,
  },
  evaluateButtonContainer: {
    padding: 15,
  },
  evaluateButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: "#94a3b8",
  },
  evaluateButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
  },
  countdownContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  countdownText: {
    fontSize: 120,
    fontWeight: "bold",
    color: "white",
    opacity: 0.8,
  },
  recordingIndicator: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ef4444",
    marginRight: 8,
  },
  recordingText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  closeCameraButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
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
  resultsContainer: {
    flex: 1,
    padding: 15,
  },
  resultsContent: {
    paddingBottom: 30,
  },
  scoreContainer: {
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 15,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#3b82f6",
  },
  scoreMax: {
    fontSize: 16,
    color: "#64748b",
  },
  scoreDescription: {
    fontSize: 16,
    fontWeight: "500",
    color: "#3b82f6",
  },
  chartContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center', // 居中对齐
  },

  chartScrollContent: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 15,
    textAlign: 'center', // 标题居中

  },
  chart: {
    borderRadius: 15,
    marginVertical: 8,
  },
  worstFramesContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  worstFramesTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 15,
  },
  worstFramesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  worstFrameItem: {
    width: "30%",
    marginBottom: 15,
  },
  worstFrameImage: {
    width: "100%",
    height: 100,
    borderRadius: 10,
    backgroundColor: "#e2e8f0",
    marginBottom: 5,
  },
  worstFrameInfo: {
    alignItems: "center",
  },
  worstFrameNumber: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
  },
  worstFrameScore: {
    fontSize: 12,
    color: "#64748b",
  },
  resetButton: {
    backgroundColor: "#f1f5f9",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  resetButtonText: {
    color: "#334155",
    fontSize: 16,
    fontWeight: "500",
  },
})

export default MotionAssessmentScreen

