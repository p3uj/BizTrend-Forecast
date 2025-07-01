class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000; // 3 seconds
    this.listeners = new Map();
    this.isConnecting = false;
    this.isConnected = false;
  }

  connect() {
    if (this.isConnecting || this.isConnected) {
      return;
    }

    this.isConnecting = true;

    try {
      // Use ws:// for development, wss:// for production
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}backend-production-37cd.up.railway.app/wss/predictions/`;

      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = (event) => {
        // console.log("WebSocket connected:", event);
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;

        // Send ping to confirm connection
        this.send({
          type: "ping",
          message: "Connection test",
        });

        // Notify all listeners about connection
        this.notifyListeners("connection_established", {
          message: "Connected to real-time updates",
        });
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // console.log("WebSocket message received:", data);

          // Notify listeners based on message type
          this.notifyListeners(data.type, data);
        } catch (error) {
          // console.error("Error parsing WebSocket message:", error);
        }
      };

      this.socket.onclose = (event) => {
        // console.log("WebSocket disconnected:", event);
        this.isConnected = false;
        this.isConnecting = false;
        this.socket = null;

        // Notify listeners about disconnection
        this.notifyListeners("connection_lost", {
          message: "Connection to real-time updates lost",
        });

        // Attempt to reconnect if not intentionally closed
        if (
          event.code !== 1000 &&
          this.reconnectAttempts < this.maxReconnectAttempts
        ) {
          this.scheduleReconnect();
        }
      };

      this.socket.onerror = (error) => {
        // console.error("WebSocket error:", error);
        this.isConnecting = false;

        this.notifyListeners("connection_error", {
          message: "Failed to connect to real-time updates",
          error: error,
        });
      };
    } catch (error) {
      // console.error("Failed to create WebSocket connection:", error);
      this.isConnecting = false;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close(1000, "Intentional disconnect");
      this.socket = null;
    }
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  scheduleReconnect() {
    this.reconnectAttempts++;
    // console.log(
    //   `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    // );

    setTimeout(() => {
      if (!this.isConnected && !this.isConnecting) {
        this.connect();
      }
    }, this.reconnectInterval);
  }

  send(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      // console.warn("WebSocket is not connected. Message not sent:", message);
    }
  }

  // Add event listener for specific message types
  addEventListener(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
  }

  // Remove event listener
  removeEventListener(eventType, callback) {
    if (this.listeners.has(eventType)) {
      const callbacks = this.listeners.get(eventType);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Notify all listeners for a specific event type
  notifyListeners(eventType, data) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          // console.error(`Error in WebSocket listener for ${eventType}:`, error);
        }
      });
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  // Convenience methods for common event types
  onDatasetUploaded(callback) {
    this.addEventListener("dataset_uploaded", callback);
  }

  onPredictionStarted(callback) {
    this.addEventListener("prediction_started", callback);
  }

  onPredictionCompleted(callback) {
    this.addEventListener("prediction_completed", callback);
  }

  onPredictionDataUpdated(callback) {
    this.addEventListener("prediction_data_updated", callback);
  }

  onPredictionError(callback) {
    this.addEventListener("prediction_error", callback);
  }

  onConnectionEstablished(callback) {
    this.addEventListener("connection_established", callback);
  }

  onConnectionLost(callback) {
    this.addEventListener("connection_lost", callback);
  }

  onConnectionError(callback) {
    this.addEventListener("connection_error", callback);
  }

  // User Management Event Handlers
  onUserCreated(callback) {
    this.addEventListener("user_created", callback);
  }

  onUserUpdated(callback) {
    this.addEventListener("user_updated", callback);
  }

  onUserStatusChanged(callback) {
    this.addEventListener("user_status_changed", callback);
  }

  onUserDeleted(callback) {
    this.addEventListener("user_deleted", callback);
  }

  onProfileUpdated(callback) {
    this.addEventListener("profile_updated", callback);
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();

export default websocketService;
