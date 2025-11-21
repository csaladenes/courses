import numpy as np
import cv2
from vizdoom import DoomGame, ScreenResolution, Button, GameVariable
import config

class DoomEnvironment:
    def __init__(self):
        self.game = DoomGame()
        self.game.load_config("basic.cfg")
        self.game.set_doom_scenario_path("basic.wad")
        self.game.set_doom_map("map01")
        self.game.set_screen_resolution(ScreenResolution.RES_320X240)
        self.game.set_screen_format(self.game.get_screen_format())
        self.game.set_render_hud(False)
        self.game.set_render_crosshair(False)
        self.game.set_render_weapon(True)
        self.game.set_render_decals(False)
        self.game.set_render_particles(False)
        self.game.add_available_button(Button.MOVE_LEFT)
        self.game.add_available_button(Button.MOVE_RIGHT)
        self.game.add_available_button(Button.ATTACK)
        self.game.add_available_game_variable(GameVariable.KILLCOUNT)
        self.game.set_episode_timeout(config.MAX_STEPS)
        self.game.set_episode_start_time(10)
        self.game.set_window_visible(False)
        self.game.init()
        
        # Get available buttons
        self.buttons = self.game.get_available_buttons()
        self.num_buttons = len(self.buttons)
        
        # Create action space
        self.actions = config.ACTIONS
        self.num_actions = len(self.actions)

    def preprocess_frame(self, frame):
        # Resize and normalize
        frame = cv2.resize(frame, (config.SCREEN_WIDTH, config.SCREEN_HEIGHT))
        frame = frame.astype(np.float32) / 255.0
        return frame

    def reset(self):
        self.game.new_episode()
        frame = self.game.get_state().screen_buffer
        return self.preprocess_frame(frame)

    def step(self, action):
        # Convert action index to button state
        button_state = [0] * self.num_buttons
        for button_idx in self.actions[action]:
            button_state[button_idx] = 1
            
        # Take action
        reward = self.game.make_action(button_state, config.FRAME_SKIP)
        
        # Get next state
        done = self.game.is_episode_finished()
        if not done:
            frame = self.game.get_state().screen_buffer
            next_state = self.preprocess_frame(frame)
        else:
            next_state = np.zeros((config.SCREEN_HEIGHT, config.SCREEN_WIDTH), dtype=np.float32)
            
        return next_state, reward, done

    def close(self):
        self.game.close() 