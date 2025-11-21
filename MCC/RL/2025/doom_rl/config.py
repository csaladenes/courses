import torch

# Environment settings
SCREEN_WIDTH = 84
SCREEN_HEIGHT = 84
FRAME_SKIP = 4
NUM_EPISODES = 1000
MAX_STEPS = 1000

# DQN hyperparameters
BATCH_SIZE = 64
GAMMA = 0.99
EPSILON_START = 1.0
EPSILON_END = 0.1
EPSILON_DECAY = 0.995
LEARNING_RATE = 0.0001
TARGET_UPDATE = 10
MEMORY_SIZE = 10000
MIN_MEMORY_SIZE = 1000

# Device configuration
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Available actions
ACTIONS = [
    [True, False, False],  # MOVE_LEFT
    [False, True, False],  # MOVE_RIGHT
    [False, False, True],  # ATTACK
]

# Training settings
SAVE_INTERVAL = 100
LOG_INTERVAL = 10 