'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { createStoreAction } from '@/app/admin/actions';
import CloudinaryUpload from '@/components/CloudinaryUpload';
import {
  Store,
  Package,
  Plus,
  Trash2,
  ExternalLink,
  LogOut,
  Save,
  Loader2,
  Eye,
  EyeOff,
  ShieldAlert,
  Users,
  Copy,
  CheckCircle,
  KeyRound,
  Sparkles
} from 'lucide-react';

interface StoreData {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  whatsapp_number: string;
  yape_number: string;
  theme_color: string;
  user_id?: string;
  created_at?: string;
}

interface Product {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string;
  is_active: boolean;
}

interface NewStoreResult {
  store: StoreData;
  owner: {
    email: string;
    temporary_password: string;
    user_id: string;
  };
}

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');

  // Estados para Dueño de Tienda
  const [savingStore, setSavingStore] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Estados para Super Admin
  const [allStores, setAllStores] = useState<StoreData[]>([]);
  const [creatingStore, setCreatingStore] = useState(false);
  const [newStoreModalResult, setNewStoreModalResult] = useState<NewStoreResult | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Formulario de Super Admin para Crear Tienda + Usuario
  const [adminCreateStoreForm, setAdminCreateStoreForm] = useState({
    owner_email: '',
    owner_password: '',
    name: '',
    slug: '',
    whatsapp_number: '',
    yape_number: '',
    theme_color: '#dc2626',
    logo_url: '',
  });

  // Formulario de Edición de Tienda (Dueño)
  const [storeForm, setStoreForm] = useState({
    slug: '',
    name: '',
    logo_url: '',
    whatsapp_number: '',
    yape_number: '',
    theme_color: '#dc2626',
  });

  // Formulario de Nuevo Producto (Dueño)
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: 'General',
  });

  const loadUserData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push('/login');
        return;
      }

      setCurrentUserEmail(user.email || '');

      // Verificar si el usuario es Super Admin (por metadata o correo admin)
      let adminCheck =
        user.user_metadata?.role === 'admin' ||
        user.app_metadata?.role === 'admin' ||
        user.email?.toLowerCase().includes('admin@feriadigital.pe');

      // Verificación y auto-creación defensiva del perfil en public.profiles
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, role, full_name')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.warn('[Admin loadUserData] Advertencia en consulta a profiles (esquema o red):', profileError.message || profileError);
        } else if (!profileData) {
          // Si no existe el perfil tras el login, crearlo automáticamente
          await supabase.from('profiles').upsert({
            id: user.id,
            email: user.email,
            role: adminCheck ? 'admin' : 'user',
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
            updated_at: new Date().toISOString(),
          });
        } else if (profileData.role === 'admin' || profileData.role === 'super_admin') {
          adminCheck = true;
        }
      } catch (profileCatchErr) {
        // Aseguramos que un error de esquema en profiles no rompa la aplicación
        console.warn('[Admin loadUserData] Excepción de esquema en profiles manejada defensivamente:', profileCatchErr);
      }

      setIsAdmin(!!adminCheck);

      if (adminCheck) {
        // Cargar todas las tiendas para el Super Admin
        try {
          const res = await fetch('/api/admin/stores');
          if (res.ok) {
            const data = await res.json();
            setAllStores(data.stores || []);
          }
        } catch (err) {
          console.error('Error al cargar tiendas como admin:', err);
        }
      } else {
        // Cargar la tienda propia del usuario de manera defensiva (stores / businesses)
        try {
          const { data: storeData, error: storeError } = await supabase
            .from('stores')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          if (storeError) {
            console.warn('[Admin loadUserData] Error al consultar store (controlado):', storeError.message || storeError);
          }

          if (storeData) {
            setStore(storeData);
            setStoreForm({
              slug: storeData.slug,
              name: storeData.name,
              logo_url: storeData.logo_url || '',
              whatsapp_number: storeData.whatsapp_number,
              yape_number: storeData.yape_number,
              theme_color: storeData.theme_color || '#dc2626',
            });

            // Cargar productos
            try {
              const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('*')
                .eq('store_id', storeData.id)
                .order('created_at', { ascending: false });

              if (productsError) {
                console.warn('[Admin loadUserData] Error al consultar products:', productsError.message || productsError);
              }
              if (productsData) setProducts(productsData);
            } catch (prodCatchErr) {
              console.warn('[Admin loadUserData] Excepción en products manejada:', prodCatchErr);
            }
          }
        } catch (storeCatchErr) {
          console.warn('[Admin loadUserData] Excepción en store manejada defensivamente:', storeCatchErr);
        }
      }
    } catch (globalAdminErr) {
      console.warn('[Admin loadUserData] Error global manejado defensivamente:', globalAdminErr);
    } finally {
      setLoading(false);
    }
  }, [router, supabase]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Handler para Super Admin: Crear Tienda y Cuenta de Dueño
  const handleAdminCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingStore(true);
    setMessage(null);

    try {
      const result = await createStoreAction(adminCreateStoreForm);

      if (!result.success || !result.store || !result.owner) {
        throw new Error(result.error || 'Error al registrar el negocio.');
      }

      setNewStoreModalResult({
        store: result.store,
        owner: result.owner,
      });
      setMessage({ text: '¡Tienda y credenciales creadas con éxito!', type: 'success' });
      setAdminCreateStoreForm({
        owner_email: '',
        owner_password: '',
        name: '',
        slug: '',
        whatsapp_number: '',
        yape_number: '',
        theme_color: '#dc2626',
        logo_url: '',
      });

      // Recargar lista de tiendas
      const listRes = await fetch('/api/admin/stores');
      if (listRes.ok) {
        const listData = await listRes.json();
        setAllStores(listData.stores || []);
      }
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : 'Error inesperado al crear el negocio.';
      setMessage({ text: errMessage, type: 'error' });
    } finally {
      setCreatingStore(false);
    }
  };

  // Handler para Dueño: Guardar Datos de su Tienda
  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStore(true);
    setMessage(null);

    if (!store) return;

    const normalizedSlug = storeForm.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    const { data, error } = await supabase
      .from('stores')
      .update({
        slug: normalizedSlug,
        name: storeForm.name,
        logo_url: storeForm.logo_url,
        whatsapp_number: storeForm.whatsapp_number,
        yape_number: storeForm.yape_number,
        theme_color: storeForm.theme_color,
      })
      .eq('id', store.id)
      .select()
      .single();

    if (error) {
      setMessage({ text: 'Error al actualizar la tienda: ' + error.message, type: 'error' });
    } else {
      setStore(data);
      setMessage({ text: '¡Configuración de tienda guardada exitosamente!', type: 'success' });
    }
    setSavingStore(false);
  };

  // Handler para Dueño: Crear Producto
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) {
      setMessage({ text: 'No tienes una tienda asignada para crear productos.', type: 'error' });
      return;
    }

    setCreatingProduct(true);
    setMessage(null);

    const { data, error } = await supabase
      .from('products')
      .insert({
        store_id: store.id,
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        image_url: productForm.image_url || null,
        category: productForm.category || 'General',
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      setMessage({ text: 'Error al agregar producto: ' + error.message, type: 'error' });
    } else {
      setProducts([data, ...products]);
      setProductForm({
        name: '',
        description: '',
        price: '',
        image_url: '',
        category: 'General',
      });
      setMessage({ text: '¡Producto añadido correctamente!', type: 'success' });
    }
    setCreatingProduct(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const handleToggleProductStatus = async (product: Product) => {
    const { error } = await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id);

    if (!error) {
      setProducts(
        products.map((p) => (p.id === product.id ? { ...p, is_active: !product.is_active } : p))
      );
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const copyCredentialsToClipboard = () => {
    if (!newStoreModalResult) return;
    const text = `🎉 ¡Hola! Tu catálogo digital en Feria Digital ha sido creado.\n\n🔗 Catálogo Público: https://feriadigital.pe/${newStoreModalResult.store.slug}\n🔑 Panel de Control: https://feriadigital.pe/login\n📧 Usuario / Correo: ${newStoreModalResult.owner.email}\n🔒 Contraseña Temporal: ${newStoreModalResult.owner.temporary_password}\n\nInicia sesión para subir tus productos y personalizar tu catálogo.`;
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  // ==========================================
  // VISTA 1: SUPER ADMINISTRADOR
  // ==========================================
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Top Navbar Super Admin */}
        <nav className="bg-gray-900 border-b border-gray-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShieldAlert className="w-6 h-6 text-red-500" />
              <div>
                <span className="font-bold text-lg leading-none block">Panel de Super Administrador</span>
                <span className="text-xs text-gray-400 font-mono">{currentUserEmail}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="inline-flex items-center text-sm font-medium text-gray-300 hover:text-white bg-gray-800 px-3 py-1.5 rounded-lg transition"
              >
                <LogOut className="w-4 h-4 mr-1.5" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {message && (
            <div
              className={`p-4 rounded-xl text-sm font-medium ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Modal / Banner de Credenciales Generadas */}
          {newStoreModalResult && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2 text-amber-900 font-bold text-lg mb-2">
                  <Sparkles className="w-6 h-6 text-amber-600" />
                  <h3>¡Tienda Registrada y Credenciales Generadas!</h3>
                </div>
                <button
                  onClick={() => setNewStoreModalResult(null)}
                  className="text-amber-700 hover:text-amber-900 text-xs font-semibold px-2 py-1 rounded bg-amber-100"
                >
                  Cerrar
                </button>
              </div>
              <p className="text-sm text-amber-800 mb-4">
                Comparte las siguientes credenciales con el emprendedor para que pueda gestionar su catálogo:
              </p>

              <div className="bg-white p-4 rounded-xl border border-amber-200 font-mono text-sm space-y-2">
                <div><span className="text-gray-500 font-sans">Tienda:</span> <strong className="text-gray-900 font-sans">{newStoreModalResult.store.name}</strong></div>
                <div><span className="text-gray-500 font-sans">URL Catálogo:</span> <strong className="text-red-600">/{newStoreModalResult.store.slug}</strong></div>
                <div><span className="text-gray-500 font-sans">Correo / Usuario:</span> <strong>{newStoreModalResult.owner.email}</strong></div>
                <div><span className="text-gray-500 font-sans">Contraseña Inicial:</span> <strong className="text-amber-700">{newStoreModalResult.owner.temporary_password}</strong></div>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={copyCredentialsToClipboard}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition"
                >
                  {copiedKey ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1.5" />
                      ¡Mensaje Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1.5" />
                      Copiar Mensaje para WhatsApp del Dueño
                    </>
                  )}
                </button>
                <a
                  href={`/${newStoreModalResult.store.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition"
                >
                  Ver Catálogo Creado
                  <ExternalLink className="w-4 h-4 ml-1.5" />
                </a>
              </div>
            </div>
          )}

          {/* Formulario de Registro de Nuevo Negocio / Tienda */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
              <Plus className="w-5 h-5 mr-2 text-red-600" />
              Crear Nuevo Negocio y Asignar Credenciales
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Registra una nueva tienda en la plataforma y define las credenciales de acceso para su dueño.
            </p>

            <form onSubmit={handleAdminCreateStore} className="space-y-6">
              {/* Sección 1: Datos de Acceso del Dueño */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
                <h3 className="text-sm font-bold text-gray-800 flex items-center">
                  <KeyRound className="w-4 h-4 mr-1.5 text-gray-600" />
                  Credenciales de Acceso para el Dueño
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Correo Electrónico del Dueño *
                    </label>
                    <input
                      type="email"
                      required
                      value={adminCreateStoreForm.owner_email}
                      onChange={(e) => setAdminCreateStoreForm({ ...adminCreateStoreForm, owner_email: e.target.value })}
                      placeholder="emprendedor@ejemplo.com"
                      className="block w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Contraseña Inicial *
                    </label>
                    <input
                      type="text"
                      required
                      value={adminCreateStoreForm.owner_password}
                      onChange={(e) => setAdminCreateStoreForm({ ...adminCreateStoreForm, owner_password: e.target.value })}
                      placeholder="Clave1234!"
                      className="block w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono text-gray-900 placeholder:text-gray-400 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 2: Información Básica del Negocio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre del Negocio / Tienda *</label>
                  <input
                    type="text"
                    required
                    value={adminCreateStoreForm.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                      setAdminCreateStoreForm({
                        ...adminCreateStoreForm,
                        name,
                        slug: adminCreateStoreForm.slug ? adminCreateStoreForm.slug : slug,
                      });
                    }}
                    placeholder="Ej: Dulces y Detalles Santa"
                    className="mt-1 block w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Slug de la URL (Único) *</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm font-mono">
                      /
                    </span>
                    <input
                      type="text"
                      required
                      value={adminCreateStoreForm.slug}
                      onChange={(e) => setAdminCreateStoreForm({ ...adminCreateStoreForm, slug: e.target.value })}
                      placeholder="dulces-santa"
                      className="block w-full min-w-0 flex-1 rounded-none rounded-r-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-red-500 focus:border-red-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">WhatsApp Oficial (con código país) *</label>
                  <input
                    type="text"
                    required
                    value={adminCreateStoreForm.whatsapp_number}
                    onChange={(e) => setAdminCreateStoreForm({ ...adminCreateStoreForm, whatsapp_number: e.target.value })}
                    placeholder="Ej: 51987654321"
                    className="mt-1 block w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Número de Yape / Plin *</label>
                  <input
                    type="text"
                    required
                    value={adminCreateStoreForm.yape_number}
                    onChange={(e) => setAdminCreateStoreForm({ ...adminCreateStoreForm, yape_number: e.target.value })}
                    placeholder="Ej: 987654321"
                    className="mt-1 block w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Color Distintivo del Catálogo</label>
                  <div className="mt-1 flex items-center space-x-3">
                    <input
                      type="color"
                      value={adminCreateStoreForm.theme_color}
                      onChange={(e) => setAdminCreateStoreForm({ ...adminCreateStoreForm, theme_color: e.target.value })}
                      className="h-10 w-16 p-1 border border-gray-300 rounded cursor-pointer"
                    />
                    <span className="text-sm font-mono text-gray-600">{adminCreateStoreForm.theme_color}</span>
                  </div>
                </div>

                <div>
                  <CloudinaryUpload
                    label="Logo de la Tienda (Opcional)"
                    currentImageUrl={adminCreateStoreForm.logo_url}
                    onUploadSuccess={(url) => setAdminCreateStoreForm({ ...adminCreateStoreForm, logo_url: url })}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={creatingStore}
                  className="inline-flex items-center px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow-md transition disabled:opacity-50"
                >
                  {creatingStore ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  Registrar Negocio y Crear Credenciales
                </button>
              </div>
            </form>
          </div>

          {/* Listado de Negocios Registrados */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Users className="w-5 h-5 mr-2 text-red-600" />
              Negocios Registrados en la Plataforma ({allStores.length})
            </h2>

            {allStores.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Aún no hay negocios creados. Utiliza el formulario superior para registrar el primero.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allStores.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-3 mb-3">
                        {item.logo_url ? (
                          <img
                            src={item.logo_url}
                            alt={item.name}
                            className="w-12 h-12 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: item.theme_color || '#dc2626' }}
                          >
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-gray-900 text-base leading-tight">{item.name}</h3>
                          <span className="text-xs font-mono text-red-600 font-semibold">/{item.slug}</span>
                        </div>
                      </div>

                      <div className="text-xs text-gray-600 space-y-1 mt-3 pt-3 border-t border-gray-100">
                        <div><strong>WhatsApp:</strong> {item.whatsapp_number}</div>
                        <div><strong>Yape / Plin:</strong> {item.yape_number}</div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <a
                        href={`/${item.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-xs font-bold text-red-600 hover:text-red-700"
                      >
                        Ver Catálogo
                        <ExternalLink className="w-3.5 h-3.5 ml-1" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // VISTA 2: DUEÑO DE TIENDA AUTORIZADO
  // ==========================================
  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <Store className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Tienda no vinculada</h2>
          <p className="text-sm text-gray-600">
            Tu cuenta ({currentUserEmail}) está autenticada pero aún no tiene un catálogo asignado. Contacta al administrador para habilitar tu tienda.
          </p>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navbar Dueño */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Store className="w-6 h-6 text-red-600" />
            <div>
              <span className="font-bold text-lg text-gray-900 block leading-tight">{store.name}</span>
              <span className="text-xs text-gray-500 font-mono">/{store.slug}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href={`/${store.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center text-sm font-semibold text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg transition"
            >
              Ver Mi Catálogo
              <ExternalLink className="w-4 h-4 ml-1.5" />
            </a>
            <button
              onClick={handleLogout}
              className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              Salir
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container Dueño */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {message && (
          <div
            className={`p-4 rounded-xl text-sm font-medium ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Sección: Configuración de la Tienda */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Store className="w-5 h-5 mr-2 text-red-600" />
            Datos de tu Tienda y Medios de Pago
          </h2>

          <form onSubmit={handleSaveStore} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre de la Tienda</label>
                <input
                  type="text"
                  required
                  value={storeForm.name}
                  onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                  placeholder="Ej: Regalos y Detalles Santa Claus"
                  className="mt-1 block w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Slug de la URL (Único)</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm font-mono">
                    /
                  </span>
                  <input
                    type="text"
                    required
                    value={storeForm.slug}
                    onChange={(e) => setStoreForm({ ...storeForm, slug: e.target.value })}
                    placeholder="mis-detalles-navidenos"
                    className="block w-full min-w-0 flex-1 rounded-none rounded-r-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-red-500 focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Número de WhatsApp (con código de país)</label>
                <input
                  type="text"
                  required
                  value={storeForm.whatsapp_number}
                  onChange={(e) => setStoreForm({ ...storeForm, whatsapp_number: e.target.value })}
                  placeholder="Ej: 51987654321"
                  className="mt-1 block w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Número de Yape / Plin</label>
                <input
                  type="text"
                  required
                  value={storeForm.yape_number}
                  onChange={(e) => setStoreForm({ ...storeForm, yape_number: e.target.value })}
                  placeholder="Ej: 987654321"
                  className="mt-1 block w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Color Distintivo del Catálogo</label>
                <div className="mt-1 flex items-center space-x-3">
                  <input
                    type="color"
                    value={storeForm.theme_color}
                    onChange={(e) => setStoreForm({ ...storeForm, theme_color: e.target.value })}
                    className="h-10 w-16 p-1 border border-gray-300 rounded cursor-pointer"
                  />
                  <span className="text-sm font-mono text-gray-600">{storeForm.theme_color}</span>
                </div>
              </div>

              <div>
                <CloudinaryUpload
                  label="Logo de la Tienda (Opcional)"
                  currentImageUrl={storeForm.logo_url}
                  onUploadSuccess={(url) => setStoreForm({ ...storeForm, logo_url: url })}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingStore}
                className="inline-flex items-center px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm transition disabled:opacity-50"
              >
                {savingStore ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Guardar Configuración
              </button>
            </div>
          </form>
        </div>

        {/* Sección: Crear Producto */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Plus className="w-5 h-5 mr-2 text-red-600" />
            Agregar Nuevo Producto
          </h2>

          <form onSubmit={handleCreateProduct} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre del Producto</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Ej: Panetón Artesanal Navideño 900g"
                  className="mt-1 block w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Precio (S/)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  placeholder="35.00"
                  className="mt-1 block w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Categoría</label>
                <input
                  type="text"
                  required
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  placeholder="Ej: Canastas, Chocolatería, Decoración"
                  className="mt-1 block w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <input
                  type="text"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Detalles sobre presentación, empaque o sabor"
                  className="mt-1 block w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div className="md:col-span-2">
                <CloudinaryUpload
                  label="Imagen del Producto"
                  currentImageUrl={productForm.image_url}
                  onUploadSuccess={(url) => setProductForm({ ...productForm, image_url: url })}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={creatingProduct}
                className="inline-flex items-center px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-gray-900 hover:bg-black shadow-sm transition disabled:opacity-50"
              >
                {creatingProduct ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Publicar Producto
              </button>
            </div>
          </form>
        </div>

        {/* Sección: Lista de Productos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Package className="w-5 h-5 mr-2 text-red-600" />
            Tus Productos Publicados ({products.length})
          </h2>

          {products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Aún no has registrado productos. Usa el formulario de arriba para agregar el primero.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className={`border rounded-xl p-4 flex flex-col justify-between transition ${
                    product.is_active ? 'border-gray-200 bg-white' : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <div>
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-40 object-cover rounded-lg mb-3"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 mb-3">
                        Sin Imagen
                      </div>
                    )}
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                      {product.category}
                    </span>
                    <h3 className="font-bold text-gray-900 mt-2">{product.name}</h3>
                    {product.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                    )}
                    <p className="text-base font-extrabold text-red-600 mt-2">
                      S/ {Number(product.price).toFixed(2)}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleProductStatus(product)}
                      className="inline-flex items-center text-xs font-medium text-gray-600 hover:text-gray-900"
                    >
                      {product.is_active ? (
                        <>
                          <Eye className="w-3.5 h-3.5 mr-1 text-green-600" />
                          Activo
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 mr-1 text-gray-400" />
                          Oculto
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
