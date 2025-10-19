import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { generateFromGemini } from "./geminiClient";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";

export default function Dashboard({ user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]); // previous chats
  const [activeChatId, setActiveChatId] = useState(null); // current chat id
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Auto-scroll
  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  // Fetch chat history
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.email) return;
      const { data, error } = await supabase
        .from("Pitch-Craft-Ai")
        .select("*")
        .eq("user_email", user?.email)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("History fetch error:", error);
      } else {
        const chats = [];
        const chatMap = {};
        data.forEach((msg) => {
          const chatId = msg.chat_id || msg.id;
          if (!chatMap[chatId]) {
            chatMap[chatId] = [];
            chats.push({ chatId, messages: chatMap[chatId] });
          }
          chatMap[chatId].push({
            id: msg.id,
            role: "user",
            text: msg.user_message,
            timestamp: msg.created_at,
          });
          chatMap[chatId].push({
            id: msg.id + 0.5,
            role: "ai",
            text: msg.ai_reply,
            timestamp: msg.created_at,
          });
        });
        setHistory(chats);

        if (chats.length > 0) {
          setActiveChatId(chats[chats.length - 1].chatId);
          setMessages(chats[chats.length - 1].messages);
        }
      }
    };
    fetchHistory();
  }, [user?.email]);

  // Send message
  const handleSend = async () => {
    if (!input.trim()) return;

    const newUserMsg = { id: Date.now(), role: "user", text: input, timestamp: new Date() };
    setMessages(prev => [...prev, newUserMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const aiReply = await generateFromGemini(input); // your AI generates startup ideas
      const newAiMsg = { id: Date.now() + 1, role: "ai", text: aiReply, timestamp: new Date() };
      setMessages(prev => [...prev, newAiMsg]);

      const { data, error } = await supabase
        .from("Pitch-Craft-Ai")
        .insert([{
          chat_id: activeChatId || Date.now(),
          user_email: user?.email,
          user_message: input,
          ai_reply: aiReply,
        }])
        .select();

      if (error) console.error("Supabase insert error:", error);
      else {
        const chatId = data[0].chat_id;
        setActiveChatId(chatId);

        setHistory(prevHistory => {
          const existing = prevHistory.find(c => c.chatId === chatId);
          if (existing) {
            existing.messages.push(newUserMsg, newAiMsg);
            return [...prevHistory];
          } else {
            return [...prevHistory, { chatId, messages: [newUserMsg, newAiMsg] }];
          }
        });
      }
    } catch (err) {
      console.error("AI Error:", err);
      setMessages(prev => [...prev, { id: Date.now() + 2, role: "ai", text: "⚠️ Error generating response. Try again.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async (aiId, userMessage) => {
    setIsLoading(true);
    try {
      const newReply = await generateFromGemini(userMessage);
      setMessages(prev => prev.map(msg => msg.id === aiId ? { ...msg, text: newReply } : msg));

      const { error } = await supabase
        .from("Pitch-Craft-Ai")
        .update({ ai_reply: newReply })
        .eq("user_email", user?.email)
        .eq("user_message", userMessage);
      if (error) console.error("Supabase update error:", error);
    } catch (err) {
      console.error("Regenerate error:", err);
      Swal.fire({ icon: "error", title: "Regeneration Failed", text: "Please try again later", confirmButtonColor: "#6366F1" });
    } finally { setIsLoading(false); }
  };

  const downloadPDF = (text) => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.setTextColor(79, 70, 229);
    doc.text("PitchCraft AI Reply", 20, 30);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const splitText = doc.splitTextToSize(text, 170);
    doc.text(splitText, 20, 50);
    doc.save("PitchCraft_Reply.pdf");
  };

  const formatTime = (timestamp) => new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const findUserMessageForAI = (aiMessageId) => {
    const aiIndex = messages.findIndex(msg => msg.id === aiMessageId);
    return aiIndex > 0 ? messages[aiIndex - 1].text : "";
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) Swal.fire({ icon: "error", title: "Logout Failed", text: error.message, confirmButtonColor: "#6366F1" });
      else {
        Swal.fire({ icon: "success", title: "Logged Out", text: "See you again soon!", confirmButtonColor: "#6366F1", timer: 2000 });
        navigate("/login", { replace: true });
      }
    } catch (err) { console.error("Logout error:", err); }
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
  };

  const loadChat = (chatId) => {
    const chat = history.find(c => c.chatId === chatId);
    if (chat) {
      setActiveChatId(chatId);
      setMessages(chat.messages);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 text-white flex flex-col p-4">
        <h2 className="text-lg font-bold mb-4">History</h2>
        <button onClick={handleNewChat} className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded mb-4">+ New Chat</button>
        <div className="flex-1 overflow-y-auto space-y-2">
          {history.map(chat => (
            <div key={chat.chatId} onClick={() => loadChat(chat.chatId)} className={`p-2 rounded cursor-pointer ${chat.chatId === activeChatId ? 'bg-purple-700' : 'hover:bg-purple-600'}`}>
              {chat.messages[0]?.text.substring(0, 20)}...
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative bg-slate-900">
        <header className="bg-slate-900/80 backdrop-blur-xl p-4 flex justify-between items-center border-b border-white/10">
          <h1 className="text-white font-bold text-xl">PitchCraft AI</h1>
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">Logout</button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && <div className="text-center text-gray-400 mt-10">Start a new conversation...</div>}
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-xl max-w-[70%] ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-white/10 text-white backdrop-blur-sm relative'}`}>
                {msg.text}
                <div className="text-xs text-gray-400 mt-1">{formatTime(msg.timestamp)}</div>

                {msg.role === 'ai' && (
                  <div className="flex space-x-2 mt-2">
                    <button onClick={() => downloadPDF(msg.text)} className="text-gray-400 hover:text-purple-400 text-xs flex items-center space-x-1">
                      <i className="fas fa-download"></i><span>Download</span>
                    </button>
                    <button onClick={() => handleRegenerate(msg.id, findUserMessageForAI(msg.id))} className={`text-gray-400 hover:text-purple-400 text-xs flex items-center space-x-1 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isLoading}>
                      <i className={`fas fa-sync-alt ${isLoading ? 'animate-spin' : ''}`}></i><span>Regenerate</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef}></div>
        </div>

        <div className="p-4 bg-slate-800 flex space-x-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            className="flex-1 px-4 py-2 rounded-xl bg-slate-700 text-white focus:outline-none"
            placeholder="Type your startup idea..." disabled={isLoading} />
          <button onClick={handleSend} className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded" disabled={isLoading}>Send</button>
        </div>
      </div>
    </div>
  );
}
