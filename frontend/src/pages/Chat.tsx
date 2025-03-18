import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BaseUrl } from '../App';
import { FaPaperPlane, FaArrowLeft, FaEnvelope } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';

interface Message {
  _id: string;
  sender: string;
  recipient: string;
  content: string;
  read: boolean;
  createdAt: string;
  isFromMe?: boolean;
}

interface Conversation {
  username: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

// Function to extract query parameters
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Chat = () => {
  const query = useQuery();
  const userParam = query.get('user');
  const navigate = useNavigate();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChat, setCurrentChat] = useState<string | null>(userParam || null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const currentUsername = localStorage.getItem('username') || '';
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const prevMessagesLengthRef = useRef(0);
  
  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${BaseUrl}/msg/conversations`, {
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      });
      setConversations(response.data.conversations);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    }
  };
  
  // Fetch messages
  const fetchMessages = async (username: string) => {
    try {
      const response = await axios.get(`${BaseUrl}/msg/messages/${username}`, {
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      });
      
      // Process messages to mark sender type
      const processedMessages = response.data.messages.map((msg: Message) => ({
        ...msg,
        isFromMe: msg.sender === currentUsername
      }));
      
      setMessages(processedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };
  
  // Send message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChat) return;
    
    try {
      await axios.post(`${BaseUrl}/msg/send`, {
        recipientUsername: currentChat,
        content: newMessage
      }, {
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      });
      
      // Optimistically add message to UI
      const messageObj = {
        _id: Date.now().toString(),
        sender: currentUsername,
        recipient: currentChat,
        content: newMessage,
        read: false,
        createdAt: new Date().toISOString(),
        isFromMe: true
      };
      
      setMessages(prev => [...prev, messageObj]);
      setNewMessage('');
      
      // Always scroll to bottom after sending a message
      setShouldScrollToBottom(true);
      
      // Update conversation list
      await fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  // LinkedIn-style smooth scroll to bottom implementation
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };
  
  // Handle scroll events
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    // Check if user is near bottom (within 50px)
    const isNearBottom = 
      Math.abs((container.scrollHeight - container.scrollTop) - container.clientHeight) < 50;
    
    // Only change auto-scroll behavior if user scrolls away from bottom
    if (!isNearBottom) {
      setShouldScrollToBottom(false);
    } else {
      setShouldScrollToBottom(true);
    }
  };
  
  // Effect to handle scrolling when messages change
  useEffect(() => {
    // Only scroll if we should auto-scroll or if new messages have been added
    if (shouldScrollToBottom || messages.length > prevMessagesLengthRef.current) {
      scrollToBottom();
    }
    
    // Update the reference with current message count
    prevMessagesLengthRef.current = messages.length;
  }, [messages, shouldScrollToBottom]);
  
  // Select a conversation
  const selectConversation = (username: string) => {
    setCurrentChat(username);
    // Update URL without reloading page
    navigate(`/messages?user=${username}`, { replace: true });
    fetchMessages(username);
    setShouldScrollToBottom(true); // Reset auto-scroll when changing conversations
  };
  
  // Back to conversation list
  const backToList = () => {
    setCurrentChat(null);
    // Remove query parameter
    navigate('/messages', { replace: true });
    fetchConversations();
  };
  
  // Initial load
  useEffect(() => {
    fetchConversations();
    
    // If a user parameter exists in URL, load that conversation
    if (userParam) {
      setCurrentChat(userParam);
      fetchMessages(userParam);
    }
    
    // Poll for new messages every 5 seconds (reduced from 15)
    const interval = setInterval(() => {
      if (currentChat) {
        fetchMessages(currentChat);
      } else {
        fetchConversations();
      }
    }, 1000); // Reduced polling interval
    
    return () => clearInterval(interval);
  }, [userParam, currentUsername]);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Group messages by sender
  const getMessageGroups = () => {
    const groups: {date: string, messages: Message[]}[] = [];
    let currentDate = '';
    
    messages.forEach(message => {
      const messageDate = new Date(message.createdAt).toLocaleDateString();
      
      if (messageDate !== currentDate) {
        groups.push({
          date: messageDate,
          messages: []
        });
        currentDate = messageDate;
      }
      
      groups[groups.length - 1].messages.push(message);
    });
    
    return groups;
  };
  
  if (loading) {
    return <div className="text-center py-8 dark:text-white">Loading messages...</div>;
  }
  
  const messageGroups = getMessageGroups();
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white flex items-center">
          {currentChat ? (
            <>
              <button onClick={backToList} className="mr-4 hover:text-gray-600 dark:hover:text-gray-300">
                <FaArrowLeft />
              </button>
              <h2 className="text-xl font-semibold">{currentChat}</h2>
            </>
          ) : (
            <h2 className="text-xl font-semibold flex items-center">
              <FaEnvelope className="mr-2" /> Messages
            </h2>
          )}
        </div>
        
        {currentChat ? (
          // Chat view
          <div className="flex flex-col h-[500px]">
            <div 
              className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 scroll-smooth"
              ref={messagesContainerRef}
              onScroll={handleScroll}
            >
              {messages.length > 0 ? (
                <div className="space-y-2">
                  {messageGroups.map((group, groupIndex) => (
                    <div key={`group-${groupIndex}`}>
                      {/* Date separator */}
                      <div className="flex justify-center my-3">
                        <div className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-3 py-1 rounded-full">
                          {group.date}
                        </div>
                      </div>
                      
                      {/* Messages for this date - all aligned to left side */}
                      <div className="space-y-2">
                        {group.messages.map((message: Message) => {
                          const isFromMe = message.sender === currentUsername;
                          
                          return (
                            <div key={message._id} className="flex flex-col">
                              <div className="flex items-start">
                                {/* User avatar */}
                                <div className="flex-shrink-0">
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center 
                                    bg-gray-400 dark:bg-gray-600 text-white text-xs font-bold">
                                    {message.sender.charAt(0).toUpperCase()}
                                  </div>
                                </div>
                                
                                {/* Message content */}
                                <div className="mx-2 max-w-[80%] mb-1">
                                  <div className="relative p-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none">
                                    <span className="font-semibold text-xs block mb-1">
                                      {isFromMe ? 'You' : message.sender}
                                    </span>
                                    <p className="break-words whitespace-pre-wrap">{message.content}</p>
                                    <p className="text-xs mt-1 text-right text-gray-500 dark:text-gray-400">
                                      {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No messages yet. Start a conversation!
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 flex bg-white dark:bg-gray-800">
              <input
                type="text"
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-l-lg py-2 px-4 focus:outline-none dark:bg-gray-700 dark:text-white"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button
                type="submit"
                className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white px-4 py-2 rounded-r-lg transition-colors"
                disabled={!newMessage.trim()}
              >
                <FaPaperPlane />
              </button>
            </form>
          </div>
        ) : (
          // Conversation list
          <div className="h-[500px] overflow-y-auto bg-white dark:bg-gray-800">
            {conversations.length > 0 ? (
              conversations.map((conv) => (
                <div
                  key={conv.username}
                  onClick={() => selectConversation(conv.username)}
                  className="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-400 dark:bg-gray-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                      {conv.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className={`font-semibold ${
                          conv.unread 
                            ? 'text-gray-800 dark:text-gray-200' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {conv.username}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(conv.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${
                        conv.unread 
                          ? 'font-semibold dark:text-gray-300' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {conv.lastMessage}
                      </p>
                    </div>
                    {conv.unread && (
                      <div className="w-3 h-3 bg-gray-500 dark:bg-gray-400 rounded-full ml-2"></div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                No conversations yet. Connect with people to start messaging!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;