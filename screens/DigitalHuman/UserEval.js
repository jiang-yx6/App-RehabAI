import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons"
const API_BASE_URL = "https://yfvideo.hf.free4inno.com"
const { width, height } = Dimensions.get("window")

// 添加响应式设计辅助函数
const normalize = (size) => {
  return Math.round(size * Math.min(width / 375, height / 812))
}

const UserEval = ({isShowEval, isConnected, setIsShowEval, messages, children}) => {
  const [rating, setRating] = useState({});
  const [showRating, setShowRating] = useState(false);
  
  const handleRating = (star,type) => {
    setRating(prev => ({...prev,[type]:star}));
  }

  const setShowModal = () => {
    setShowRating(false);
    setIsShowEval(false);
    setRating({});

  }

  const uploadRating = () => {
    setShowRating(false);

    console.log("rating is:",rating);
    console.log("messages is:",messages);
    const date = new Date();
    const formattedDate = date.getFullYear() + '-' + 
                         String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                         String(date.getDate()).padStart(2, '0');
    console.log(formattedDate);

    fetch(API_BASE_URL + "/api/feedback/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rating: rating,
        messages: messages,
        date: formattedDate
      })
    })
    .then(response => {response.json()
          console.log("response is:",response)})
    
    
    setIsShowEval(false);
    setRating({});

  }

  // 当聊天窗口关闭时，显示评分界面
  React.useEffect(() => {
    if (isShowEval && isConnected) {
      setShowRating(true);
    }
  }, [isShowEval, isConnected]);

  return (
    <View style={styles.container}>
      {/* 评分模态框 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showRating}
        onRequestClose={() => {
          setShowRating(false);
          setIsShowEval(false);
        }}
      >
        <View style={styles.ratingModalContainer}>
          <View style={styles.ratingModalContent}>
            <Text style={styles.ratingModalTitle}>请对本次对话进行评价</Text>
            <Text style={[{fontSize: normalize(20), color:"rgba(0,0,0,0.8)"}]}>回答准确度</Text>
            <View style={styles.ratingContainer}>
              {[1,2,3,4,5].map((star) => (
                <TouchableOpacity key={star} onPress={() => handleRating(star,"accuracy")} >
                  <Icon name={star <= rating["accuracy"] ? "star" : "star-outline"} size={normalize(30)} color="skyblue"/>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[{fontSize: normalize(20), color:"rgba(0,0,0,0.8)"}]}>回答流畅度</Text>
            <View style={styles.ratingContainer}>
              {[1,2,3,4,5].map((star) => (
                <TouchableOpacity key={star} onPress={() => handleRating(star,"fluency")} >
                  <Icon name={star <= rating["fluency"] ? "star" : "star-outline"} size={normalize(30)} color="skyblue"/>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.ratingButtonsContainer}>
              <TouchableOpacity style={styles.ratingButton} onPress={setShowModal}>
                <Text style={styles.ratingButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ratingButton} onPress={uploadRating}>
                <Text style={styles.ratingButtonText}>提交</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 聊天窗口 */}
      {isShowEval && (
        <View style={styles.chatContainer}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: height * 0.6 + height * 0.02, // 位于主聊天窗口上方
    left: 0,
    right: 0,
    zIndex: 30,
  },
  chatContainer: {
    margin: width * 0.025,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: normalize(15),
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  ratingModalContainer:{
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  ratingModalContent:{
    width: width * 0.8,
    backgroundColor: "rgb(255,255,255)",
    borderRadius: normalize(20),
    padding: width * 0.05,
    justifyContent: "space-between",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  ratingModalTitle:{
    fontSize: normalize(20),
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: height * 0.02,
  },
  ratingContainer:{
    flexDirection:"row",
    justifyContent:"space-around",
    marginVertical: height * 0.015,
  },
  ratingButtonsContainer:{
    flexDirection:"row",
    justifyContent:"space-between",
    marginTop: height * 0.02,
  },
  ratingButton:{
    backgroundColor:"#4361eed6",
    padding: width * 0.035,
    borderRadius: normalize(20),
    width: "40%",
  },
  ratingButtonText:{
    color:"white",
    textAlign:"center",
    fontSize: normalize(16),
  }
});

export default UserEval;