// WebSocketManager.js
class WebSocketManager {
    constructor() {
      this.ws = null
      this.jsonMessageHandler = null
      this.connStateHandler = null
    }
  
    connect(url, jsonMessageHandler, connStateHandler) {
      if (this.ws) {
        this.close()
      }
  
      try {
        this.ws = new WebSocket(url)
        this.jsonMessageHandler = jsonMessageHandler
        this.connStateHandler = connStateHandler
  
        this.ws.onopen = () => {
          console.log("WebSocket connection opened")
          if (this.connStateHandler) {
            this.connStateHandler(0) // 0 means connected
          }
        }
  
        this.ws.onmessage = (event) => {
          if (this.jsonMessageHandler && event && event.data) {
            this.jsonMessageHandler({
              type: 'message',
              data: event.data
            })
          }
        }
  
        this.ws.onclose = () => {
          console.log("WebSocket connection closed")
          if (this.connStateHandler) {
            this.connStateHandler(1) // 1 means closed
          }
          this.ws = null
        }
  
        this.ws.onerror = (error) => {
          console.error("WebSocket error:", error)
          if (this.connStateHandler) {
            this.connStateHandler(2) // 2 means error
          }
        }
  
        return 1 // Success
      } catch (error) {
        console.error("Error connecting to WebSocket:", error)
        return 0 // Error
      }
    }
  
    wsSend(data) {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        console.error("WebSocket is not connected")
        return
      }
  
      try {
        this.ws.send(data)
      } catch (error) {
        console.error("Error sending data:", error)
      }
    }
  
    close() {
      if (this.ws) {
        this.ws.close()
        this.ws = null
      }
    }
  }
  
  export default new WebSocketManager()
  