// src/supabase.js
import { createClient } from '@supabase/supabase-js'

// Accedemos a las variables de entorno definidas en .env
// Vite las expone a través de import.meta.env, y deben empezar con VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Verificamos que las variables se hayan cargado correctamente (útil para depuración)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Las variables de entorno de Supabase no están definidas.')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)
export { supabase }

// Para depuración en la consola del navegador
window.supabase = supabase
