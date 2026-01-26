import { useEffect, useState } from "react";
import { createClient, type Session } from "@supabase/supabase-js";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // Escuchar cambios
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);

        if (_event === "SIGNED_IN") {
          toast.success("¡Login exitoso! 🎉");
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      //setError(error.message);
      toast.error(`Error: ${error.message}`);
      setIsLoading(false);
      return;
    }

    if (session) {
      setIsLoading(false);
      setSession(data.session);
    }
  };

  // 🔑 AQUÍ SE NAVEGA
  if (session) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-indigo-700">Página de Login</h1>
        <div className="max-w-2xl mx-auto p-4">
          {/* Input de Chat */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 p-2 bg-white rounded-lg shadow-lg border border-gray-100"
          >
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
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
      </div>
    </>
  );
}
