import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

// GET: Listar todas las tiendas (solo para Super Admin)
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Verificar si el usuario es admin
  const isAdmin = user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin';
  if (!isAdmin) {
    return NextResponse.json({ error: 'Acceso restringido a administradores' }, { status: 403 });
  }

  const supabaseAdmin = createAdminClient();
  const { data: stores, error } = await supabaseAdmin
    .from('stores')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ stores });
}

// POST: Crear una nueva tienda junto con la cuenta de usuario para el dueño
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const isAdmin = user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin';
  if (!isAdmin) {
    return NextResponse.json({ error: 'Acceso restringido a administradores' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      owner_email,
      owner_password,
      name,
      slug,
      whatsapp_number,
      yape_number,
      theme_color = '#dc2626',
      logo_url = null,
    } = body;

    if (!owner_email || !owner_password || !name || !slug || !whatsapp_number || !yape_number) {
      return NextResponse.json(
        { error: 'Todos los campos obligatorios deben ser completados.' },
        { status: 400 }
      );
    }

    const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const supabaseAdmin = createAdminClient();

    // 1. Verificar si el slug ya existe
    const { data: existingStore } = await supabaseAdmin
      .from('stores')
      .select('id')
      .eq('slug', normalizedSlug)
      .single();

    if (existingStore) {
      return NextResponse.json(
        { error: `El slug '${normalizedSlug}' ya está en uso. Elige otro.` },
        { status: 400 }
      );
    }

    // 2. Crear o buscar el usuario dueño en Supabase Auth
    let ownerUserId: string;

    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: owner_email,
      password: owner_password,
      email_confirm: true,
      user_metadata: { role: 'store_owner' },
      app_metadata: { role: 'store_owner' },
    });

    if (createUserError) {
      // Si el usuario ya existe, intentamos obtener su ID
      if (createUserError.message.includes('already registered') || createUserError.message.includes('already exists')) {
        const { data: usersList } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = usersList?.users.find((u) => u.email === owner_email);
        if (existingUser) {
          ownerUserId = existingUser.id;
        } else {
          return NextResponse.json({ error: createUserError.message }, { status: 400 });
        }
      } else {
        return NextResponse.json({ error: createUserError.message }, { status: 400 });
      }
    } else {
      ownerUserId = newUser.user.id;
    }

    // 3. Crear la tienda asignada al usuario
    const { data: store, error: storeError } = await supabaseAdmin
      .from('stores')
      .insert({
        user_id: ownerUserId,
        slug: normalizedSlug,
        name,
        whatsapp_number,
        yape_number,
        theme_color,
        logo_url,
      })
      .select()
      .single();

    if (storeError) {
      return NextResponse.json({ error: storeError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Tienda y credenciales creadas exitosamente.',
      store,
      owner: {
        email: owner_email,
        temporary_password: owner_password,
        user_id: ownerUserId,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al procesar la creación de la tienda';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
