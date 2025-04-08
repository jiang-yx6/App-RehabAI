"use client"

import { useEffect, useState, useRef } from "react"
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  Animated,
  Modal,
  Dimensions,
} from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import { Swipeable } from "react-native-gesture-handler"
import VideoPlayer from "./VideoPlayer"

const { width, height } = Dimensions.get("window")

const baseURL = "https://yfvideo.hf.free4inno.com/"



const ChooseVideo = ({
  selectedStandardVideo,
  userVideoRecorded,
  onSelectStandardVideo,
  onStartRecording,
  onStartEvaluation,
}) => {
  const [stdVideoList, setStdVideoList] = useState([])
  const swipeableRefs = useRef({})
  const [videoModalVisible, setVideoModalVisible] = useState(false)
  const [selectedVideoForPlayback, setSelectedVideoForPlayback] = useState(null)

  const getVideoList = async () => {
    try {
      const response = await fetch("https://yfvideo.hf.free4inno.com/standard/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      const data = await response.json()
      setStdVideoList(data.videos)
      console.log("videoList is:", data)
    } catch (error) {
      console.error("Error fetching video list:", error)
    }
  }

  useEffect(() => {
    getVideoList()
  }, [])

  // Close all other swipeables when one is opened
  const closeOtherSwipeables = (id) => {
    Object.keys(swipeableRefs.current).forEach((key) => {
      if (key !== id && swipeableRefs.current[key]) {
        swipeableRefs.current[key].close()
      }
    })
  }

  // Handle video playback
  const handlePlayVideo = (item) => {
    setSelectedVideoForPlayback(item.numeric_id)
    setVideoModalVisible(true)

    // Close the swipeable after action
    if (swipeableRefs.current[item.numeric_id]) {
      swipeableRefs.current[item.numeric_id].close()
    }
  }

  // Render right actions (buttons that appear when swiped left)
  const renderRightActions = (item, progress) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [80, 0],
    })

    return (
      <Animated.View
        style={[
          styles.rightAction,
          {
            transform: [{ translateX: trans }],
          },
        ]}
      >
        <TouchableOpacity style={styles.watchButtonContainer} onPress={() => handlePlayVideo(item)}>
          <Ionicons name="eye-outline" size={22} color="#fff" />
          <Text style={styles.watchButtonText}>查看</Text>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  const renderStandardVideoItem = ({ item }) => (
    <Swipeable
      ref={(ref) => {
        if (ref) swipeableRefs.current[item.numeric_id] = ref
      }}
      renderRightActions={(progress) => renderRightActions(item, progress)}
      onSwipeableOpen={() => closeOtherSwipeables(item.numeric_id)}
      overshootRight={false}
    >
      <TouchableOpacity
        style={[styles.videoItem, selectedStandardVideo?.numeric_id === item.numeric_id && styles.selectedVideoItem]}
        onPress={() => onSelectStandardVideo(item)}
      >
        <Image source={{ uri: baseURL + `standard/cover/id/${item.numeric_id}` }} style={styles.thumbnail} />
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle}>{item.tag_string}</Text>
          <Text style={styles.videoDescription} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
        {selectedStandardVideo?.numeric_id === item.numeric_id && (
          <View style={styles.checkmark}>
            <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
          </View>
        )}
      </TouchableOpacity>
    </Swipeable>
  )

  return (
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
          onPress={onStartRecording}
        >
          <Ionicons name="camera-outline" size={24} color={userVideoRecorded ? "#3b82f6" : "#64748b"} />
          <Text style={[styles.buttonText, userVideoRecorded && styles.activeButtonText]}>
            录制用户视频 {userVideoRecorded ? "✓" : ""}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentContainer}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>标准康复动作视频</Text>
          <Text style={styles.swipeHint}>
            <Ionicons name="arrow-back" size={14} color="#64748b" /> 左滑查看视频
          </Text>
        </View>
        <FlatList
          data={stdVideoList}
          renderItem={renderStandardVideoItem}
          keyExtractor={(item) => item.numeric_id}
          horizontal={false}
          scrollEnabled={false}
        />
      </ScrollView>

      <View style={styles.evaluateButtonContainer}>
        <TouchableOpacity
          style={[styles.evaluateButton, (!selectedStandardVideo || !userVideoRecorded) && styles.disabledButton]}
          onPress={onStartEvaluation}
          disabled={!selectedStandardVideo || !userVideoRecorded}
        >
          <Text style={styles.evaluateButtonText}>开始评估</Text>
        </TouchableOpacity>
      </View>

      {/* Video Player Modal */}
      <VideoPlayer
        visible={videoModalVisible}
        videoId={selectedVideoForPlayback}
        onClose={() => setVideoModalVisible(false)}
      />
    </>
  )
}

const styles = StyleSheet.create({
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
  sectionTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
  },
  swipeHint: {
    fontSize: 12,
    color: "#64748b",
    fontStyle: "italic",
  },
  videoItem: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 12,
    marginBottom: 15,
    shadowColor: "#fff",
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
    marginLeft: 5,
    justifyContent: "center",
  },
  videoTitle: {
    fontSize: 14,
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
  // Swipeable styles
  rightAction: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    width: 80,
  },
  watchButtonContainer: {
    backgroundColor: "#3b82f6",
    width: 70,
    height: "100%",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  watchButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },

  
})

export default ChooseVideo

