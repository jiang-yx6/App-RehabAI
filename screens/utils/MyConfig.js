export const API_BASE_URL = "https://yfvideo.hf.free4inno.com"
export const DIGITAL_HUMAN_URL = "https://9zekn5682505.vicp.fun"
//http://192.168.177.27:8000

import {
    Dimensions,
  } from "react-native"
const { width, height } = Dimensions.get("window")

// 添加响应式设计辅助函数
export  const normalize = (size) => {
    return Math.round(size * Math.min(width / 375, height / 812))
}