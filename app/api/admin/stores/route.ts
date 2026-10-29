import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { createStoreAction } from '@/app/admin/actions';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

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

  try {
    const supabaseAdmin = createAdminClient();
    const { data: stores, error } = await supabaseAdmin
      .from('stores')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ stores });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al consultar tiendas';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: Crear una nueva tienda junto con la cuenta de usuario para el dueño
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await createStoreAction(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al procesar la creación de la tienda';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
