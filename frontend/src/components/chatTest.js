// import React, { useState } from 'react';
// import { TextField, Button, Box } from '@mui/material';
// import MessageBubble from './MessageBubble';
// import AgentDetailsModal from './AgentDetailsModal';
// import { parseUserDetails } from '../utils/userDetails';

// const ChatBox = ({ onCreateAgent }) => {
//   const [message, setMessage] = useState('');
//   const [messages, setMessages] = useState([]);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [agentDetails, setAgentDetails] = useState({});
//   const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

//   const handleSend = () => {
//     if (message.trim()) {
//       const userMessage = message.trim().toLowerCase();
//       setMessages((prev) => [...prev, { text: message, isUser: true }]);
//       setMessage('');

//       if (awaitingConfirmation) {
//         if (['modify', 'edit', 'change', 'update'].includes(userMessage)) {
//           setModalOpen(true);
//         } else if (['confirm', 'yes', 'okay', 'proceed'].includes(userMessage)) {
//           onCreateAgent(agentDetails);
//           setMessages((prev) => [
//             ...prev,
//             { text: 'Agent has been successfully created!', isUser: false },
//           ]);
//         } else {
//           setMessages((prev) => [...prev, { text: 'Please type confirm or modify.', isUser: false }]);
//         }
//         return;
//       }

//       const details = parseUserDetails(message);
//       setAgentDetails(details);

//       const formattedDetails = `**Agent Details:**\n\n- **Name:** ${details.name || 'N/A'}\n- **Role:** ${details.role || 'N/A'}\n- **Skills:** ${details.skills || 'N/A'}\n- **Document Path:** ${details.documentPath || 'N/A'}`;
      
//       setTimeout(() => {
//         setMessages((prev) => [
//           ...prev,
//           { text: 'Here are the extracted details:', isUser: false },
//           { text: formattedDetails, isUser: false },
//           { text: 'Please confirm or modify the details.', isUser: false },
//         ]);
//         setAwaitingConfirmation(true);
//       }, 1000);
//     }
//   };

//   const handleSubmitDetails = (details) => {
//     setAgentDetails(details);
//     setModalOpen(false);
//     setMessages((prev) => [
//       ...prev,
//       { text: 'Updated agent details. Please confirm or modify again.', isUser: false },
//     ]);
//   };

//   return (
//     <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
//       <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
//         {messages?.map((msg, index) => (
//           <MessageBubble key={index} message={msg.text} isUser={msg.isUser} />
//         ))}
//       </Box>
//       <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
//         <TextField
//           fullWidth
//           variant="outlined"
//           placeholder="Type a message..."
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           onKeyPress={(e) => e.key === 'Enter' && handleSend()}
//         />
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={handleSend}
//           sx={{ ml: 2 }}
//         >
//           Send
//         </Button>
//       </Box>
//       <AgentDetailsModal
//         open={modalOpen}
//         onClose={() => setModalOpen(false)}
//         onSubmit={handleSubmitDetails}
//         agentDetails={agentDetails}
//       />
//     </Box>
//   );
// };

// export default ChatBox;
