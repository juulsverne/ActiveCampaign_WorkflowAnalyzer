import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { Bot, SendHorizonal } from 'lucide-react';

const API_KEY = process.env.API_KEY;

const Chatbot: React.FC = () => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!API_KEY) {
            console.error("API_KEY not found for chatbot.");
            return;
        }
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const chatSession = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: "You are a helpful assistant expert in AI and process automation. Keep your answers concise and helpful."
            }
        });
        setChat(chatSession);
        setMessages([{ role: 'model', text: 'Hello! Ask me anything about your workflow analysis or AI tools.' }]);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !chat) return;

        const userMessage = { role: 'user' as const, text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const result = await chat.sendMessageStream({ message: input });
            
            setMessages((prev) => [...prev, { role: 'model' as const, text: '' }]);
            
            for await (const chunk of result) {
                const chunkText = chunk.text;
                setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text += chunkText;
                    return newMessages;
                });
            }
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = error instanceof Error ? error.message : "Sorry, I couldn't get a response.";
            setMessages((prev) => [...prev, { role: 'model' as const, text: `Error: ${errorMessage}` }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="fixed bottom-24 right-6 w-full max-w-sm h-[60vh] bg-slate-800/80 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700 flex flex-col z-40 animate-fade-in-up">
            <style>{`
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out; }
            `}</style>
            <header className="p-4 border-b border-slate-700 flex items-center gap-3 flex-shrink-0">
                <Bot className="w-6 h-6 text-cyan-400" />
                <h2 className="text-lg font-bold text-slate-100">AI Assistant</h2>
            </header>
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`prose prose-invert prose-sm max-w-[80%] rounded-lg px-3 py-2 ${
                                    msg.role === 'user' 
                                    ? 'bg-cyan-600 text-white' 
                                    : 'bg-slate-700 text-slate-200'
                                }`}
                                dangerouslySetInnerHTML={{ __html: (window as any).marked.parse(msg.text) }}
                            >
                            </div>
                        </div>
                    ))}
                    {isLoading && messages[messages.length - 1].role === 'user' && (
                         <div className="flex justify-start">
                             <div className="max-w-[80%] rounded-lg px-4 py-3 bg-slate-700 text-slate-200 flex items-center">
                                 <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                 <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s] mx-1.5"></div>
                                 <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                             </div>
                         </div>
                    )}
                </div>
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="p-4 border-t border-slate-700 flex items-center gap-2 flex-shrink-0">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything..."
                    className="flex-1 bg-slate-900 border border-slate-600 rounded-full py-2 px-4 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow duration-200 text-slate-300 placeholder-slate-500"
                    disabled={isLoading || !chat}
                />
                <button
                    type="submit"
                    disabled={isLoading || !input.trim() || !chat}
                    className="bg-cyan-600 text-white rounded-full p-2.5 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center w-10 h-10"
                    aria-label="Send message"
                >
                    {isLoading ? <ChatLoader /> : <SendHorizonal className="w-5 h-5" />}
                </button>
            </form>
        </div>
    );
};

// --- SVG Icons ---

const ChatLoader: React.FC = () => (
    <div className="w-5 h-5">
        <svg
            className="animate-spin h-full w-full text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

export default Chatbot;