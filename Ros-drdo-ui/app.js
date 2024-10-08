const ROSBRIDGE_SERVER_IP = '127.0.0.1'; // Update this to match your server IP
const ROSBRIDGE_SERVER_PORT = '9090';
let ros = null;
let cmdVelPublisher = null;

// Initialize ROS connection
function initConnection() {
    ros = new window.ROSLIB.Ros();

    ros.on('connection', () => {
        console.log("Connection established!");
        updateStatus(true);
    });

    ros.on('close', () => {
        console.log("Connection closed!");
        updateStatus(false);
        setTimeout(initConnection, 3000); // Try to reconnect every 3 seconds
    });

    connect();
}

// Connect to ROS bridge
function connect() {
    try {
        ros.connect(`ws://${ROSBRIDGE_SERVER_IP}:${ROSBRIDGE_SERVER_PORT}`);
    } catch (error) {
        console.error("Connection problem:", error);
        updateStatus(false); // Update the UI to reflect disconnection
    }
}

// Update connection status
function updateStatus(isConnected) {
    const connectionStatus = document.getElementById('connection-status');
    connectionStatus.style.display = 'block';
    if (isConnected) {
        connectionStatus.textContent = "Robot Connected";
        connectionStatus.className = "alert alert-success";
    } else {
        connectionStatus.textContent = "Robot Disconnected";
        connectionStatus.className = "alert alert-danger";
    }
}

// Subscribe to robot state
function getRobotState() {
    const poseSubscriber = new window.ROSLIB.Topic({
        ros: ros,
        name: '/turtle1/pose',
        messageType: 'turtlesim/msg/Pose'
    });

    poseSubscriber.subscribe((message) => {
        document.getElementById('position-x').textContent = `x: ${message.x.toFixed(2)}`;
        document.getElementById('position-y').textContent = `y: ${message.y.toFixed(2)}`;
        document.getElementById('orientation').textContent = `Orientation: ${message.theta.toFixed(2)}`;

        const linearVelocity = Math.sqrt(message.x * message.x + message.y * message.y);
        document.getElementById('linear-velocity').textContent = `Linear Velocity: ${linearVelocity.toFixed(2)}`;
        document.getElementById('angular-velocity').textContent = `Angular Velocity: ${message.theta.toFixed(2)}`;
    });
}

// Publish velocity commands
let lastPublishedTime = 0;
const publishInterval = 100; // milliseconds

function publishVelocity(linearX, angularZ) {
    const currentTime = Date.now();
    if (currentTime - lastPublishedTime < publishInterval) return; // Throttle publish rate
    lastPublishedTime = currentTime;

    if (!cmdVelPublisher) {
        cmdVelPublisher = new window.ROSLIB.Topic({
            ros: ros,
            name: '/turtle1/cmd_vel',
            messageType: 'geometry_msgs/Twist'
        });
    }

    const twist = new window.ROSLIB.Message({
        linear: {
            x: linearX,
            y: 0,
            z: 0
        },
        angular: {
            x: 0,
            y: 0,
            z: angularZ
        }
    });

    cmdVelPublisher.publish(twist);
}

/// Joystick handling
const joystick = document.querySelector('.joystick-stick');

joystick.addEventListener('mousedown', (event) => {
    const moveJoystick = (e) => {
        const x = e.clientX - joystick.getBoundingClientRect().left - joystick.offsetWidth / 2;
        const y = e.clientY - joystick.getBoundingClientRect().top - joystick.offsetHeight / 2;
        const radius = joystick.offsetWidth / 2;

        // Calculate distance from center
        const distance = Math.sqrt(x * x + y * y);
        const angle = Math.atan2(y, x);

        // Normalize and limit distance
        const normalizedDistance = Math.min(distance / radius, 1);

        // Adjust the direction mappings (Rotated 90 degrees to the left)
        const linearX = normalizedDistance * Math.cos(angle + Math.PI / 2); // Forward/Backward
        const angularZ = -normalizedDistance * Math.sin(angle + Math.PI / 2); // Invert Left/Right rotation

        // Map joystick positions correctly
        publishVelocity(linearX, angularZ); // Send commands based on corrected logic

        // Update output display
        document.getElementById('x-output').textContent = linearX.toFixed(2);
        document.getElementById('y-output').textContent = angularZ.toFixed(2);
    };

    const moveEnd = () => {
        publishVelocity(0, 0); // Stop the robot when joystick is released
        document.removeEventListener('mousemove', moveJoystick);
        document.removeEventListener('mouseup', moveEnd);
    };

    document.addEventListener('mousemove', moveJoystick);
    document.addEventListener('mouseup', moveEnd);
});

// Function to set pen color
function setPenColor(color) {
    const setPenColorService = new window.ROSLIB.Service({
        ros: ros,
        name: '/turtle1/set_pen',
        serviceType: 'turtlesim/SetPen'
    });

    const request = new window.ROSLIB.ServiceRequest({
        r: 0, // Red component (0-255)
        g: 0, // Green component (0-255)
        b: 0, // Blue component (0-255)
        width: 2, // Pen width
        off: 0 // Pen up (0) or down (1)
    });

    const hexColor = color.slice(1); // Remove the '#' character
    request.r = parseInt(hexColor.slice(0, 2), 16);
    request.g = parseInt(hexColor.slice(2, 4), 16);
    request.b = parseInt(hexColor.slice(4, 6), 16);

    setPenColorService.callService(request, (result) => {
        console.log("Pen color set:", result);
    }, (error) => {
        console.error("Error setting pen color:", error);
    });
}

// Event listener for the pen color button
document.getElementById('set-pen-color').addEventListener('click', () => {
    const color = document.getElementById('pen-color').value;
    setPenColor(color);
});

// Initialize ROS connection and robot state subscription
initConnection();
getRobotState();
