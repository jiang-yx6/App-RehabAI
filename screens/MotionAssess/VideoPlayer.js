import Video from "react-native-video"
import { BlurView } from "@react-native-community/blur"
import { useState } from "react"
import { Modal, View, Text, TouchableOpacity, Animated, StyleSheet } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"

const baseURL = "https://yfvideo.hf.free4inno.com/"

// Video Player Modal Component
const VideoPlayer = ({ visible, videoId, onClose }) => {
    const [isLoading, setIsLoading] = useState(true)
    const videoUrl = `${baseURL}standard/video/id/${videoId}`
  
    return (
      <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
          <BlurView
            style={styles.blurView}
            blurType="dark"
            blurAmount={5}
            reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.8)"
          >
            <View style={styles.videoPlayerContainer}>
              <View style={styles.videoPlayerHeader}>
                <Text style={styles.videoPlayerTitle}>标准动作视频</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close-circle" size={28} color="#fff" />
                </TouchableOpacity>
              </View>
  
              <View style={styles.videoWrapper}>
                {isLoading && (
                  <View style={styles.loadingContainer}>
                    <Animated.View style={styles.loadingIndicator} />
                    <Text style={styles.loadingText}>视频加载中...</Text>
                  </View>
                )}
  
                <Video
                  source={{ uri: videoUrl }}
                  style={styles.videoPlayer}
                  resizeMode="contain"
                  controls={true}
                  repeat={true}
                  onLoad={() => setIsLoading(false)}
                  onError={(error) => {
                    console.error("Video loading error:", error)
                    setIsLoading(false)
                  }}
                />
              </View>
  
              <View style={styles.videoPlayerFooter}>
                <Text style={styles.videoPlayerInstructions}>请仔细观察标准动作，准备好后可以开始录制</Text>
              </View>
            </View>
          </BlurView>
        </View>
      </Modal>
    )
  }

const styles = StyleSheet.create({
    // Video Player Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  blurView: {
    width: "90%",
    maxWidth: 500,
    borderRadius: 20,
    overflow: "hidden",
  },
  videoPlayerContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 20,
    overflow: "hidden",
    width: "100%",
  },
  videoPlayerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  videoPlayerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 5,
  },
  videoWrapper: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  videoPlayer: {
    width: "100%",
    height: "100%",
  },
  videoPlayerFooter: {
    padding: 15,
    alignItems: "center",
  },
  videoPlayerInstructions: {
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    fontSize: 14,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  loadingIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#3b82f6",
    borderTopColor: "transparent",
    marginBottom: 10,
  },
  loadingText: {
    color: "white",
    fontSize: 14,
  },
})
export default VideoPlayer;
