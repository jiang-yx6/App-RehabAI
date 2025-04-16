import { StyleSheet, View, Text, Modal, TouchableOpacity, Dimensions, Platform } from "react-native"
import Video from "react-native-video"

const { width, height } = Dimensions.get("window")

const HlsVideo = ({ visible, videoId, onClose }) => {
  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {videoId ? (
            <Video
              source={{ uri: videoId }}
              style={styles.video}
              controls={true}
              resizeMode="contain"
              // 添加HLS特定配置
              ignoreSilentSwitch="ignore"
              playInBackground={false}
              playWhenInactive={false}
              progressUpdateInterval={250}
              // 添加平台特定配置
              {...(Platform.OS === "ios"
                ? {
                    fullscreenAutorotate: true,
                    fullscreen: false,
                  }
                : {
                    // Android特定配置
                    minLoadRetryCount: 5,
                    bufferConfig: {
                      minBufferMs: 15000,
                      maxBufferMs: 50000,
                      bufferForPlaybackMs: 2500,
                      bufferForPlaybackAfterRebufferMs: 5000,
                    },
                  })}
              onError={(error) => {
                console.error("Video playback error:", error)
              }}
            />
          ) : (
            <Text>No video available</Text>
          )}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.textStyle}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: width * 0.9,
    height: height * 0.7,
  },
  closeButton: {
    backgroundColor: "#2196F3",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  video: {
    width: width * 0.8,
    height: height * 0.5,
    backgroundColor: "#000",
  },
})

export default HlsVideo
