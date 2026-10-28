'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Gift, Lock, Mail, ArrowRight, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
        console.warn('Supabase env vars missing or invalid:', { supabaseUrl: !!supabaseUrl, supabaseAnonKey: !!supabaseAnonKey });
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('Supabase Auth error details:', error);

        if (error.message?.toLowerCase().includes('failed to fetch') || error.name === 'AuthRetryableFetchError') {
          setErrorMsg('No se pudo conectar con el servidor de autenticación. Verifica las variables de entorno (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) o la configuración de CORS.');
          return;
        }

        if (error.message?.includes('Invalid login credentials')) {
          setErrorMsg('Correo o contraseña incorrectos. Verifica tus credenciales e intenta nuevamente.');
          return;
        }

        if (error.message?.includes('Email not confirmed')) {
          setErrorMsg('El correo electrónico no ha sido confirmado aún en Supabase.');
          return;
        }

        setErrorMsg(error.message || 'Error al iniciar sesión. Inténtalo de nuevo.');
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      console.error('Login unexpected error:', err);
      const rawMsg = err instanceof Error ? err.message : String(err);

      if (rawMsg.toLowerCase().includes('failed to fetch') || rawMsg.toLowerCase().includes('networkerror')) {
        setErrorMsg('No se pudo conectar con el servidor de autenticación. Verifica las variables de entorno o la configuración de CORS.');
      } else {
        setErrorMsg(rawMsg || 'No se pudo conectar con el servidor de autenticación. Verifica las variables de entorno o la configuración de CORS.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-4">
          <Gift className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900">
          Acceso a tu Panel
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Feria Digital - Administra tus productos o gestiona la plataforma
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errorMsg && (
              <div className="p-3.5 rounded-lg bg-red-50 text-red-700 text-sm font-medium border border-red-200 flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-800">Correo Electrónico</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium placeholder:text-gray-400 focus:bg-white focus:text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm shadow-sm"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800">Contraseña</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium placeholder:text-gray-400 focus:bg-white focus:text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Iniciar Sesión
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <div className="flex items-center justify-center space-x-1.5 text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>Acceso exclusivo para dueños autorizados y administración.</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              ¿Quieres publicar tu catálogo? Contacta al administrador para habilitar tu cuenta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
