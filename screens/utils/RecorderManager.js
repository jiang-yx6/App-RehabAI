// RecorderManager.js
import { Platform, PermissionsAndroid } from "react-native"
import AudioRecord from "react-native-audio-record"
import WebSocketManager from "./WebSocketManager"

class RecorderManager {
  constructor() {
    this.isRecording = false
    this.sampleBuf = new Int16Array()
    this.audioConfig = {
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      audioSource: 6,
      wavFile: "audio.wav",
    }
  }

  async requestPermissions() {
      try {
        // 只请求录音权限
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: "录音权限",
            message: "应用需要录音权限以进行语音识别",
            buttonNeutral: "稍后询问",
            buttonNegative: "取消",
            buttonPositive: "确定"
          }
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          throw new Error("需要录音权限才能使用语音识别功能");
        }

        return true;
      } catch (error) {
        console.error("权限请求失败:", error);
        throw error;
      }
  }

  async init() {
    try {
      // 先请求权限
      await this.requestPermissions();

      // 初始化录音
      await AudioRecord.init(this.audioConfig);

      // 设置数据监听
      AudioRecord.on("data", (data) => {
        if (this.isRecording) {
          this.processAudioData(data);
        }
      });

      console.log("RecorderManager initialized successfully");
      return true;
    } catch (error) {
      console.error("初始化录音管理器失败:", error);
      throw error;
    }
  }

  async start() {
    try {
      this.isRecording = true;
      this.sampleBuf = new Int16Array();
      await AudioRecord.start();
      
      // 发送开始录音的请求
      const request = {
        chunk_size: [5, 10, 5],
        wav_name: "react-native",
        is_speaking: true,
        chunk_interval: 10,
        mode: "online",
      };
      WebSocketManager.wsSend(JSON.stringify(request));
      
      console.log("Recording started");
    } catch (error) {
      this.isRecording = false;
      console.error("开始录音失败:", error);
      throw error;
    }
  }

  async stop() {
    try {
      if (this.isRecording) {
        this.isRecording = false;
        await AudioRecord.stop();

        // 发送剩余的音频数据
        if (this.sampleBuf.length > 0) {
          WebSocketManager.wsSend(this.sampleBuf);
          this.sampleBuf = new Int16Array();
        }

        // 发送结束录音的请求
        const request = {
          chunk_size: [5, 10, 5],
          wav_name: "react-native",
          is_speaking: false,
          chunk_interval: 10,
          mode: "online",
        };

        WebSocketManager.wsSend(JSON.stringify(request));
        console.log("Recording stopped");
      }
    } catch (error) {
      console.error("停止录音失败:", error);
      throw error;
    }
  }

  cleanup() {
    try {
      if (this.isRecording) {
        this.stop();
      }
      AudioRecord.stop();
      this.sampleBuf = new Int16Array();
    } catch (error) {
      console.error("清理录音资源失败:", error);
    }
  }

  processAudioData(data) {
    try {
      // Convert base64 to ArrayBuffer
      const buffer = this.base64ToArrayBuffer(data);

      // Convert to Int16Array
      const view = new Int16Array(buffer);

      // Append to sample buffer
      const newBuffer = new Int16Array(this.sampleBuf.length + view.length);
      newBuffer.set(this.sampleBuf);
      newBuffer.set(view, this.sampleBuf.length);
      this.sampleBuf = newBuffer;

      // Send chunks of audio data
      const chunkSize = 960;

      while (this.sampleBuf.length >= chunkSize) {
        const sendBuf = this.sampleBuf.slice(0, chunkSize);
        this.sampleBuf = this.sampleBuf.slice(chunkSize);
        WebSocketManager.wsSend(sendBuf.buffer);
      }
    } catch (error) {
      console.error("处理音频数据失败:", error);
    }
  }

  base64ToArrayBuffer(base64) {
    try {
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);

      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      return bytes.buffer;
    } catch (error) {
      console.error("转换音频数据格式失败:", error);
      throw error;
    }
  }
}

export default new RecorderManager();
