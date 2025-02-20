import os
from typing import Union, Dict, Optional, Sequence
from qdrant_client import QdrantClient
import autogen
from autogen.agentchat.contrib.retrieve_user_proxy_agent import RetrieveUserProxyAgent
from fastembed import TextEmbedding
from qdrant_client import models

Embeddings = Union[Sequence[float], Sequence[int]]

class FastEmbedEmbeddingFunction():
    """Embedding function implementation using FastEmbed - https://qdrant.github.io/fastembed."""

    def __init__(
        self,
        model_name: str = "BAAI/bge-small-en-v1.5",
        batch_size: int = 256,
        cache_dir: Optional[str] = None,
        threads: Optional[int] = None,
        parallel: Optional[int] = None,
        **kwargs,
    ):
        """Initialize fastembed.TextEmbedding.

        Args:
            model_name (str): The name of the model to use. Defaults to `"BAAI/bge-small-en-v1.5"`.
            batch_size (int): Batch size for encoding. Higher values will use more memory, but be faster.\
                                        Defaults to 256.
            cache_dir (str, optional): The path to the model cache directory.\
                                       Can also be set using the `FASTEMBED_CACHE_PATH` env variable.
            threads (int, optional): The number of threads single onnxruntime session can use.
            parallel (int, optional): If `>1`, data-parallel encoding will be used, recommended for large datasets.\
                                      If `0`, use all available cores.\
                                      If `None`, don't use data-parallel processing, use default onnxruntime threading.\
                                      Defaults to None.
            **kwargs: Additional options to pass to fastembed.TextEmbedding
        Raises:
            ValueError: If the model_name is not in the format `<org>/<model>` e.g. BAAI/bge-small-en-v1.5.
        """
        self._batch_size = batch_size
        self._parallel = parallel
        self._model = TextEmbedding(model_name=model_name, cache_dir=cache_dir, threads=threads, **kwargs)

    def __call__(self, inputs: list[str]) -> list[Embeddings]:
        embeddings = self._model.embed(inputs, batch_size=self._batch_size, parallel=self._parallel)

        return [embedding.tolist() for embedding in embeddings]

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
            config["retrieve_config"]["embedding_function"] = FastEmbedEmbeddingFunction(model)

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