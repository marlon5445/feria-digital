'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
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
  EyeOff
} from 'lucide-react';

interface StoreData {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  whatsapp_number: string;
  yape_number: string;
  theme_color: string;
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

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [savingStore, setSavingStore] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Formulario de Tienda
  const [storeForm, setStoreForm] = useState({
    slug: '',
    name: '',
    logo_url: '',
    whatsapp_number: '',
    yape_number: '',
    theme_color: '#dc2626',
  });

  // Formulario de Nuevo Producto
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: 'General',
  });

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Cargar tienda del usuario
      const { data: storeData } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .single();

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
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('store_id', storeData.id)
          .order('created_at', { ascending: false });

        if (productsData) setProducts(productsData);
      }

      setLoading(false);
    };

    loadUserData();
  }, [router, supabase]);

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStore(true);
    setMessage(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Normalizar slug (solo minúsculas, números y guiones)
    const normalizedSlug = storeForm.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    if (store) {
      // Actualizar tienda existente
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
    } else {
      // Crear nueva tienda
      const { data, error } = await supabase
        .from('stores')
        .insert({
          user_id: user.id,
          slug: normalizedSlug,
          name: storeForm.name,
          logo_url: storeForm.logo_url,
          whatsapp_number: storeForm.whatsapp_number,
          yape_number: storeForm.yape_number,
          theme_color: storeForm.theme_color,
        })
        .select()
        .single();

      if (error) {
        setMessage({ text: 'Error al crear la tienda: ' + error.message, type: 'error' });
      } else {
        setStore(data);
        setMessage({ text: '¡Tienda creada exitosamente!', type: 'success' });
      }
    }
    setSavingStore(false);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) {
      setMessage({ text: 'Primero debes guardar la información de tu tienda.', type: 'error' });
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
        products.map((p) => (p.id === product.id ? { ...p, is_active: !p.is_active } : p))
      );
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Store className="w-6 h-6 text-red-600" />
            <span className="font-bold text-lg text-gray-900">Panel de Emprendedor</span>
          </div>
          <div className="flex items-center space-x-4">
            {store && (
              <a
                href={`/${store.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center text-sm font-semibold text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg transition"
              >
                Ver Mi Catálogo
                <ExternalLink className="w-4 h-4 ml-1.5" />
              </a>
            )}
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

      {/* Main Container */}
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
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Slug de la URL (Único)</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    feriadigital.pe/
                  </span>
                  <input
                    type="text"
                    required
                    value={storeForm.slug}
                    onChange={(e) => setStoreForm({ ...storeForm, slug: e.target.value })}
                    placeholder="mis-detalles-navidenos"
                    className="block w-full min-w-0 flex-1 rounded-none rounded-r-lg border border-gray-300 px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500 font-mono"
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
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
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
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
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
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
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
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
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
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <input
                  type="text"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Detalles sobre presentación, empaque o sabor"
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
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
                      /* eslint-disable-next-line @next/next/no-img-element */
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
