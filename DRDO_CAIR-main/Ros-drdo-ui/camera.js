const ROSBRIDGE_SERVER_IP = '127.0.0.1'; // Update this to match your server IP
const cameraFeedUrl = `http://${ROSBRIDGE_SERVER_IP}:8080/stream?topic=/image_raw`;

function setupCameraFeed() {
    const cameraFeedElement = document.getElementById('camera-feed');
    cameraFeedElement.src = cameraFeedUrl;

    cameraFeedElement.onerror = () => {
        cameraFeedElement.alt = "Failed to load camera feed.";
        cameraFeedElement.src = '';
    };
}

document.addEventListener('DOMContentLoaded', setupCameraFeed);
