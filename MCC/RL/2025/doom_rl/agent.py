import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from collections import deque
import random
import config

class DQN(nn.Module):
    def __init__(self, input_shape, num_actions):
        super(DQN, self).__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(1, 32, kernel_size=8, stride=4),
            nn.ReLU(),
            nn.Conv2d(32, 64, kernel_size=4, stride=2),
            nn.ReLU(),
            nn.Conv2d(64, 64, kernel_size=3, stride=1),
            nn.ReLU()
        )
        
        conv_out_size = self._get_conv_out(input_shape)
        
        self.fc = nn.Sequential(
            nn.Linear(conv_out_size, 512),
            nn.ReLU(),
            nn.Linear(512, num_actions)
        )

    def _get_conv_out(self, shape):
        o = self.conv(torch.zeros(1, 1, *shape))
        return int(np.prod(o.size()))

    def forward(self, x):
        conv_out = self.conv(x).view(x.size()[0], -1)
        return self.fc(conv_out)

class DQNAgent:
    def __init__(self, state_shape, num_actions):
        self.state_shape = state_shape
        self.num_actions = num_actions
        self.epsilon = config.EPSILON_START
        
        self.policy_net = DQN(state_shape, num_actions).to(config.DEVICE)
        self.target_net = DQN(state_shape, num_actions).to(config.DEVICE)
        self.target_net.load_state_dict(self.policy_net.state_dict())
        
        self.optimizer = optim.Adam(self.policy_net.parameters(), lr=config.LEARNING_RATE)
        self.memory = deque(maxlen=config.MEMORY_SIZE)
        
    def select_action(self, state):
        if random.random() < self.epsilon:
            return random.randrange(self.num_actions)
        
        with torch.no_grad():
            state = torch.FloatTensor(state).unsqueeze(0).unsqueeze(0).to(config.DEVICE)
            q_values = self.policy_net(state)
            return q_values.max(1)[1].item()
    
    def store_transition(self, state, action, reward, next_state, done):
        self.memory.append((state, action, reward, next_state, done))
    
    def update_epsilon(self):
        self.epsilon = max(config.EPSILON_END, self.epsilon * config.EPSILON_DECAY)
    
    def train(self):
        if len(self.memory) < config.MIN_MEMORY_SIZE:
            return
        
        batch = random.sample(self.memory, config.BATCH_SIZE)
        states, actions, rewards, next_states, dones = zip(*batch)
        
        states = torch.FloatTensor(states).unsqueeze(1).to(config.DEVICE)
        actions = torch.LongTensor(actions).to(config.DEVICE)
        rewards = torch.FloatTensor(rewards).to(config.DEVICE)
        next_states = torch.FloatTensor(next_states).unsqueeze(1).to(config.DEVICE)
        dones = torch.FloatTensor(dones).to(config.DEVICE)
        
        current_q_values = self.policy_net(states).gather(1, actions.unsqueeze(1))
        next_q_values = self.target_net(next_states).max(1)[0].detach()
        expected_q_values = rewards + (1 - dones) * config.GAMMA * next_q_values
        
        loss = nn.MSELoss()(current_q_values.squeeze(), expected_q_values)
        
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()
        
        return loss.item()
    
    def update_target_network(self):
        self.target_net.load_state_dict(self.policy_net.state_dict())
    
    def save_model(self, path):
        torch.save({
            'policy_net_state_dict': self.policy_net.state_dict(),
            'target_net_state_dict': self.target_net.state_dict(),
            'optimizer_state_dict': self.optimizer.state_dict(),
            'epsilon': self.epsilon
        }, path)
    
    def load_model(self, path):
        checkpoint = torch.load(path)
        self.policy_net.load_state_dict(checkpoint['policy_net_state_dict'])
        self.target_net.load_state_dict(checkpoint['target_net_state_dict'])
        self.optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
        self.epsilon = checkpoint['epsilon'] 