import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, MessageCircle, LogIn } from 'lucide-react';

interface Message {
  text: string;
  isUser: boolean;
}

const INITIAL_OPTIONS = [
  "How can I improve my sleep quality?",
  "What's the recommended sleep duration?",
  "Tell me about sleep hygiene",
  "How to create a good sleep routine?",
  "What affects sleep quality?"
];

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! I'm your sleep assistant. Please type 'register' to create an account or 'login' if you already have one. After that, you can type 'help' to see available options.", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationData, setRegistrationData] = useState({ username: '', email: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleRegister = async () => {
    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();
      if (response.ok) {
        setUsername(registrationData.username);
        setMessages(prev => [...prev, { text: data.message, isUser: false }]);
        setIsRegistering(false);
      } else {
        setMessages(prev => [...prev, { text: data.error, isUser: false }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { text: "Sorry, there was an error registering. Please try again.", isUser: false }]);
    }
  };

  const handleOptionClick = async (option: string) => {
    setMessages(prev => [...prev, { text: option, isUser: true }]);
    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: option,
          username: username 
        }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { text: data.response, isUser: false }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting right now. Please try again later.", isUser: false }]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim().toLowerCase();
    setInput('');

    if (userMessage === 'register' && !username) {
      setIsRegistering(true);
      setMessages(prev => [...prev, { text: "Please enter your username and email:", isUser: false }]);
      return;
    }

    if (isRegistering) {
      if (!registrationData.username) {
        setRegistrationData(prev => ({ ...prev, username: userMessage }));
        setMessages(prev => [...prev, { text: "Please enter your email:", isUser: false }]);
      } else {
        setRegistrationData(prev => ({ ...prev, email: userMessage }));
        handleRegister();
      }
      return;
    }

    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);

    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          username: username 
        }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { text: data.response, isUser: false }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting right now. Please try again later.", isUser: false }]);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors"
        >
          <Bot size={24} />
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-xl w-96 h-[500px] flex flex-col">
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">Sleep Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {message.isUser ? <User size={16} /> : <Bot size={16} />}
                    <span className="text-sm font-medium">
                      {message.isUser ? 'You' : 'Assistant'}
                    </span>
                  </div>
                  <p className="whitespace-pre-line">{message.text}</p>
                </div>
              </div>
            ))}
            {messages.length === 1 && !username && (
              <div className="space-y-2 mt-4">
                <button
                  onClick={() => {
                    setIsRegistering(true);
                    setMessages(prev => [...prev, { text: "Please enter your username:", isUser: false }]);
                  }}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                >
                  <LogIn size={16} className="text-blue-600" />
                  <span className="text-gray-700">Register</span>
                </button>
              </div>
            )}
            {messages.length > 1 && messages[messages.length - 1].text.toLowerCase() === 'help' && (
              <div className="space-y-2 mt-4">
                {INITIAL_OPTIONS.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(option)}
                    className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <MessageCircle size={16} className="text-blue-600" />
                    <span className="text-gray-700">{option}</span>
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isRegistering ? "Enter your email" : "Type your message..."}
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot; 