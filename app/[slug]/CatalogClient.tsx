'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { ShoppingCart, Plus, Minus, Check, Gift } from 'lucide-react';

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
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [addedPopup, setAddedPopup] = useState<string | null>(null);

  useEffect(() => {
    initStore(store.id);
  }, [store.id, initStore]);

  // Extraer categorías únicas
  const categories = ['Todos', ...Array.from(new Set(initialProducts.map((p) => p.category)))];

  const filteredProducts =
    selectedCategory === 'Todos'
      ? initialProducts
      : initialProducts.filter((p) => p.category === selectedCategory);

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

    // Feedback visual
    setAddedPopup(product.id);
    setTimeout(() => setAddedPopup(null), 1500);
  };

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Banner / Header Tienda */}
      <header
        className="text-white py-10 px-4 text-center shadow-md relative"
        style={{ backgroundColor: store.theme_color || '#dc2626' }}
      >
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {store.logo_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={store.logo_url}
              alt={store.name}
              className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover mb-3"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-3">
              <Gift className="w-8 h-8 text-white" />
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{store.name}</h1>
          <p className="mt-1 text-sm text-white/90">Catálogo Navideño Oficial</p>
        </div>
      </header>

      {/* Categorías */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Productos */}
      <main className="max-w-4xl mx-auto px-4 mt-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 text-gray-500">
            No hay productos disponibles en esta categoría.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filteredProducts.map((product) => {
              const qty = getQuantity(product.id);
              const isAdded = addedPopup === product.id;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {product.image_url ? (
                      <div className="w-full h-48 bg-gray-100 relative overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                        <Gift className="w-10 h-10" />
                      </div>
                    )}

                    <div className="p-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded">
                        {product.category}
                      </span>
                      <h3 className="font-bold text-gray-900 text-lg mt-1">{product.name}</h3>
                      {product.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <p className="text-xl font-black text-gray-900 mt-2">
                        S/ {Number(product.price).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Acciones de Compra */}
                  <div className="p-4 pt-0">
                    <div className="flex items-center space-x-3">
                      {/* Selector de Cantidad */}
                      <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50">
                        <button
                          onClick={() => handleQuantityChange(product.id, -1)}
                          className="p-2 text-gray-600 hover:text-black"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-2 text-sm font-bold text-gray-900">{qty}</span>
                        <button
                          onClick={() => handleQuantityChange(product.id, 1)}
                          className="p-2 text-gray-600 hover:text-black"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Botón Agregar */}
                      <button
                        onClick={() => handleAddToCart(product)}
                        className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center transition shadow-sm ${
                          isAdded
                            ? 'bg-green-600'
                            : 'bg-red-600 hover:bg-red-700'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-4 h-4 mr-1.5" />
                            ¡Agregado!
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-1.5" />
                            Agregar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 inset-x-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-200 z-50">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Total de tu pedido ({totalItems} productos):</p>
              <p className="text-lg font-black text-gray-900">S/ {totalPrice.toFixed(2)}</p>
            </div>
            <Link
              href={`/${store.slug}/cart`}
              className="inline-flex items-center px-6 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 transition"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Ver Carrito
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
