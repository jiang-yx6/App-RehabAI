import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Camera } from 'react-native-vision-camera';
import Ionicons from "react-native-vector-icons/Ionicons";

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
      size={50}
      color={isRecording ? "#ef4444" : "white"} 
    />
    <Text style={{position: 'absolute', bottom: -30, color: 'white'}}>{isRecording ? "停止" : "开始"}</Text>
  </TouchableOpacity>
);

const ShowCamera = ({
  showCamera,
  device,
  cameraRef,
  countdown,
  isRecording,
  recordingStarted,
  onStopRecording,
  onClickAtCamera,
  onCloseCamera,
}) => {
  return (
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
          onStopRecording={onStopRecording}
          onClose={onCloseCamera}
          onClickAtCamera={onClickAtCamera}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    backgroundColor: "black",
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
});

export default ShowCamera;