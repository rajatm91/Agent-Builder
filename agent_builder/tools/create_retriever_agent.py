import os
from typing import Union, List
from autogen.agentchat.contrib.retrieve_user_proxy_agent import RetrieveUserProxyAgent
import autogen
from sentence_transformers import SentenceTransformer


def create_retriever_agent(agent_name: str,
                           docs_path: Union[str,List[str]],
                           model_name: str = "gpt-4o",
                           ) -> dict :

    embedding_model = "BAAI/bge-large-en-v1.5"
    embedding_function = SentenceTransformer(embedding_model).encode
    # rag_proxy_agent = RetrieveUserProxyAgent(
    #     name=agent_name,
    #     human_input_mode="NEVER",
    #     max_consecutive_auto_reply=1,
    #     retrieve_config={
    #         "task": "qa",
    #         "docs_path" : docs_path,
    #         "vector_db": "pgvector",
    #         "collection_name": f"{agent_name}_collection",
    #         "db_config": {
    #             "connection_string": os.environ["DATABASE_CONN"]
    #         },
    #         "embedding_function": embedding_function,
    #         "chunk_token_size": 512,
    #         "model": model_name
    #     },
    #     code_execution_config=False
    # )

    return { "name": agent_name,
             "max_consecutive_auto_reply": 1,
             "documentPath": docs_path,
             "collection_name":  f"{agent_name}_collection",
             "model": model_name,
             "embedding_model": embedding_model,
             "availability": "Available"}