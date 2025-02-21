import os
from typing import Union, Sequence, Optional
from langchain_openai import OpenAIEmbeddings
from sentence_transformers import SentenceTransformer
from fastembed import TextEmbedding


Embeddings = Union[Sequence[float], Sequence[int]]

class FastEmbedEmbeddingFunction:
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



openai_embedding = OpenAIEmbeddings(model="text-embedding-ada-002").embed_documents

sentence_transformer_ef = SentenceTransformer("BAAI/bge-large-en-v1.5").encode