# Doom Reinforcement Learning Agent

This project implements a Deep Reinforcement Learning agent that learns to play Doom using the VizDoom environment.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Download the Doom WAD file:
```bash
wget https://github.com/JL321/Doom/raw/master/doom.wad
```

## Project Structure

- `agent.py`: Contains the DQN agent implementation
- `environment.py`: Wrapper for the VizDoom environment
- `train.py`: Training script
- `utils.py`: Utility functions
- `config.py`: Configuration parameters

## Training

To train the agent:
```bash
python train.py
```

## Requirements

- Python 3.8+
- PyTorch
- VizDoom
- OpenCV
- NumPy
- Matplotlib
- TensorBoard 