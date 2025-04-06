import * as THREE from 'three';

// Control constants
const MOVEMENT_SPEED = 5;
const MOUSE_SENSITIVITY = 0.002;

class Controls {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;

        // Camera rotation
        this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
        this.camera.rotation.order = 'YXZ';

        // Movement state
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.canJump = true;
        this.jump = false;

        // Velocity
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();

        // Bind event handlers
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);

        // Add event listeners
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);

        // Lock pointer for mouse control
        this.domElement.addEventListener('click', () => {
            this.domElement.requestPointerLock();
        });

        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement === this.domElement) {
                document.addEventListener('mousemove', this.onMouseMove);
            } else {
                document.removeEventListener('mousemove', this.onMouseMove);
            }
        });
    }

    onKeyDown(event) {
        switch (event.code) {
            case 'KeyW': this.moveForward = true; break;
            case 'KeyS': this.moveBackward = true; break;
            case 'KeyA': this.moveLeft = true; break;
            case 'KeyD': this.moveRight = true; break;
            case 'Space': this.jump = true; break;
        }
    }

    onKeyUp(event) {
        switch (event.code) {
            case 'KeyW': this.moveForward = false; break;
            case 'KeyS': this.moveBackward = false; break;
            case 'KeyA': this.moveLeft = false; break;
            case 'KeyD': this.moveRight = false; break;
            case 'Space': this.jump = false; break;
        }
    }

    onMouseMove(event) {
        const movementX = event.movementX || 0;
        const movementY = event.movementY || 0;

        // Update rotation based on mouse movement
        this.rotation.y -= movementX * MOUSE_SENSITIVITY;
        this.rotation.x -= movementY * MOUSE_SENSITIVITY;

        // Clamp vertical rotation to avoid flipping
        this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));

        // Apply rotation to camera
        this.camera.rotation.copy(this.rotation);
    }

    update(deltaTime) {
        // Reset velocity
        this.velocity.x = 0;
        this.velocity.z = 0;

        // Calculate movement direction
        this.direction.z = Number(this.moveBackward) - Number(this.moveForward);
        this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.normalize();

        // Apply movement relative to camera orientation
        const speed = MOVEMENT_SPEED * deltaTime;

        if (this.moveForward || this.moveBackward) {
            this.velocity.z -= this.direction.z * speed;
        }
        if (this.moveLeft || this.moveRight) {
            this.velocity.x += this.direction.x * speed;
        }

        // Convert velocity to camera direction
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0;
        cameraDirection.normalize();

        const sideways = new THREE.Vector3(-cameraDirection.z, 0, cameraDirection.x);

        const moveX = this.velocity.x * sideways.x + this.velocity.z * cameraDirection.x;
        const moveZ = this.velocity.x * sideways.z + this.velocity.z * cameraDirection.z;

        // Get movement vector
        const result = {
            movement: new THREE.Vector3(moveX, 0, moveZ),
            jump: this.jump
        };

        // Reset jump flag after returning it
        this.jump = false;

        return result;
    }

    dispose() {
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
        document.removeEventListener('mousemove', this.onMouseMove);
        this.domElement.removeEventListener('click', this.lockPointer);
    }
}

export { Controls };
