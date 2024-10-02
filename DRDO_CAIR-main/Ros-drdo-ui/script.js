const stick = document.querySelector('.joystick-stick');
const joystickContainer = document.querySelector('.joystick-container');
const xOutput = document.getElementById('x-output');
const yOutput = document.getElementById('y-output');

let isDragging = false;

joystickContainer.addEventListener('mousedown', startDrag);
joystickContainer.addEventListener('touchstart', startDrag);

document.addEventListener('mousemove', drag);
document.addEventListener('touchmove', drag);

document.addEventListener('mouseup', stopDrag);
document.addEventListener('touchend', stopDrag);

function startDrag(event) {
    isDragging = true;
}

function drag(event) {
    if (!isDragging) return;

    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;

    const rect = joystickContainer.getBoundingClientRect();
    const maxMovement = rect.width / 2;
    let x = clientX - rect.left - maxMovement;
    let y = clientY - rect.top - maxMovement;

    const distance = Math.sqrt(x * x + y * y);
    if (distance > maxMovement) {
        const angle = Math.atan2(y, x);
        x = Math.cos(angle) * maxMovement;
        y = Math.sin(angle) * maxMovement;
    }

    stick.style.left = `${x + maxMovement - stick.offsetWidth / 2}px`;
    stick.style.top = `${y + maxMovement - stick.offsetHeight / 2}px`;

    xOutput.textContent = x.toFixed(2);
    yOutput.textContent = y.toFixed(2);
}

function stopDrag() {
    isDragging = false;
    stick.style.left = `calc(50% - ${stick.offsetWidth / 2}px)`;
    stick.style.top = `calc(50% - ${stick.offsetHeight / 2}px)`;

    xOutput.textContent = '0';
    yOutput.textContent = '0';
}
