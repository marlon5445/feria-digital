import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'edge';

// Endpoint para verificar o crear las credenciales iniciales del Super Admin
export async function GET() {
  const adminEmail = process.env.SUPERADMIN_EMAIL || 'admin@feriadigital.pe';
  const adminPassword = process.env.SUPERADMIN_PASSWORD || 'AdminFeria2025!';

  const supabaseAdmin = createAdminClient();

  try {
    // 1. Verificar si el usuario ya existe listando los usuarios
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      // Si la service_role key no tiene permisos o falta la variable, informamos
      return NextResponse.json(
        {
          success: false,
          error: listError.message,
          message: 'Asegúrate de configurar SUPABASE_SERVICE_ROLE_KEY en tus variables de entorno.',
        },
        { status: 500 }
      );
    }

    const existingAdmin = usersData.users.find((u) => u.email === adminEmail);

    if (existingAdmin) {
      // Si ya existe, nos aseguramos de que tenga el rol admin en raw_user_meta_data o app_metadata
      await supabaseAdmin.auth.admin.updateUserById(existingAdmin.id, {
        user_metadata: { role: 'admin' },
        app_metadata: { role: 'admin' },
      });

      return NextResponse.json({
        success: true,
        message: 'Super Admin ya existe y está activo.',
        credentials: {
          email: adminEmail,
          password: '(La contraseña existente configurada)',
          role: 'admin',
        },
      });
    }

    // 2. Crear el usuario Super Admin
    const { data: newAdmin, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { role: 'admin' },
      app_metadata: { role: 'admin' },
    });

    if (createError) {
      return NextResponse.json(
        { success: false, error: createError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '¡Super Admin inicializado exitosamente!',
      credentials: {
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        user_id: newAdmin.user.id,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno al inicializar Super Admin';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
