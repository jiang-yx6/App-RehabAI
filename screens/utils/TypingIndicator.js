import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated, Easing } from 'react-native'

const TypingIndicator = () => {
  // 创建三个动画值引用
  const dot1Opacity = useRef(new Animated.Value(0.3)).current
  const dot2Opacity = useRef(new Animated.Value(0.3)).current
  const dot3Opacity = useRef(new Animated.Value(0.3)).current

  // 创建动画序列
  const createAnimation = (value) => {
    return Animated.sequence([
      Animated.timing(value, {
        toValue: 1,
        duration: 400,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 0.3,
        duration: 400,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ])
  }

  // 启动动画
  useEffect(() => {
    // 创建循环动画
    const animation = Animated.loop(
      Animated.stagger(200, [
        createAnimation(dot1Opacity),
        createAnimation(dot2Opacity),
        createAnimation(dot3Opacity),
      ])
    )

    // 开始动画
    animation.start()

    // 清理函数
    return () => {
      animation.stop()
    }
  }, [])

  return (
    <View style={styles.container}>
      {/* <Animated.View style={[styles.dot, { opacity: dot1Opacity }]} />
      <Animated.View style={[styles.dot, { opacity: dot2Opacity }]} />
      <Animated.View style={[styles.dot, { opacity: dot3Opacity }]} /> */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    height: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#94A3B8',
    marginRight: 4,
  },
})

export default TypingIndicator
