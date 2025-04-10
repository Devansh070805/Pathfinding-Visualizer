import networkx as nx
from collections import deque

def bfs(G, start, end):
    queue = deque([start])
    visited = {start: None}

    while queue:
        current = queue.popleft()
        if current == end:
            break
        for neighbor in G.neighbors(current):
            if neighbor not in visited:
                visited[neighbor] = current
                queue.append(neighbor)

    if end not in visited:
        return list(visited.keys()), []

    path = []
    curr = end
    while curr:
        path.append(curr)
        curr = visited[curr]
    path.reverse()

    return list(visited.keys()), path


def dfs(G, start, end):
    stack = [start]
    visited = {start: None}

    while stack:
        current = stack.pop()
        if current == end:
            break
        for neighbor in G.neighbors(current):
            if neighbor not in visited:
                visited[neighbor] = current
                stack.append(neighbor)

    if end not in visited:
        return list(visited.keys()), []

    path = []
    curr = end
    while curr:
        path.append(curr)
        curr = visited[curr]
    path.reverse()

    return list(visited.keys()), path


def dijkstra(G, start, end):
    try:
        path = nx.dijkstra_path(G, source=start, target=end)
        visited = list(nx.single_source_dijkstra_path_length(G, start).keys())
        return visited, path
    except nx.NetworkXNoPath:
        return [], []


def astar(G, start, end):
    try:
        path = nx.astar_path(G, source=start, target=end)
        visited = list(nx.single_source_shortest_path_length(G, start).keys())
        return visited, path
    except nx.NetworkXNoPath:
        return [], []
