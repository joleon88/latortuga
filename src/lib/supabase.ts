// ./src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

// Asegúrate de que las variables de entorno estén accesibles
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Las variables de entorno de Supabase no están configuradas en .env"
  );
}

// Crear el cliente
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
