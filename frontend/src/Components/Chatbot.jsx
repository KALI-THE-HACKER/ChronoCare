import React, { useState, useRef, useEffect } from 'react';
import { auth } from '../firebase';

const serverUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Simple Icon Components
const SendIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
  </svg>
);

const BotIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM7 9a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z"/>
  </svg>
);

const UserIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
  </svg>
);

const SimpleChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket connection setup
  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        // Prevent duplicate connections
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          return;
        }
        
        setConnectionStatus('connecting');
        
        // Get Firebase token
        const user = auth.currentUser;
        if (!user) {
          setConnectionStatus('error');
          return;
        }
        
        const token = await user.getIdToken();
        
        // Create WebSocket connection
        const wsUrl = `${serverUrl.replace('http', 'ws')}/ws/chatbot`;
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log('WebSocket connected');
          // Clear any existing messages on new connection
          setMessages([]);
          // Send authentication
          ws.send(JSON.stringify({
            type: 'auth',
            token: token
          }));
        };
        
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          if (data.type === 'auth_success') {
            setConnectionStatus('connected');
          } else if (data.type === 'auth_error') {
            setConnectionStatus('error');
            ws.close();
          } else if (data.type === 'bot_message') {
            setIsTyping(false);
            const botMessage = {
              id: `${Date.now()}_${Math.random()}`, // More unique ID
              type: 'bot',
              content: data.message,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            
            // Check for duplicate messages before adding
            setMessages(prev => {
              const isDuplicate = prev.some(msg => 
                msg.type === 'bot' && 
                msg.content === data.message && 
                Math.abs(Date.now() - parseInt(msg.id.split('_')[0])) < 1000 // Within 1 second
              );
              
              if (isDuplicate) {
                console.log('Duplicate message detected, skipping:', data.message);
                return prev;
              }
              
              return [...prev, botMessage];
            });
          } else if (data.type === 'error') {
            setIsTyping(false);
            console.error('WebSocket error:', data.message);
          }
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setConnectionStatus('error');
          setIsTyping(false);
        };
        
        ws.onclose = () => {
          console.log('WebSocket disconnected');
          setConnectionStatus('disconnected');
          setIsTyping(false);
        };
        
        wsRef.current = ws;
        
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setConnectionStatus('error');
      }
    };

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || connectionStatus !== 'connected') return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    // Send message via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'user_message',
        message: inputMessage.trim()
      }));
    }
    
    setInputMessage('');
  };

  const reconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    // Trigger reconnection by reloading component
    window.location.reload();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full p-4 flex justify-center">
      <div className="h-full w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-blue-200 flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <BotIcon className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">ChronoCare AI</h2>
                <p className="text-blue-100 text-sm">Medical Assistant</p>
              </div>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' :
                connectionStatus === 'connecting' ? 'bg-yellow-400 animate-spin' :
                connectionStatus === 'error' ? 'bg-red-400' : 'bg-gray-400'
              }`}></div>
              <span className="text-xs text-blue-100">
                {connectionStatus === 'connected' ? 'Connected' :
                 connectionStatus === 'connecting' ? 'Connecting...' :
                 connectionStatus === 'error' ? 'Error' : 'Disconnected'}
              </span>
              {connectionStatus === 'error' && (
                <button 
                  onClick={reconnectWebSocket}
                  className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition-colors"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex space-x-3 max-w-xs ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-blue-500' 
                    : 'bg-gray-300'
                }`}>
                  {message.type === 'user' ? 
                    <UserIcon className="w-4 h-4 text-white" /> : 
                    <BotIcon className="w-4 h-4 text-gray-600" />
                  }
                </div>

                {/* Message Bubble */}
                <div className={`p-3 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex space-x-3 max-w-xs">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <BotIcon className="w-4 h-4 text-gray-600" />
                </div>
                <div className="bg-gray-100 rounded-2xl p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          {connectionStatus !== 'connected' && (
            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700 text-sm text-center">
                {connectionStatus === 'connecting' ? 'Connecting to AI assistant...' :
                 connectionStatus === 'error' ? 'Connection failed. Click retry above.' :
                 'Not connected to AI assistant.'}
              </p>
            </div>
          )}
          <div className="flex space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={connectionStatus === 'connected' ? "Type your message..." : "Connecting to AI assistant..."}
              disabled={connectionStatus !== 'connected'}
              className={`flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                connectionStatus !== 'connected' ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || connectionStatus !== 'connected'}
              className={`p-3 rounded-xl transition-colors ${
                inputMessage.trim() && connectionStatus === 'connected'
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleChatbot;