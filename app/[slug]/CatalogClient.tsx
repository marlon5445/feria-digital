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
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Maximize2,
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
  images?: string[] | null;
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [addedPopup, setAddedPopup] = useState<string | null>(null);

  // Modal para ver fotos del producto en detalle (galería)
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);

  useEffect(() => {
    initStore(store.id);
  }, [store.id, initStore]);

  const themeColor = store.theme_color || '#dc2626';

  // Categorías únicas
  const categories = useMemo(() => {
    return ['Todos', ...Array.from(new Set(initialProducts.map((p) => p.category)))];
  }, [initialProducts]);

  // Filtrado reactivo en tiempo real por categoría y búsqueda (Nombre, Descripción o Categoría)
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return initialProducts.filter((product) => {
      const matchesCategory =
        selectedCategory === 'Todos' || product.category === selectedCategory;

      const matchesSearch =
        q === '' ||
        (product.name && product.name.toLowerCase().includes(q)) ||
        (product.description && product.description.toLowerCase().includes(q)) ||
        (product.category && product.category.toLowerCase().includes(q));

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
    const mainImg =
      product.images && product.images.length > 0
        ? product.images[0]
        : product.image_url;

    addItem(
      {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image_url: mainImg,
        category: product.category,
      },
      qty
    );

    // Feedback visual momentáneo
    setAddedPopup(product.id);
    setTimeout(() => setAddedPopup(null), 1500);
  };

  const openGalleryModal = (product: Product, initialIdx: number = 0) => {
    setModalProduct(product);
    setActiveImageIdx(initialIdx);
  };

  const closeGalleryModal = () => {
    setModalProduct(null);
    setActiveImageIdx(0);
  };

  const getProductImages = (product: Product): string[] => {
    if (product.images && product.images.length > 0) {
      return product.images;
    }
    return product.image_url ? [product.image_url] : [];
  };

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  // Enlace directo a WhatsApp oficial
  const rawPhone = (store.whatsapp_number || '').replace(/\D/g, '');
  const cleanPhone = rawPhone.length === 9 ? `51${rawPhone}` : rawPhone;
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(
    `¡Hola ${store.name}! Vi tu catálogo en línea y me gustaría consultar sobre tus productos.`
  )}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-36">
      {/* ============================================================== */}
      {/* 1. TOPBAR NAVBAR — IDENTIDAD DE MARCA + ACCIONES */}
      {/* ============================================================== */}
      <header
        className="w-full relative overflow-hidden py-3.5 px-4 md:px-8"
        style={{
          background: `linear-gradient(135deg, ${themeColor} 0%, #0f172a 100%)`,
        }}
      >
        <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between max-w-7xl mx-auto gap-4 relative z-10">
          {/* LADO IZQUIERDO */}
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-xl shadow-sm p-1.5 flex items-center justify-center shrink-0 border border-white/20">
              {store.logo_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={store.logo_url}
                  alt={store.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <StoreIcon className="w-6 h-6 text-slate-400" />
              )}
            </div>

            <div className="min-w-0">
              <h1 className="text-lg md:text-2xl font-black text-white tracking-tight drop-shadow-sm line-clamp-1">
                {store.name}
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-white/70">
                <Sparkles className="w-3 h-3 text-amber-300" />
                Tienda Oficial
              </span>
            </div>
          </div>

          {/* LADO DERECHO */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 md:px-4 md:py-2.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-all shadow-sm hover:shadow"
              aria-label="Contactar por WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            <Link
              href={`/${store.slug}/cart`}
              className="relative bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-xl transition-all border border-white/15 cursor-pointer"
              aria-label={`Carrito: ${totalItems} ${totalItems === 1 ? 'producto' : 'productos'}`}
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. BARRA DE BÚSQUEDA, FILTROS Y SELECTOR DE VISTA */}
      {/* ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-3">
            {/* Input de Búsqueda dinámico en tiempo real */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, categoría o descripción..."
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

            {/* Alternador de Vista (Grid vs List) */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Vista Cuadrícula / Tarjetas"
                aria-label="Vista Cuadrícula"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Vista Lista Compacta"
                aria-label="Vista Lista Compacta"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
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
      {/* 3. PRODUCTOS: VISTA GRID VS VISTA LISTA */}
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
        ) : viewMode === 'grid' ? (
          /* ── VISTA CUADRÍCULA / TARJETAS ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => {
              const qty = getQuantity(product.id);
              const isAdded = addedPopup === product.id;
              const images = getProductImages(product);
              const primaryImage = images[0] || null;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between hover:-translate-y-1 group"
                >
                  {/* Contenedor de Imagen */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 flex items-center justify-center">
                    {primaryImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={primaryImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                        loading="lazy"
                        onClick={() => openGalleryModal(product, 0)}
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

                    {/* Indicador de Múltiples Fotos */}
                    {images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => openGalleryModal(product, 0)}
                        className="absolute bottom-2.5 right-2.5 bg-black/75 hover:bg-black backdrop-blur-xs text-white text-[11px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 transition shadow-sm"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>{images.length} fotos</span>
                      </button>
                    )}
                  </div>

                  {/* Miniaturas directas bajo la foto si hay más de 1 */}
                  {images.length > 1 && (
                    <div className="px-3 pt-2 flex gap-1.5 overflow-x-auto scrollbar-none">
                      {images.slice(0, 4).map((imgUrl, i) => (
                        <button
                          key={imgUrl + i}
                          type="button"
                          onClick={() => openGalleryModal(product, i)}
                          className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 hover:border-slate-400 shrink-0 transition"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imgUrl}
                            alt={`${product.name} miniatura ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                      {images.length > 4 && (
                        <button
                          type="button"
                          onClick={() => openGalleryModal(product, 4)}
                          className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0"
                        >
                          +{images.length - 4}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Detalles del Producto */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3
                        onClick={() => openGalleryModal(product, 0)}
                        className="font-bold text-slate-900 line-clamp-1 text-base group-hover:text-red-600 transition-colors cursor-pointer"
                      >
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

                      {/* Selector de Cantidad y Botón Agregar */}
                      <div className="flex items-center gap-2">
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
        ) : (
          /* ── VISTA LISTA COMPACTA ── */
          <div className="space-y-3">
            {filteredProducts.map((product) => {
              const qty = getQuantity(product.id);
              const isAdded = addedPopup === product.id;
              const images = getProductImages(product);
              const primaryImage = images[0] || null;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4"
                >
                  {/* Foto + Info */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div
                      onClick={() => openGalleryModal(product, 0)}
                      className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 cursor-pointer"
                    >
                      {primaryImage ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={primaryImage}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <StoreIcon className="w-6 h-6" />
                        </div>
                      )}
                      {images.length > 1 && (
                        <span className="absolute bottom-0 right-0 bg-black/75 text-white text-[9px] font-bold px-1 rounded-tl">
                          {images.length}📷
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                        {product.category || 'General'}
                      </span>
                      <h3
                        onClick={() => openGalleryModal(product, 0)}
                        className="font-bold text-slate-900 text-sm sm:text-base leading-tight line-clamp-1 hover:text-red-600 transition cursor-pointer"
                      >
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 hidden sm:block">
                          {product.description}
                        </p>
                      )}
                      <div className="text-sm sm:text-base font-black text-slate-900 mt-1">
                        S/ {Number(product.price).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Controles de Cantidad y Agregar */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0 w-full sm:w-auto">
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(product.id, -1)}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition"
                        aria-label="Disminuir"
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
                        aria-label="Aumentar"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      className={`flex-1 sm:flex-initial py-2 px-4 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 ${
                        isAdded ? 'bg-emerald-600' : ''
                      }`}
                      style={!isAdded ? { backgroundColor: themeColor } : undefined}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Listo</span>
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
              );
            })}
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* 4. MODAL DE GALERÍA DE FOTOS EN DETALLE */}
      {/* ============================================================== */}
      {modalProduct && (() => {
        const modalImages = getProductImages(modalProduct);
        const currentSrc = modalImages[activeImageIdx] || modalImages[0] || null;

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeGalleryModal();
            }}
          >
            <div className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              {/* Encabezado */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="min-w-0 pr-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                    {modalProduct.category || 'General'}
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-base line-clamp-1">
                    {modalProduct.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeGalleryModal}
                  className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                  aria-label="Cerrar modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Imagen Grande con Flechas */}
              <div className="relative aspect-square w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                {currentSrc ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={currentSrc}
                    alt={modalProduct.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <StoreIcon className="w-16 h-16 text-slate-300" />
                )}

                {modalImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIdx((prev) =>
                          prev === 0 ? modalImages.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black text-white p-2 rounded-full transition shadow-md"
                      aria-label="Foto anterior"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImageIdx((prev) =>
                          prev === modalImages.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black text-white p-2 rounded-full transition shadow-md"
                      aria-label="Foto siguiente"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <span className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      {activeImageIdx + 1} / {modalImages.length}
                    </span>
                  </>
                )}
              </div>

              {/* Tira de Miniaturas */}
              {modalImages.length > 1 && (
                <div className="p-3 bg-slate-50 flex gap-2 overflow-x-auto border-t border-slate-100 scrollbar-none">
                  {modalImages.map((imgUrl, idx) => (
                    <button
                      key={imgUrl + idx}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                        activeImageIdx === idx
                          ? 'border-slate-900 shadow-md scale-105'
                          : 'border-slate-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt={`Miniatura ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Footer con Precio y CTA */}
              <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-semibold uppercase text-slate-400">
                    Precio
                  </span>
                  <p className="text-xl font-black text-slate-900">
                    S/ {Number(modalProduct.price).toFixed(2)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleAddToCart(modalProduct);
                    closeGalleryModal();
                  }}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition hover:brightness-110 active:scale-95 flex items-center gap-2"
                  style={{ backgroundColor: themeColor }}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Agregar al Carrito</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ============================================================== */}
      {/* 5. BARRA FLOTANTE DE CARRITO / CHECK-OUT */}
      {/* ============================================================== */}
      {totalItems > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-md bg-slate-900 text-white rounded-2xl shadow-2xl p-4 flex items-center justify-between border border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-300">
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
