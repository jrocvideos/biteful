import React, { useState, useEffect } from "react";
import { MessageSquare, X, Check, Store, Clock } from "lucide-react";

const API_URL = "https://api.boufet.com";

interface Message { id: number; order_id: string; sender_type: string; message: string; message_type: string; status: string; response?: string; created_at: string; }
interface Props { orderId: string; restaurantName: string; isOpen: boolean; onClose: () => void; }

const RESPONSE_OPTIONS: Record<string, string[]> = {
  out_of_stock: ["Yes, substitute please", "No, refund instead", "Call me to discuss"],
  delay: ["No problem, thanks for letting me know", "How much longer?", "Please cancel if over 30 min"],
  substitution: ["Sounds great!", "No thanks, refund please", "What are the options?"],
  confirmation: ["Thanks!", "Great, see you soon"],
  custom: ["Yes", "No", "Please call me"]
};

const OrderMessages: React.FC<Props> = ({ orderId, restaurantName, isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<number | null>(null);

  useEffect(() => { if (!isOpen) return; loadMessages(); const interval = setInterval(loadMessages, 5000); return () => clearInterval(interval); }, [isOpen, orderId]);

  const loadMessages = async () => {
    try {
      const res = await fetch(API_URL + "/api/orders/" + orderId + "/messages");
      const data = await res.json();
      const newMessages = data.messages || [];
      setMessages(newMessages); setLoading(false);
      const hasUnread = newMessages.some((m: Message) => m.sender_type === "restaurant" && m.status === "sent");
      if (hasUnread) fetch(API_URL + "/api/orders/" + orderId + "/messages/read", { method: "POST" });
    } catch { setLoading(false); }
  };

  const respond = async (messageId: number, response: string) => {
    setResponding(messageId);
    try {
      await fetch(API_URL + "/api/orders/" + orderId + "/message/" + messageId + "/respond", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response })
      });
      loadMessages();
    } catch {} finally { setResponding(null); }
  };

  const getResponseOptions = (msg: Message) => RESPONSE_OPTIONS[msg.message_type] || RESPONSE_OPTIONS.custom;
  const timeAgo = (date: string) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return mins + "m ago";
    return Math.floor(mins / 60) + "h ago";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-gray-900 w-full max-w-md max-h-[85vh] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center"><Store className="w-5 h-5 text-white" /></div>
            <div><h3 className="text-white font-bold">{restaurantName}</h3><p className="text-gray-400 text-xs">Order updates</p></div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full"><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && <div className="flex items-center justify-center py-8"><Clock className="w-5 h-5 text-gray-500 animate-spin" /><span className="text-gray-400 text-sm ml-2">Loading...</span></div>}
          {!loading && messages.length === 0 && <div className="text-center py-8"><MessageSquare className="w-10 h-10 text-gray-600 mx-auto mb-2" /><p className="text-gray-400 text-sm">No messages from restaurant yet</p></div>}
          {messages.map(msg => (
            <div key={msg.id} className="space-y-2">
              {msg.sender_type === "restaurant" && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0"><Store className="w-4 h-4 text-white" /></div>
                  <div className="flex-1">
                    <div className="bg-gray-800 rounded-xl rounded-tl-sm px-4 py-3">
                      <p className="text-white text-sm">{msg.message}</p>
                      <p className="text-gray-500 text-[10px] mt-1">{timeAgo(msg.created_at)}</p>
                    </div>
                    {!msg.response && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {getResponseOptions(msg).map(option => (
                          <button key={option} onClick={() => respond(msg.id, option)} disabled={responding === msg.id} className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 disabled:bg-gray-700 text-white text-xs rounded-full font-medium transition-colors">{responding === msg.id ? "..." : option}</button>
                        ))}
                      </div>
                    )}
                    {msg.response && <div className="mt-2 flex items-center gap-2 text-green-400 text-xs"><Check className="w-3.5 h-3.5" />You: {msg.response}</div>}
                  </div>
                </div>
              )}
              {msg.sender_type === "customer" && (
                <div className="flex justify-end">
                  <div className="bg-blue-600 rounded-xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                    <p className="text-white text-sm">{msg.message}</p>
                    <p className="text-blue-200 text-[10px] mt-1">{timeAgo(msg.created_at)}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-800"><p className="text-gray-500 text-xs text-center">Tap a button above to respond quickly</p></div>
      </div>
    </div>
  );
};

export default OrderMessages;
