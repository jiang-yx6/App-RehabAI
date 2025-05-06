import React, { useEffect } from "react"
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ImageBackground,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
  SafeAreaView
} from "react-native"
import LinearGradient from "react-native-linear-gradient"

const { width, height } = Dimensions.get('window')

const HomeScreen = ({ navigation }) => {
  // 动画值
  const fadeAnim = new Animated.Value(0)
  const slideAnim = new Animated.Value(50)
  const scaleAnim = new Animated.Value(0.95)
  
  useEffect(() => {
    // 组件加载时启动动画
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start()
  }, [])

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* 全屏背景图片 */}
      <ImageBackground 
        source={require("../assets/doctor.jpg")} 
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        {/* 渐变遮罩层 - 增强可读性同时展示背景 */}
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)']}
          locations={[0, 0.8]}
          style={styles.gradient}
        />
        
        <SafeAreaView style={styles.safeArea}>
          {/* 标题区域 - 已移至顶部 */}
          <Animated.View 
            style={[
              styles.headerContainer, 
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            <Text style={styles.title}>康途向导</Text>
            <Text style={styles.subtitle}>智能辅助您的康复之旅</Text>
          </Animated.View>

          <View style={styles.contentContainer}>
            {/* Logo区域 - 移至中部 */}
            <Animated.View 
              style={[
                styles.logoContainer, 
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              {/* <View style={styles.logoCircle}>
                <Text style={styles.logoText}>康</Text>
              </View> */}
            </Animated.View>

            {/* 动画按钮区域 */}
            <Animated.View 
              style={[
                styles.buttonContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <TouchableOpacity 
                style={styles.buttonWrapper} 
                activeOpacity={0.8}
                onPress={() => navigation.navigate("DigitalHuman")}
              >
                <LinearGradient
                  colors={['#4361ee', '#3a0ca3']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.button}
                >
                  <View style={styles.buttonIconContainer}>
                    <View style={styles.buttonIcon} />
                  </View>
                  <Text style={styles.buttonText}>数字人交互</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.buttonWrapper} 
                activeOpacity={0.8}
                onPress={() => navigation.navigate("MotionAssessment")}
              >
                <LinearGradient
                  colors={['#4cc9f0', '#4361ee']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.button}
                >
                  <View style={styles.buttonIconContainer}>
                    <View style={styles.buttonIcon} />
                  </View>
                  <Text style={styles.buttonText}>动作评估</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
            
            {/* 底部装饰元素 */}
            <Animated.View 
              style={[
                styles.footer,
                {
                  opacity: fadeAnim,
                }
              ]}
            >
              <View style={styles.footerLine} />
              <Text style={styles.footerText}>智慧康复 · 科技护航</Text>
            </Animated.View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  backgroundImage: {
    resizeMode: "cover",
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    alignItems: "center",
    paddingTop: StatusBar.currentHeight + height*0.03,
    paddingHorizontal: width*0.05,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 16,
    color: "#f8fafc",
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
    padding: 24,
    paddingTop: height*0.1,
    paddingBottom: height*0.05,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: width*0.05,
  },
  buttonWrapper: {
    flex: 1,
    borderRadius: width*0.01,
    overflow: 'hidden',
    height: height*0.18,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  button: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius:  width*0.05,
    padding: 20,
  },
  buttonIconContainer: {
    width: width*0.14,
    height: height*0.06,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonIcon: {
    width: width*0.07,
    height: height*0.03,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
  },
  footerLine: {
    width: width*0.5,
    height: height*0.005,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 2,
    marginBottom: height*0.01,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    letterSpacing: 2,
  }
})

export default HomeScreen