import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
    return response;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    // 1. Obtener el usuario autenticado con manejo seguro
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    const url = request.nextUrl.clone();
    const pathname = url.pathname;

    // 2. Manejo defensivo en rutas protegidas (/admin)
    if (pathname.startsWith('/admin')) {
      if (authError || !user) {
        url.pathname = '/login';
        return NextResponse.redirect(url);
      }

      // Verificación defensiva de consulta a 'profiles'
      // Si la consulta retorna un error de esquema (PGRST301 o similar) o data nula,
      // no romper la petición lanzando una excepción global, sino permitir continuar
      try {
        const { data: profile, error: schemaError } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', user.id)
          .maybeSingle();

        if (schemaError) {
          console.warn('[Middleware] Error de esquema controlado en consulta a profiles:', schemaError.message || schemaError);
        }
      } catch (profileQueryErr) {
        console.warn('[Middleware] Excepción capturada en consulta de profiles:', profileQueryErr);
      }
    }

    // Redirigir al panel si ya está autenticado e ingresa a /login
    if (pathname === '/login' && user && !authError) {
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }

    return response;
  } catch (err) {
    // Si ocurre cualquier error inesperado o de esquema en Supabase,
    // garantizar que el middleware nunca rompa la navegación con un 500
    console.warn('[Middleware] Excepción global manejada defensivamente:', err);
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
