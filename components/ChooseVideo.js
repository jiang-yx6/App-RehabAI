import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

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
];

const ChooseVideo = ({ 
  selectedStandardVideo, 
  userVideoRecorded, 
  onSelectStandardVideo, 
  onStartRecording, 
  onStartEvaluation 
}) => {
  const renderStandardVideoItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.videoItem, selectedStandardVideo?.id === item.id && styles.selectedVideoItem]}
      onPress={() => onSelectStandardVideo(item)}
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
  );

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
          onPress={onStartEvaluation}
          disabled={!selectedStandardVideo || !userVideoRecorded}
        >
          <Text style={styles.evaluateButtonText}>开始评估</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

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
});

export default ChooseVideo; 