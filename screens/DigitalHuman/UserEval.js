import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons"
const API_BASE_URL = "https://yfvideo.hf.free4inno.com"

const UserEval = ({showChat,isConnected,setShowChat,messages}) => {
  const [rating, setRating] = useState({});
  const handleRating = (star,type) => {
    setRating(prev => ({...prev,[type]:star}));
  }

  const setShowModal = () => {
    setShowChat(!showChat);
  }

  const uploadRating = () => {
    setShowChat(!showChat);
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
  }

  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={isConnected&&!showChat}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.ratingModalContainer}>
            <View style={styles.ratingModalContent}>
                <Text style={styles.ratingModalTitle}>请对本次对话进行评价</Text>
                <Text style={[{fontSize:20,color:"rgba(0,0,0,0.8)"}]}>回答准确度</Text>
                <View style={styles.ratingContainer}>
                    {[1,2,3,4,5].map((star) => (
                        <TouchableOpacity key={star} onPress={() => handleRating(star,"accuracy")} >
                            <Icon name={star <= rating["accuracy"]   ? "star" : "star-outline"} size={30} color="skyblue"/>
                        </TouchableOpacity>
                    ))}
                </View>
                <Text style={[{fontSize:20,color:"rgba(0,0,0,0.8)"}]}>回答流畅度</Text>
                <View style={styles.ratingContainer}>
                    {[1,2,3,4,5].map((star) => (
                        <TouchableOpacity key={star} onPress={() => handleRating(star,"fluency")} >
                            <Icon name={star <= rating["fluency"] ? "star" : "star-outline"} size={30} color="skyblue"/>
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
    </View>
  );
};

const styles = StyleSheet.create({
  ratingModalContainer:{
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  ratingModalContent:{
    width: "80%",
    height: "40%",
    backgroundColor: "rgb(255,255,255)",
    boxShadow: "0 0 10px 0 rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 20,
    justifyContent: "space-between",
  },
  ratingModalTitle:{
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  ratingContainer:{
    flexDirection:"row",
    justifyContent:"space-around",
  },
 
  ratingButtonsContainer:{
    flexDirection:"row",
    justifyContent:"space-between",
  },
  ratingButton:{
    backgroundColor:"#4361eed6",
    padding: 15,
    borderRadius: 20,
    width: "40%",
  },
  ratingButtonText:{
    color:"white",
    textAlign:"center",
    fontSize: 16,
  }
});

export default UserEval;