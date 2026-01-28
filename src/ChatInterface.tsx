import "./index.css";
import { useState, useCallback, useEffect } from "react";
import { createClient, type Session } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Navigate } from "react-router-dom";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: crypto.randomUUID(),
      text: "Hola. Soy el asistente de La Tortuga 🐢 ¿En qué te ayudo hoy?",
      sender: "ai",
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true); // 🔐 auth

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
        setAuthLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setSession(session);
        }
      },
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  /* ----------------------------------------
   * ENVIAR MENSAJE + INVOCAR EDGE FUNCTION
   ---------------------------------------- */
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      setIsLoading(true);

      // Mensaje local
      const newMsg: Message = {
        id: crypto.randomUUID(),
        text,
        sender: "user",
      };

      setMessages((prev) => [...prev, newMsg]);
      setInput("");

      try {
        // Edge Function
        const { data, error } = await supabase.functions.invoke(
          "asistente_eventos",
          {
            body: {
              prompt: text,
              user_id: "demo-user",
            },
          },
        );

        if (error) throw error;

        const aiText =
          data?.ai_response ||
          "Hubo un problema procesando tu solicitud con la IA.";

        const aiMessage: Message = {
          id: crypto.randomUUID(),
          text: aiText,
          sender: "ai",
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch (err) {
        const errorMsg: Message = {
          id: crypto.randomUUID(),
          text: "Error de conexión con la IA.",
          sender: "ai",
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading],
  );

  // ⏳ mientras se valida la sesión
  if (authLoading) {
    return null; // o spinner
  }

  // ❌ sesión inválida
  if (!session) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  /* ----------------------------------------
   * UI DEL CHAT
   ---------------------------------------- */
  return (
    <div className="flex flex-col h-screen bg-gray-50 p-4">
      {/* Título y Encabezado */}
      <header className="pb-4 border-b border-indigo-200 mb-4">
        <h1 className="text-3xl font-bold text-indigo-700">
          Asistente La Tortuga 🐢
        </h1>
        <p className="text-sm text-gray-500">
          Gestión eventos, Bienvenid@ Juan.
        </p>
      </header>

      {/* Área de Mensajes */}
      <div className="flex-grow overflow-y-auto space-y-4 p-3 bg-white rounded-lg shadow-inner mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-3/4 p-3 rounded-xl shadow-md ${
                msg.sender === "user"
                  ? "bg-indigo-500 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-800 rounded-tl-none"
              }`}
            >
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-xs p-3 bg-gray-200 text-gray-800 rounded-xl shadow-md rounded-tl-none animate-pulse">
              <span className="inline-block w-2 h-2 bg-gray-500 rounded-full mx-0.5"></span>
              <span className="inline-block w-2 h-2 bg-gray-500 rounded-full mx-0.5 delay-100"></span>
              <span className="inline-block w-2 h-2 bg-gray-500 rounded-full mx-0.5 delay-200"></span>
            </div>
          </div>
        )}
      </div>

      {/* Input de Chat */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 p-2 bg-white rounded-lg shadow-lg border border-gray-100"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu comando o pregunta aquí (Ej: ¿Qué hay el 25 de diciembre? o Renta Salón A para Pedro el 1 de Enero)..."
          className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-200 disabled:bg-indigo-400 disabled:cursor-not-allowed"
        >
          Enviar
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
