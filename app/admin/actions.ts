'use server';

import { createClient } from '@supabase/supabase-js';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';

export interface CreateStoreInput {
  owner_email: string;
  owner_password: string;
  name: string;
  slug: string;
  whatsapp_number: string;
  yape_number: string;
  theme_color?: string;
  logo_url?: string;
}

export interface CreateStoreResponse {
  success: boolean;
  message?: string;
  error?: string;
  store?: {
    id: string;
    slug: string;
    name: string;
    logo_url: string | null;
    whatsapp_number: string;
    yape_number: string;
    theme_color: string;
    user_id: string;
  };
  owner?: {
    email: string;
    temporary_password: string;
    user_id: string;
  };
}

export async function createStoreAction(data: CreateStoreInput): Promise<CreateStoreResponse> {
  try {
    const {
      owner_email,
      owner_password,
      name,
      slug,
      whatsapp_number,
      yape_number,
      theme_color = '#dc2626',
      logo_url = '',
    } = data;

    // Validación de campos obligatorios
    if (
      !owner_email?.trim() ||
      !owner_password?.trim() ||
      !name?.trim() ||
      !slug?.trim() ||
      !whatsapp_number?.trim() ||
      !yape_number?.trim()
    ) {
      return {
        success: false,
        error: 'Todos los campos obligatorios deben ser completados.',
      };
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!serviceRoleKey || serviceRoleKey.includes('placeholder')) {
      return {
        success: false,
        error:
          'Error de configuración: La variable SUPABASE_SERVICE_ROLE_KEY no está configurada en las variables de entorno de Cloudflare Pages. Por favor agrégala en Cloudflare Pages (Settings > Variables and Secrets).',
      };
    }

    // Verificación de sesión de administrador actual (opcional y defensivo)
    try {
      const serverSupabase = await createSupabaseServerClient();
      const {
        data: { user: currentUser },
      } = await serverSupabase.auth.getUser();

      if (!currentUser) {
        return {
          success: false,
          error: 'No autorizado. Debes haber iniciado sesión como administrador.',
        };
      }

      const isAdmin =
        currentUser.user_metadata?.role === 'admin' ||
        currentUser.app_metadata?.role === 'admin' ||
        currentUser.email === 'admin@feriadigital.pe';

      if (!isAdmin) {
        const { data: profile } = await serverSupabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .maybeSingle();

        if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
          return {
            success: false,
            error: 'Permiso denegado: Esta acción solo está permitida para Super Administradores.',
          };
        }
      }
    } catch (sessionErr) {
      console.warn('[createStoreAction] Advertencia en comprobación de sesión:', sessionErr);
    }

    // Instanciar cliente con privilegios de service_role
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const normalizedSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/^-+|-+$/g, '');

    // Verificar si el slug ya está en uso
    const { data: existingStore, error: slugCheckError } = await supabaseAdmin
      .from('stores')
      .select('id')
      .eq('slug', normalizedSlug)
      .maybeSingle();

    if (slugCheckError) {
      console.warn('[createStoreAction] Error al verificar slug existente:', slugCheckError);
    }

    if (existingStore) {
      return {
        success: false,
        error: `El slug '${normalizedSlug}' ya está en uso. Por favor ingresa uno diferente.`,
      };
    }

    // a) Crear el usuario de la tienda en Supabase Auth con privilegios admin
    const cleanEmail = owner_email.trim().toLowerCase();
    const { data: userData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: owner_password.trim(),
      email_confirm: true,
      user_metadata: { role: 'user', full_name: name.trim() },
      app_metadata: { role: 'user' },
    });

    if (createUserError) {
      const msg = createUserError.message.toLowerCase();
      if (msg.includes('already registered') || msg.includes('already exists')) {
        return {
          success: false,
          error: `El correo '${cleanEmail}' ya se encuentra registrado. Utiliza un correo diferente para este negocio.`,
        };
      }
      return {
        success: false,
        error: `Error al registrar usuario: ${createUserError.message}`,
      };
    }

    const newUserId = userData.user.id;

    // b) Asignar el registro en 'public.profiles' con el rol correspondiente ('user')
    try {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert(
          {
            id: newUserId,
            email: cleanEmail,
            role: 'user',
            full_name: name.trim(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

      if (profileError) {
        console.warn('[createStoreAction] Advertencia al actualizar profiles:', profileError.message);
      }
    } catch (profileCatch) {
      console.warn('[createStoreAction] Excepción al registrar perfil:', profileCatch);
    }

    // c) Crear el registro de la tienda en 'public.stores' asociado al nuevo 'user_id'
    const { data: store, error: storeError } = await supabaseAdmin
      .from('stores')
      .insert({
        user_id: newUserId,
        slug: normalizedSlug,
        name: name.trim(),
        whatsapp_number: whatsapp_number.trim(),
        yape_number: yape_number.trim(),
        theme_color: theme_color || '#dc2626',
        logo_url: logo_url || null,
      })
      .select()
      .single();

    if (storeError) {
      // Revertir la creación del usuario si falla la creación de la tienda
      try {
        await supabaseAdmin.auth.admin.deleteUser(newUserId);
      } catch (delErr) {
        console.error('[createStoreAction] Fallo al revertir usuario tras error en stores:', delErr);
      }

      return {
        success: false,
        error: `Error al crear la tienda en la base de datos: ${storeError.message}`,
      };
    }

    return {
      success: true,
      message: '¡Tienda y usuario creados exitosamente!',
      store,
      owner: {
        email: cleanEmail,
        temporary_password: owner_password.trim(),
        user_id: newUserId,
      },
    };
  } catch (error: unknown) {
    console.error('[createStoreAction] Excepción no controlada:', error);
    const message = error instanceof Error ? error.message : 'Error inesperado al crear el negocio.';
    return {
      success: false,
      error: message,
    };
  }
}

// ─── updateStoreAction ──────────────────────────────────────────────────────
export interface UpdateStoreInput {
  id: string;
  name: string;
  slug: string;
  whatsapp_number: string;
  yape_number: string;
  theme_color: string;
  logo_url?: string | null;
}

export interface UpdateStoreResponse {
  success: boolean;
  error?: string;
  store?: UpdateStoreInput;
}

export async function updateStoreAction(data: UpdateStoreInput): Promise<UpdateStoreResponse> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!serviceRoleKey || serviceRoleKey.includes('placeholder')) {
      return { success: false, error: 'Error de configuración: SUPABASE_SERVICE_ROLE_KEY no está configurada.' };
    }

    // Verificar sesión admin
    try {
      const serverSupabase = await createSupabaseServerClient();
      const { data: { user: currentUser } } = await serverSupabase.auth.getUser();
      if (!currentUser) return { success: false, error: 'No autorizado.' };
    } catch (sessionErr) {
      console.warn('[updateStoreAction] Advertencia sesión:', sessionErr);
    }

    const { createClient: createAdminClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const normalizedSlug = data.slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/^-+|-+$/g, '');

    const { data: updated, error } = await supabaseAdmin
      .from('stores')
      .update({
        name: data.name.trim(),
        slug: normalizedSlug,
        whatsapp_number: data.whatsapp_number.trim(),
        yape_number: data.yape_number.trim(),
        theme_color: data.theme_color,
        logo_url: data.logo_url ?? null,
      })
      .eq('id', data.id)
      .select()
      .single();

    if (error) {
      return { success: false, error: `Error al actualizar la tienda: ${error.message}` };
    }

    return { success: true, store: updated };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error inesperado al actualizar el negocio.';
    return { success: false, error: message };
  }
}

// ─── deleteProductAction ───────────────────────────────────────────────────
export async function deleteProductAction(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!productId) {
      return { success: false, error: 'ID de producto no proporcionado.' };
    }

    const serverSupabase = await createSupabaseServerClient();
    const { data: { user } } = await serverSupabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'No autorizado. Debes iniciar sesión.' };
    }

    const { error } = await serverSupabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al eliminar producto.';
    return { success: false, error: msg };
  }
}