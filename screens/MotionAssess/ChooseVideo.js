"use client"

import { useEffect, useState, useRef } from "react"
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  StatusBar,
} from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import VideoPlayer from "./VideoPlayer"

const { width } = Dimensions.get("window")
const COLUMN_WIDTH = (width - 40) / 2 // 计算两列布局的每列宽度
import { API_BASE_URL } from "../utils/MyConfig"
import ApiService from "../utils/ApiService"
const ChooseVideo = ({
  selectedStandardVideo,
  userVideoRecorded,
  onSelectStandardVideo,
  onStartRecording,
  onStartEvaluation,
  selectedBodyPart,
}) => {
  const [stdVideoList, setStdVideoList] = useState([])
  const [videoModalVisible, setVideoModalVisible] = useState(false)
  const [selectedVideoForPlayback, setSelectedVideoForPlayback] = useState(null)

  const getVideoList = async () => {
    try {
      const response = await ApiService.motion.getVideoLists()
      setStdVideoList(response.videos)
    } catch (error) {
      console.error("Error fetching video list:", error)
    }
  }

  useEffect(() => {
    getVideoList()
  }, [])

  // 处理视频播放
  const handlePlayVideo = (item) => {
    setSelectedVideoForPlayback(item.numeric_id)
    setVideoModalVisible(true)
  }

  // 渲染单个视频卡片
  const renderVideoCard = ({ item, index }) => {    
    return (
      <TouchableOpacity
        style={[
          styles.videoCard,
          selectedStandardVideo?.numeric_id === item.numeric_id && styles.selectedVideoCard,
          index % 2 === 0 ? { marginRight: 8 } : { marginLeft: 8 }
        ]}
        onPress={() => onSelectStandardVideo(item)}
        activeOpacity={0.8}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: API_BASE_URL + `/standard/cover/id/${item.numeric_id}` }} 
            style={styles.videoImage} 
            resizeMode="cover"
          />
          <TouchableOpacity 
            style={styles.playButton}
            onPress={() => handlePlayVideo(item)}
          >
            <Ionicons name="play-circle" size={36} color="white" />
          </TouchableOpacity>
          
          {selectedStandardVideo?.numeric_id === item.numeric_id && (
            <View style={styles.selectedBadge}>
              <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
            </View>
          )}
        </View>
        
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle}>{item.tag_string}</Text>
          <Text style={styles.videoDescription} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  // 在return之前先过滤数据
  const filteredVideoList = selectedBodyPart 
    ? stdVideoList.filter(item => 
        Object.values(item.tags)
          .filter(tag => tag !== null)
          .some(tag => tag.includes(selectedBodyPart))
      )
    : stdVideoList;

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredVideoList}  // 使用过滤后的列表
        renderItem={renderVideoCard}
        keyExtractor={(item) => item.numeric_id.toString()}
        numColumns={2}
        contentContainerStyle={styles.videoGrid}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.recordButton, userVideoRecorded && styles.activeButton]}
          onPress={onStartRecording}
        >
          <Ionicons 
            name="camera-outline" 
            size={24} 
            color={userVideoRecorded ? "#fff" : "#64748b"} 
          />
          <Text style={[styles.buttonText, userVideoRecorded && styles.activeButtonText]}>
            录制用户视频 {userVideoRecorded ? "✓" : ""}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.evaluateButton, (!selectedStandardVideo || !userVideoRecorded) && styles.disabledButton]}
          onPress={onStartEvaluation}
          disabled={!selectedStandardVideo || !userVideoRecorded}
        >
          <Text style={styles.evaluateButtonText}>开始评估</Text>
        </TouchableOpacity>
      </View>

      {/* 视频播放器弹窗 */}
      <VideoPlayer
        visible={videoModalVisible}
        videoId={selectedVideoForPlayback}
        onClose={() => setVideoModalVisible(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  videoGrid: {
    paddingHorizontal: 12,
    paddingBottom: 100, // 为底部按钮留出空间
    
  },
  videoCard: {
    width: COLUMN_WIDTH,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
    borderWidth: 0.1,
  },
  selectedVideoCard: {
    borderColor: '#3b82f6',
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: COLUMN_WIDTH * 1.2, // 保持一定的宽高比
    overflow: 'hidden',
  },
  videoImage: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -18 }, { translateY: -18 }],
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 24,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 2,
  },
  videoInfo: {
    padding: 12,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  videoDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeButton: {
    backgroundColor: '#4cc9f0',
    borderColor: '#3b82f6',
  },
  buttonText: {
    marginLeft: 8,
    color: '#64748b',
    fontWeight: '500',
    fontSize: 16,
  },
  activeButtonText: {
    color: '#fff',
  },
  evaluateButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 20,
    padding: 15,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  evaluateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default ChooseVideo

