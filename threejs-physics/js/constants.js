// Game constants
export const WORLD_SIZE = 100;
export const GRAVITY = -20; // Stronger gravity for better gameplay feel
export const PLATFORM_COUNT = 20;
export const COLLECTIBLE_COUNT = 15;

// Player settings
export const PLAYER_SPEED = 10;
export const PLAYER_JUMP_FORCE = 12;
export const PLAYER_HEIGHT = 1.0;
export const PLAYER_RADIUS = 0.4;
export const PLAYER_MASS = 5;

// Environment settings
export const GROUND_LEVEL = 0;
export const PLATFORM_MIN_Y = 2;
export const PLATFORM_MAX_Y = 20;
export const PLATFORM_MIN_SCALE = 3;
export const PLATFORM_MAX_SCALE = 6;

// Camera settings
export const CAMERA_DISTANCE = 5;
export const CAMERA_HEIGHT = 2;
export const CAMERA_FOV = 75;

// Visual settings
export const SHADOW_MAP_SIZE = 2048;
export const SHADOW_RADIUS = 3;

// Game settings
export const RESPAWN_HEIGHT = -20; // Fall height before respawn
export const COLLECTIBLE_REWARD = 10; // Points per collectible

// Mobile detection
export const IS_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Colors
export const COLORS = {
    SKY: 0x4287f5,
    GROUND: 0x2f7326,
    PLAYER: 0xff6b6b,
    PLATFORM: 0x5e548e,
    COLLECTIBLE: 0xffdd00
};
