from typing import Union, Dict, Optional

import autogen
from autogen.agentchat.contrib.retrieve_user_proxy_agent import RetrieveUserProxyAgent

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