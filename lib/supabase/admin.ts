import { createClient } from '@supabase/supabase-js';

// Cliente Supabase con privilegios administrativos (service_role)
// NOTA: Úsalo únicamente en rutas de servidor seguras o Server Actions, NUNCA en el cliente.
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('Falta configurar la variable NEXT_PUBLIC_SUPABASE_URL.');
  }

  if (!serviceRoleKey) {
    throw new Error(
      'Falta configurar la variable SUPABASE_SERVICE_ROLE_KEY en las variables de entorno del servidor. Obtén la clave service_role desde el Dashboard de Supabase.'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
