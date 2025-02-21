import os
from typing import Union, Dict, Optional, Sequence
from qdrant_client import QdrantClient
import autogen
from autogen.agentchat.contrib.retrieve_user_proxy_agent import RetrieveUserProxyAgent
from fastembed import TextEmbedding
from qdrant_client import models

from agent_builder.manager.embedding_functions import openai_embedding, FastEmbedEmbeddingFunction, \
    sentence_transformer_ef


class ExtendedConversableAgent(autogen.ConversableAgent):
    def __init__(self, message_processor=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.message_processor = message_processor

    def receive(
        self,
        message: Union[Dict, str],
        sender: autogen.Agent,
        request_reply: Optional[bool] = None,
        silent: Optional[bool] = False,
    ):
        if self.message_processor:
            self.message_processor(
                sender, self, message, request_reply, silent, sender_type="agent"
            )
        super().receive(message, sender, request_reply, silent)


class ExtendedGroupChatManager(autogen.GroupChatManager):
    def __init__(self, message_processor=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.message_processor = message_processor

    def receive(
        self,
        message: Union[Dict, str],
        sender: autogen.Agent,
        request_reply: Optional[bool] = None,
        silent: Optional[bool] = False,
    ):
        if self.message_processor:
            self.message_processor(
                sender, self, message, request_reply, silent, sender_type="groupchat"
            )
        super().receive(message, sender, request_reply, silent)


class ExtendedRetrieverAgent(RetrieveUserProxyAgent):

    def __init__(self, message_processor=None, *args, **kwargs):

        config = kwargs

        #config = self.update_docs_path(config)


        if config["retrieve_config"]["vector_db"] == "qdrant":
            model =  config["retrieve_config"]["embedding_model"]
            url = config["retrieve_config"]["db_config"]["client"]
            client = QdrantClient(url)
            config["retrieve_config"]["db_config"]["client"] = client
            config["retrieve_config"]["embedding_function"] = sentence_transformer_ef

            self.check_collection_exist(client, config)
        super().__init__(*args, **config)
        self.message_processor = message_processor


    # def update_docs_path(self, config):
    #     docs_path = config["retrieve_config"]["docs_path"]
    #     if "www" in docs_path:
    #         with open(os.environ["URL_PATH"], "r") as f:
    #             urls = [line.strip() for line in f]
    #         config["retrieve_config"]["docs_path"] = urls
    #     return config

    def check_collection_exist(self,client, config):
        collection_name = config["retrieve_config"]["collection_name"]
        doc_path = config["retrieve_config"]["docs_path"]
        # if "www.hdfcbank.com" in doc_path:
        #     config["retrieve_config"]["collection_name"] = "EVA_Credit_Cards"
        #     collection_name = config["retrieve_config"]["collection_name"]

        if not client.collection_exists(collection_name):
            client.create_collection(collection_name,
                                     models.VectorParams(size=1024, distance=models.Distance.COSINE)
                )

    def receive(
        self,
        message: Union[Dict, str],
        sender: autogen.Agent,
        request_reply: Optional[bool] = None,
        silent: Optional[bool] = False,
    ):
        if self.message_processor:
            self.message_processor(
                sender, self, message, request_reply, silent, sender_type="agent"
            )
        super().receive(message, sender, request_reply, silent)