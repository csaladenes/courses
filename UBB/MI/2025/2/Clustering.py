from sklearn.datasets import make_blobs
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
import numpy as np
from scipy.spatial.distance import pdist, squareform

# Generate the data
X, y = make_blobs(n_samples=350, centers=4, random_state=0, cluster_std=0.60)

# Calculate average intra-cluster distance for different numbers of clusters
avg_distances = []
K = range(2, 9)

for k in K:
    kmeans = KMeans(n_clusters=k, random_state=42)
    kmeans.fit(X)
    
    # Calculate average distance within each cluster
    cluster_distances = []
    for i in range(k):
        # Get points in current cluster
        cluster_points = X[kmeans.labels_ == i]
        if len(cluster_points) > 1:
            # Calculate pairwise distances within cluster
            distances = pdist(cluster_points)
            cluster_distances.append(np.mean(distances))
    
    # Average across all clusters
    avg_distances.append(np.mean(cluster_distances))

# Create the plot
plt.figure(figsize=(10, 6))
plt.plot(K, avg_distances, 'bx-')
plt.xlabel('k')
plt.ylabel('Average Intra-cluster Distance')
plt.title('Average Intra-cluster Distance vs Number of Clusters')
plt.show()

# Plot the data points
plt.figure(figsize=(10, 6))
plt.scatter(X[:, 0], X[:, 1], s=50)
plt.title('Original Data Points')
plt.show()

# Using DBSCAN instead of KMeans
from sklearn.cluster import DBSCAN

# Fit DBSCAN
dbscan = DBSCAN(eps=0.5, min_samples=5)
y_dbscan = dbscan.fit_predict(X)

# Plot the results
plt.figure(figsize=(10, 6))
plt.scatter(X[:, 0], X[:, 1], c=y_dbscan, s=50, cmap="rainbow")
plt.title("DBSCAN Clustering")
plt.show()

# Using the newer colormap syntax with discrete colors
import matplotlib.colors as mcolors

# Create a discrete colormap with exactly 10 colors
colors = plt.cm.rainbow(np.linspace(0, 1, 10))
cmap = mcolors.ListedColormap(colors)
bounds = np.arange(11)  # 11 boundaries for 10 colors
norm = mcolors.BoundaryNorm(bounds, cmap.N)

kwargs = dict(cmap=cmap, norm=norm, edgecolor="none", alpha=0.6)
fig, ax = plt.subplots(1, 2, figsize=(10, 4))
scatter0 = ax[0].scatter(X[:, 0], X[:, 1], c=y_dbscan, **kwargs)
ax[0].set_title("learned cluster labels")

scatter1 = ax[1].scatter(X[:, 0], X[:, 1], c=y, **kwargs)
ax[1].set_title("true labels")

# Add colorbar
cbar = plt.colorbar(scatter0, ax=ax.ravel().tolist(), ticks=np.arange(10))
cbar.set_label('Cluster Label', rotation=270, labelpad=15)
plt.tight_layout()
plt.show() 