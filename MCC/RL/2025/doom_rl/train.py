import torch
from environment import DoomEnvironment
from agent import DQNAgent
import config
from torch.utils.tensorboard import SummaryWriter
import os
import time

def train():
    # Create directories for saving models and logs
    os.makedirs('models', exist_ok=True)
    os.makedirs('logs', exist_ok=True)
    
    # Initialize environment and agent
    env = DoomEnvironment()
    agent = DQNAgent((config.SCREEN_HEIGHT, config.SCREEN_WIDTH), env.num_actions)
    writer = SummaryWriter('logs/doom_dqn')
    
    # Training loop
    for episode in range(config.NUM_EPISODES):
        state = env.reset()
        episode_reward = 0
        episode_loss = 0
        steps = 0
        
        while True:
            action = agent.select_action(state)
            next_state, reward, done = env.step(action)
            
            agent.store_transition(state, action, reward, next_state, done)
            loss = agent.train()
            if loss is not None:
                episode_loss += loss
            
            state = next_state
            episode_reward += reward
            steps += 1
            
            if done:
                break
        
        # Update target network
        if episode % config.TARGET_UPDATE == 0:
            agent.update_target_network()
        
        # Update exploration rate
        agent.update_epsilon()
        
        # Log metrics
        writer.add_scalar('Reward/episode', episode_reward, episode)
        writer.add_scalar('Loss/episode', episode_loss / steps if steps > 0 else 0, episode)
        writer.add_scalar('Epsilon', agent.epsilon, episode)
        
        # Print progress
        if episode % config.LOG_INTERVAL == 0:
            print(f"Episode {episode}/{config.NUM_EPISODES}")
            print(f"Reward: {episode_reward:.2f}")
            print(f"Loss: {episode_loss/steps:.4f}" if steps > 0 else "Loss: 0.0000")
            print(f"Epsilon: {agent.epsilon:.4f}")
            print("-" * 50)
        
        # Save model
        if episode % config.SAVE_INTERVAL == 0:
            agent.save_model(f'models/doom_dqn_episode_{episode}.pth')
    
    # Save final model
    agent.save_model('models/doom_dqn_final.pth')
    writer.close()
    env.close()

if __name__ == "__main__":
    train() 