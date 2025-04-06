// Game world settings
export const WORLD_SIZE = 200;
export const GROUND_LEVEL = 0;

// Forest settings
export const TREE_COUNT = 100;
export const BUSH_COUNT = 80;
export const GRASS_PATCH_COUNT = 150;
export const ARTIFACT_COUNT = 5;

// Player settings
export const PLAYER_HEIGHT = 1.7;
export const PLAYER_RADIUS = 0.3;
export const PLAYER_MASS = 70;
export const PLAYER_MOVE_SPEED = 5;
export const PLAYER_SPRINT_SPEED = 8;
export const PLAYER_JUMP_FORCE = 7;
export const GROUND_FRICTION = 0.8;
export const AIR_FRICTION = 0.1;
export const GRAVITY = 20;

// Camera settings
export const CAMERA_HEIGHT = 1.6;
export const CAMERA_FOV = 75;
export const CAMERA_NEAR = 0.1;
export const CAMERA_FAR = 1000;
export const CAMERA_SENSITIVITY = 0.002;
export const MOBILE_CAMERA_SENSITIVITY = 0.005;

// Visual settings
export const DAY_CYCLE_SPEED = 0.0001;  // Speed of day/night cycle
export const FOG_NEAR = 10;
export const FOG_FAR = 100;

// Mobile detection
export const IS_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Lighting settings
export const AMBIENT_LIGHT_INTENSITY = 0.4;
export const DIRECTIONAL_LIGHT_INTENSITY = 0.8;
export const ARTIFACT_LIGHT_INTENSITY = 1.5;
export const ARTIFACT_LIGHT_DISTANCE = 10;

// Colors
export const COLORS = {
    SKY_DAY: 0x87CEEB,
    SKY_NIGHT: 0x0A1F33,
    FOG_DAY: 0xC8D9EB,
    FOG_NIGHT: 0x0A1F33,
    GROUND: 0x654321,
    TREE_TRUNK: 0x8B4513,
    TREE_LEAVES: 0x2E8B57,
    BUSH: 0x2D7742,
    GRASS: 0x4C9721,
    ARTIFACT: 0x00FFFF
};
