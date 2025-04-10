import networkx as nx
from collections import deque
import heapq


def bfs(grid_size, start, end, walls):
    G= nx.grid_2d_graph(grid_size, grid_size) #creating the grid using networkX
    for wall in walls:
        G.remove_node(wall)
    
    queue= deque([start])
    visited= {start: None}

    while queue:
        current = queue.popleft()
        if current == end:
            break
        for neighbor in G.neighbors(current):
            if neighbor not in visited:
                visited[neighbor]= current
                queue.append(neighbor)

    if end not in visited:
        return [], list(visited.keys())
    
    path=[]
    curr= end
    while curr:
        path.append(curr)
        curr= visited[curr]
    path.reverse()
    
    return path, list(visited.keys())


def dfs(grid_size, start, end, walls):
    G = nx.grid_2d_graph(grid_size, grid_size)
    for wall in walls:
        G.remove_node(wall)

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
        return [], list(visited.keys())

    path = []
    curr = end
    while curr:
        path.append(curr)
        curr = visited[curr]
    path.reverse()

    return path, list(visited.keys())


def dijkstra(grid_size, start, end, walls):
    G = nx.grid_2d_graph(grid_size, grid_size)
    for wall in walls:
        G.remove_node(wall)

    distances = {node: float('inf') for node in G.nodes}
    distances[start] = 0
    prev = {start: None}
    visited = []

    heap = [(0, start)]

    while heap:
        dist, current = heapq.heappop(heap)
        if current == end:
            break
        if current in visited:
            continue
        visited.append(current)

        for neighbor in G.neighbors(current):
            new_dist = dist + 1
            if new_dist < distances[neighbor]:
                distances[neighbor] = new_dist
                prev[neighbor] = current
                heapq.heappush(heap, (new_dist, neighbor))

    if end not in prev:
        return [], visited

    path = []
    curr = end
    while curr:
        path.append(curr)
        curr = prev[curr]
    path.reverse()

    return path, visited



def astar(grid_size, start, end, walls):
    def heuristic(a, b):
        return abs(a[0] - b[0]) + abs(a[1] - b[1])  # Manhattan distance

    G = nx.grid_2d_graph(grid_size, grid_size)
    for wall in walls:
        G.remove_node(wall)

    open_set = [(0 + heuristic(start, end), 0, start)]
    came_from = {start: None}
    g_score = {start: 0}
    visited = []

    while open_set:
        _, cost, current = heapq.heappop(open_set)
        if current == end:
            break
        if current in visited:
            continue
        visited.append(current)

        for neighbor in G.neighbors(current):
            tentative_g = cost + 1
            if neighbor not in g_score or tentative_g < g_score[neighbor]:
                g_score[neighbor] = tentative_g
                priority = tentative_g + heuristic(neighbor, end)
                heapq.heappush(open_set, (priority, tentative_g, neighbor))
                came_from[neighbor] = current

    if end not in came_from:
        return [], visited

    path = []
    curr = end
    while curr:
        path.append(curr)
        curr = came_from[curr]
    path.reverse()

    return path, visited
