// connection.js

// Get the connection status element
const connectionStatus = document.getElementById('connection-status');

// Replace with your actual ROS bridge server details
const ROSBRIDGE_SERVER_IP = '127.0.0.1'; // Your ROS Bridge Server IP
const ROSBRIDGE_SERVER_PORT = '9090'; // Your ROS Bridge Server Port
let ros = null;

// Initialize the UI to show "Robot Disconnected" initially
updateStatus(false); // Call this function to set the initial disconnected state

// Function to initialize the connection
function initConnection() {
    // Create a new WebSocket connection
    ros = new WebSocket(`ws://${ROSBRIDGE_SERVER_IP}:${ROSBRIDGE_SERVER_PORT}`);

    // Event handler for when the connection is opened
    ros.onopen = () => {
        console.log("Connection established!");
        updateStatus(true); // Update the UI to show connected status
    };

    // Event handler for when the connection is closed
    ros.onclose = () => {
        console.log("Connection closed!");
        updateStatus(false); // Update the UI to show disconnected status
        // Attempt to reconnect every 3 seconds
        setTimeout(initConnection, 3000);
    };

    // Event handler for connection errors
    ros.onerror = (error) => {
        console.error("Connection error:", error);
    };
}

// Function to update the connection status in the UI
function updateStatus(isConnected) {
    if (isConnected) {
        connectionStatus.textContent = "Robot Connected"; // Display connected message
        connectionStatus.className = "alert alert-success"; // Add success class for Bootstrap
    } else {
        connectionStatus.textContent = "Robot Disconnected"; // Display disconnected message
        connectionStatus.className = "alert alert-danger"; // Add danger class for Bootstrap
    }
    connectionStatus.style.display = 'block'; // Show the alert
}

// Start the connection process when the script is loaded
initConnection();
