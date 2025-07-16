import axios from 'axios';
import { Platform } from 'react-native';
import { API_BASE_URL, DIGITAL_HUMAN_URL } from "./MyConfig"
// 创建不同的axios实例
const mainApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

const digitalHumanApi = axios.create({
  baseURL: DIGITAL_HUMAN_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 允许动态切换基础URL的函数
const setBaseUrl = (apiType, newBaseUrl) => {
  if (apiType === 'main') {
    mainApi.defaults.baseURL = newBaseUrl;
  } else if (apiType === 'digitalHuman') {
    digitalHumanApi.defaults.baseURL = newBaseUrl;
  }
};

// WebRTC相关请求
const webRTCApi = {
  // 发送offer
  sendOffer: async (sdp, type) => {
    try {
      console.log('正在发送WebRTC offer请求到:', digitalHumanApi.defaults.baseURL);
      const response = await digitalHumanApi.post('/offer', {
        body: JSON.stringify({
          sdp,
          type,
        }),
      });
      return response.data;
    } catch (error) {
      console.error('发送offer失败:', error);
      if (error.response) {
        // 服务器响应了错误状态码
        console.error('服务器响应状态:', error.response.status);
        console.error('服务器响应数据:', error.response.data);
      } else if (error.request) {
        // 请求已发出但没有收到响应
        console.error('未收到服务器响应');
      } else {
        // 请求配置出错
        console.error('请求配置错误:', error.message);
      }
      throw error;
    }
  },
};

// 数字人聊天相关请求
const digitalHumanChatApi = {
  // 发送文本消息给数字人
  sendMessage: async (configuration) => {
    try {
      console.log('准备发送消息配置:', configuration);
      const response = await digitalHumanApi.post('/human', configuration, {
        timeout: 30000, // 增加超时时间到30秒
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      console.log("发送消息给数字人成功:", response.data);
      return response.data;
    } catch (error) {
      console.error('发送消息给数字人失败:', error);
      throw error;
    }
  },

  // 获取数字人聊天反馈记录
  getOneFeedback: async (feedbackId) => {
    try {
      const response = await mainApi.get(`/api/feedback/${feedbackId}`);
      return response.data;
    } catch (error) {
      console.error('获取数字人聊天反馈记录失败:', error);
      throw error;
    }
  },

  getAllFeedback: async () => {
    try {
      const response = await mainApi.get('/api/feedback/');
      return response.data;
    } catch (error) {
      console.error('获取数字人聊天反馈记录失败:', error);
      throw error;
    }
  },

  postFeedback: async (feedback) => {
    try {
      const response = await mainApi.post('/api/feedback/', feedback);
      return response.data;
    } catch (error) {
      console.error('提交数字人聊天反馈记录失败:', error);
      throw error;
    }
  }
};

// 动作评估相关请求
const motionApi = {
  // 上传评估视频
  uploadVideo: async (requestBody) => {
    try {
      const response = await mainApi.post('/upload-video/', 
        requestBody);
      console.log("上传视频成功:", response.data);
      return response.data;
    } catch (error) {
      console.error('上传视频失败:', error);
      throw error;
    }
  },

  // 获取标准视频列表
  getVideoLists: async () => {
    try {
      const response = await mainApi.get('/standard/all');
      console.log("获取视频列表成功:", response.data);
      return response.data;
    } catch (error) {
      console.error('获取视频列表失败:', error);
      throw error;
    }
  }
};

// 用户相关请求
const userApi = {
  // 用户登录
  login: async (username, password) => {
    try {
      const response = await mainApi.post('/user/login', {
        username,
        password
      });
      return response.data;
    } catch (error) {
      console.error('用户登录失败:', error);
      throw error;
    }
  },
  
  // 获取用户信息
  getUserInfo: async (userId) => {
    try {
      const response = await mainApi.get(`/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  }
};

// 导出所有API服务
export default {
  webRTC: webRTCApi,
  digitalHumanChat: digitalHumanChatApi,
  motion: motionApi,
  user: userApi,
  setBaseUrl // 导出切换URL的函数
};