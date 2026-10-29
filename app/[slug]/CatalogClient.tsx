'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import {
  ShoppingCart,
  Plus,
  Minus,
  Check,
  Search,
  MessageCircle,
  Store as StoreIcon,
  X,
  ArrowRight,
  PackageX,
  Sparkles,
} from 'lucide-react';

interface Store {
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
}

export default function CatalogClient({
  store,
  initialProducts,
}: {
  store: Store;
  initialProducts: Product[];
}) {
  const { initStore, addItem, getTotalItems, getTotalPrice } = useCartStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [addedPopup, setAddedPopup] = useState<string | null>(null);

  useEffect(() => {
    initStore(store.id);
  }, [store.id, initStore]);

  const themeColor = store.theme_color || '#dc2626';

  // Categorías únicas
  const categories = useMemo(() => {
    return ['Todos', ...Array.from(new Set(initialProducts.map((p) => p.category)))];
  }, [initialProducts]);

  // Filtrado reactivo en tiempo real por categoría y búsqueda
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      const matchesCategory =
        selectedCategory === 'Todos' || product.category === selectedCategory;

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === '' ||
        product.name.toLowerCase().includes(q) ||
        (product.description && product.description.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [initialProducts, selectedCategory, searchQuery]);

  const getQuantity = (id: string) => quantities[id] || 1;

  const handleQuantityChange = (id: string, delta: number) => {
    const current = getQuantity(id);
    const next = Math.max(1, current + delta);
    setQuantities({ ...quantities, [id]: next });
  };

  const handleAddToCart = (product: Product) => {
    const qty = getQuantity(product.id);
    addItem(
      {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image_url: product.image_url,
      },
      qty
    );

    // Feedback visual momentáneo
    setAddedPopup(product.id);
    setTimeout(() => setAddedPopup(null), 1500);
  };

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  // Enlace directo a WhatsApp oficial
  const cleanPhone = (store.whatsapp_number || '').replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `¡Hola ${store.name}! Vi tu catálogo en línea y me gustaría consultar sobre tus productos.`
  )}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-36">
      {/* ============================================================== */}
      {/* 1. HERO HEADER & IDENTIDAD DE MARCA */}
      {/* ============================================================== */}
      <div className="relative">
        {/* Banner con degradado armónico y patrón decorativo */}
        <div
          className="h-44 sm:h-52 w-full relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${themeColor} 0%, #0f172a 100%)`,
          }}
        >
          {/* Acentos de luz sutiles */}
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          {/* Badge de Verificación o Campaña */}
          <div className="absolute top-4 right-4 sm:right-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md text-white border border-white/20 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Tienda Oficial</span>
            </span>
          </div>
        </div>

        {/* Tarjeta de Identidad de Marca Superpuesta */}
        <div className="max-w-4xl mx-auto px-4 -mt-16 sm:-mt-20 relative z-10 flex flex-col items-center text-center">
          {/* Logo de la Tienda */}
          <div className="ring-4 ring-white shadow-xl bg-white w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden flex items-center justify-center transition-transform hover:scale-105 duration-200">
            {store.logo_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={store.logo_url}
                alt={store.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <StoreIcon className="w-12 h-12 text-slate-400" />
            )}
          </div>

          {/* Nombre y subtítulo */}
          <h1 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            {store.name}
          </h1>
          <p className="mt-1 text-sm sm:text-base text-slate-600 max-w-lg font-medium">
            Catálogo digital de productos con pedidos directos a WhatsApp y pago con Yape / Plin.
          </p>

          {/* Botón Directo a WhatsApp */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all shadow-sm hover:shadow"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Contactar por WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. BARRA DE BÚSQUEDA Y FILTROS DE CATEGORÍA */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 mt-8 sm:mt-10">
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 space-y-4">
          {/* Input de Búsqueda */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar productos por nombre o descripción..."
              className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-full transition"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Chips de Categorías */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'text-white shadow-md scale-[1.02]'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  style={isActive ? { backgroundColor: themeColor } : undefined}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Resumen de Resultados */}
        <div className="mt-4 flex items-center justify-between text-xs sm:text-sm text-slate-500 px-1 font-medium">
          <span>
            {filteredProducts.length === 1
              ? '1 producto encontrado'
              : `${filteredProducts.length} productos disponibles`}
          </span>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Todos');
              }}
              className="text-slate-600 hover:text-slate-900 underline font-semibold"
            >
              Restablecer filtros
            </button>
          )}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. GRID DE TARJETAS DE PRODUCTO MODERNAS */}
      {/* ============================================================== */}
      <main className="max-w-7xl mx-auto px-4 mt-6">
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-sm max-w-md mx-auto my-12">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <PackageX className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              No se encontraron productos
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              {searchQuery
                ? `No hay coincidencias para "${searchQuery}". Intenta con otros términos.`
                : 'No hay productos disponibles en esta categoría actualmente.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Todos');
              }}
              className="inline-flex items-center px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-black transition shadow-sm"
            >
              Ver todos los productos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => {
              const qty = getQuantity(product.id);
              const isAdded = addedPopup === product.id;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between hover:-translate-y-1 group"
                >
                  {/* Contenedor de Imagen con Aspecto Fijo */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 flex items-center justify-center">
                    {product.image_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                        <StoreIcon className="w-12 h-12" />
                        <span className="text-[11px] font-medium mt-1 text-slate-400">Sin foto</span>
                      </div>
                    )}

                    {/* Insignia Flotante de Categoría */}
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm text-slate-800">
                      {product.category || 'General'}
                    </span>
                  </div>

                  {/* Detalles del Producto */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 line-clamp-1 text-base group-hover:text-red-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-slate-500 line-clamp-2 mt-1 min-h-[2.5rem]">
                        {product.description || 'Producto seleccionado de alta calidad.'}
                      </p>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-baseline justify-between mb-3">
                        <span className="text-xs font-semibold uppercase text-slate-400">
                          Precio
                        </span>
                        <span className="text-lg font-extrabold text-slate-900">
                          S/ {Number(product.price).toFixed(2)}
                        </span>
                      </div>

                      {/* Selector de Cantidad y Botón de Agregar */}
                      <div className="flex items-center gap-2">
                        {/* Selector de Cantidad */}
                        <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(product.id, -1)}
                            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition"
                            aria-label="Disminuir cantidad"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-slate-900">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(product.id, 1)}
                            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Botón Agregar al Carrito */}
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow active:scale-[0.98] ${
                            isAdded ? 'bg-emerald-600' : ''
                          }`}
                          style={!isAdded ? { backgroundColor: themeColor } : undefined}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span>¡Listo!</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4" />
                              <span>Agregar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* 4. BARRA FLOTANTE DE CARRITO / CHECK-OUT */}
      {/* ============================================================== */}
      {totalItems > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md bg-slate-900 text-white rounded-2xl shadow-2xl p-4 flex items-center justify-between border border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm"
              style={{ backgroundColor: themeColor }}
            >
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium leading-none">
                {totalItems} {totalItems === 1 ? 'producto' : 'productos'} en carrito
              </p>
              <p className="text-base font-black text-white mt-1 leading-none">
                S/ {totalPrice.toFixed(2)}
              </p>
            </div>
          </div>

          <Link
            href={`/${store.slug}/cart`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md transition-all hover:brightness-110 active:scale-95"
            style={{ backgroundColor: themeColor }}
          >
            <span>Ver Carrito / Pedido</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
