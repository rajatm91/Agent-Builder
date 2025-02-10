from fastapi import FastAPI , WebSocket
import uvicorn
import asyncio

from agent_builder.websocket_manager import run_websocket_server

app = FastAPI(lifespan=run_websocket_server)

@app.get("/")
def greeting():
    return "Welcome to agent builder"

# @app.websocket("/create_agent")
# async def create_agent(websocket: WebSocket):
#     await websocket.accept()
#     while True:
#         data = await websocket.receive_text()
#         await websocket.send(data)

async def main():
    config = uvicorn.Config(app, port=8000)
    server = uvicorn.Server(config)
    await server.serve()

if __name__ == '__main__':
    asyncio.run(main())
