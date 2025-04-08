"""
Scikit-learn Datasets Examples

This script demonstrates how to load and use various datasets from scikit-learn
as alternatives to the deprecated Boston Housing dataset.
"""

# First, make sure scikit-learn is installed
# If not installed, run: pip install scikit-learn

import numpy as np
import matplotlib.pyplot as plt
from sklearn import datasets
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression

# 1. California Housing dataset - a good replacement for Boston Housing
print("=== California Housing Dataset ===")
california = datasets.fetch_california_housing()
print(f"Data shape: {california.data.shape}")

# Fix for deprecated normalize parameter
# Old code with error:
# model = LinearRegression(normalize=True)
# print(model.normalize)

# New code using StandardScaler:
scaler = StandardScaler()
X_normalized = scaler.fit_transform(california.data)
model = LinearRegression()  # No normalize parameter needed
print("Data normalized with StandardScaler instead of deprecated normalize=True")

print(f"Target shape: {california.target.shape}")
print(f"Feature names: {california.feature_names}")
print("\n")

# 2. Diabetes dataset - another regression dataset
print("=== Diabetes Dataset ===")
diabetes = datasets.load_diabetes()
print(f"Data shape: {diabetes.data.shape}")
print(f"Target shape: {diabetes.target.shape}")
print(f"Feature names: {diabetes.feature_names}")
print("\n")

# 3. Iris dataset - a classic classification dataset
print("=== Iris Dataset ===")
iris = datasets.load_iris()
print(f"Data shape: {iris.data.shape}")
print(f"Target shape: {iris.target.shape}")
print(f"Feature names: {iris.feature_names}")
print(f"Target names: {iris.target_names}")

# Example of visualizing the Iris dataset
plt.figure(figsize=(10, 6))
plt.scatter(iris.data[:, 0], iris.data[:, 1], 
            c=iris.target, 
            # Using the recommended way to get colormaps instead of get_cmap
            cmap=plt.colormaps['RdYlBu'])
plt.xlabel(iris.feature_names[0])
plt.ylabel(iris.feature_names[1])
plt.title('Iris Dataset: Sepal Length vs Sepal Width')
plt.colorbar(ticks=[0, 1, 2], label='Target')
plt.tight_layout()
plt.savefig('iris_visualization.png')
print("Iris visualization saved as 'iris_visualization.png'")
print("\n")

# 4. Wine dataset - another classification dataset
print("=== Wine Dataset ===")
wine = datasets.load_wine()
print(f"Data shape: {wine.data.shape}")
print(f"Target shape: {wine.target.shape}")
print(f"Feature names: {wine.feature_names}")
print(f"Target names: {wine.target_names}")
print("\n")

# 5. Breast cancer dataset - binary classification
print("=== Breast Cancer Dataset ===")
cancer = datasets.load_breast_cancer()
print(f"Data shape: {cancer.data.shape}")
print(f"Target shape: {cancer.target.shape}")
print(f"Feature names: {cancer.feature_names[:5]}... (and more)")
print(f"Target names: {cancer.target_names}")
print("\n")

# List all available datasets
print("=== All Available Datasets in scikit-learn ===")
# These are the most commonly used datasets
dataset_loaders = [
    "load_iris", "load_diabetes", "load_digits", "load_wine", 
    "load_breast_cancer", "fetch_california_housing", "fetch_covtype",
    "fetch_olivetti_faces", "fetch_lfw_people", "fetch_20newsgroups"
]
print("Available dataset functions:")
for loader in dataset_loaders:
    print(f"- datasets.{loader}()") 