from fastapi import FastAPI, Request
from collections import deque
from pydantic import BaseModel
from typing import List, Tuple, Literal
from fastapi.middleware.cors import CORSMiddleware
from algorithms import bfs,dfs,astar,dijkstra
from graph_algorithms import bfs as graph_bfs , dfs as graph_dfs , astar as graph_astar , dijkstra as graph_dijkstra
import networkx as nx

app=FastAPI()


@app.get("/")
def root():
    return {"message":"Server is running!"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class GridRequest(BaseModel):
    grid_size: int
    start: tuple[int , int]
    end: tuple[int, int]
    walls: List[tuple[int, int ]]
    algorithm: Literal["bfs", "dfs", "dijkstra", "astar"]

class GraphRequest(BaseModel):
    nodes: List[str]
    edges: List[Tuple[str, str]]
    start: str
    end: str
    algorithm: str


@app.post("/pathfind")
async def pathfind(req: GridRequest):
    print("Received algorithm:", req.algorithm)
    if req.algorithm == "bfs":
        path, visited = bfs(req.grid_size, req.start, req.end, req.walls)
    elif req.algorithm == "dfs":
        path, visited = dfs(req.grid_size, req.start, req.end, req.walls)
    elif req.algorithm == "dijkstra":
        path, visited = dijkstra(req.grid_size, req.start, req.end, req.walls)
    elif req.algorithm == "astar":
        path, visited = astar(req.grid_size, req.start, req.end, req.walls)
    else:
        return {"visited": [], "path": []}

    return {"path": path, "visited": visited}


@app.post("/graphfind")
async def graphfind(req: GraphRequest):
    print("Received algorithm:", req.algorithm)
    G = nx.Graph()
    G.add_nodes_from(req.nodes)
    G.add_edges_from(req.edges)

    visited = []
    path = []

    if req.algorithm == "bfs":
        visited, path = graph_bfs(G, req.start, req.end)
    elif req.algorithm == "dfs":
        visited, path = graph_dfs(G, req.start, req.end)
    elif req.algorithm == "dijkstra":
        visited, path = graph_dijkstra(G, req.start, req.end)
    elif req.algorithm == "astar":
        visited, path = graph_astar(G, req.start, req.end)
    else:
        return {"visited": [], "path": []}

    return {"visited": visited, "path": path}