from fastapi import FastAPI , WebSocket
import uvicorn
import asyncio

from agent_builder.websocket_manager import run_websocket_server

app = FastAPI(lifespan=run_websocket_server)

@app.get("/")
def greeting():
    return "Welcome to agent builder"

@app.websocket("/create_agent")
async def create_agent(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        await websocket.send(data)

async def main():
    config = uvicorn.Config(app, port=8000)
    server = uvicorn.Server(config)
    await server.serve()

if __name__ == '__main__':
    asyncio.run(main())


# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import spacy
# from spacy.matcher import Matcher

# from fastapi import FastAPI , WebSocket
# import uvicorn
# import asyncio

# from agent_builder.websocket_manager import run_websocket_server


# # app = Flask(__name__)
# # CORS(app)

# app = FastAPI(lifespan=run_websocket_server)

# # Load spaCy model
# nlp = spacy.load("en_core_web_sm")

# # Initialize Matcher
# matcher = Matcher(nlp.vocab)

# # Define patterns for skills and document paths
# skills_pattern = [{"LOWER": {"IN": ["skills", "skill", "proficient", "expert"]}}, {"IS_ALPHA": True, "OP": "*"}]
# document_path_pattern = [{"LOWER": {"IN": ["document", "file", "path"]}}, {"IS_ALPHA": True, "OP": "*"}]
# department_pattern = [{"LOWER": {"IN": ["department", "unit", "section"]}}, {"IS_ALPHA": True, "OP": "*"}]

# # Add patterns to the matcher
# matcher.add("SKILLS", [skills_pattern])
# matcher.add("DOCUMENT_PATH", [document_path_pattern])
# matcher.add("DEPARTMENT", [department_pattern])

# # Additional matcher pattern for roles (detects "work as" and follows it to the role)
# role_pattern = [{"LOWER": "work"}, {"LOWER": "as"}, {"IS_ALPHA": True, "OP": "+"}]
# matcher.add("ROLE", [role_pattern])

# @app.route('/extract-details', methods=['POST'])
# def extract_details():
#     data = request.json
#     message = data.get('message', '')

#     # Process the message using spaCy
#     doc = nlp(message)
#     print('doc----->', doc.text)

#     # Initialize agent attributes
#     agent = {
#         "name": None,
#         "role": None,
#         "skills": None,
#         "documentPath": None,
#         "department": None,
#         "availability": "Available"  # Default value
#     }

#     # Extract name using spaCy entities (PERSON label)
#     for ent in doc.ents:
#         if ent.label_ == "PERSON":
#             agent["name"] = ent.text

#     # Extract role using Matcher for custom role patterns
#     matches = matcher(doc)
#     for match_id, start, end in matches:
#         string_id = nlp.vocab.strings[match_id]
#         span = doc[start:end]

#         if string_id == "ROLE":
#             agent["role"] = span.text.replace("work as", "").strip()
#         elif string_id == "SKILLS":
#             agent["skills"] = span.text
#         elif string_id == "DOCUMENT_PATH":
#             agent["documentPath"] = span.text
#         elif string_id == "DEPARTMENT":
#             agent["department"] = span.text

#     # Ask for missing information if needed
#     missing_fields = []
#     for key, value in agent.items():
#         if value is None:
#             missing_fields.append(key)

#     if missing_fields:
#         return jsonify({
#             'status': 'incomplete',
#             'missingFields': missing_fields,
#             'agent':agent,
#             'message': 'Please provide missing information for the agent.'
#         })

#     # Return the fully created agent if all required fields are available
#     return jsonify({
#         'status': 'success',
#         'agent': agent
#     })


# @app.get("/")
# def greeting():
#     return "Welcome to agent builder"

# @app.websocket("/create_agent")
# async def create_agent(websocket: WebSocket):
#     await websocket.accept()
#     while True:
#         data = await websocket.receive_text()
#         await websocket.send(data)

# async def main():
#     config = uvicorn.Config(app, port=8000)
#     server = uvicorn.Server(config)
#     await server.serve()
    
# if __name__ == '__main__':
#     asyncio.run(main())
    
    
# from fastapi import FastAPI , WebSocket
# import uvicorn
# import asyncio

# from agent_builder.websocket_manager import run_websocket_server


# app = FastAPI(lifespan=run_websocket_server)

# @app.get("/")
# def greeting():
#     return "Welcome to agent builder"

# @app.websocket("/create_agent")
# async def create_agent(websocket: WebSocket):
#     await websocket.accept()
#     while True:
#         data = await websocket.receive_text()
#         await websocket.send(data)

# async def main():
#     config = uvicorn.Config(app, port=8000)
#     server = uvicorn.Server(config)
#     await server.serve()

# if __name__ == '__main__':
#     asyncio.run(main())
