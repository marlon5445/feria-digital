'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  MessageCircle,
  QrCode,
  Truck,
  CheckCircle,
  Copy
} from 'lucide-react';

interface Store {
  id: string;
  slug: string;
  name: string;
  whatsapp_number: string;
  yape_number: string;
  theme_color: string;
}

export default function CartClient({ store }: { store: Store }) {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore();

  const [customerName, setCustomerName] = useState('');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [address, setAddress] = useState('');
  const [yapeOperationCode, setYapeOperationCode] = useState('');
  const [copiedYape, setCopiedYape] = useState(false);

  const totalPrice = getTotalPrice();

  const handleCopyYape = () => {
    navigator.clipboard.writeText(store.yape_number);
    setCopiedYape(true);
    setTimeout(() => setCopiedYape(false), 2000);
  };

  const handleSendOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      alert('Por favor ingresa tu nombre completo.');
      return;
    }

    if (items.length === 0) {
      alert('Tu carrito está vacío.');
      return;
    }

    // Construir el mensaje formateado para WhatsApp
    let message = `🎄 *¡NUEVO PEDIDO NAVIDEÑO - ${store.name.toUpperCase()}!* 🎄\n\n`;
    message += `👤 *Cliente:* ${customerName}\n`;
    message += `📦 *Tipo de Entrega:* ${deliveryType === 'delivery' ? 'Envío a Domicilio' : 'Recojo en Tienda'}\n`;
    if (deliveryType === 'delivery' && address.trim()) {
      message += `📍 *Dirección:* ${address}\n`;
    }
    message += `\n🛒 *DETALLE DEL PEDIDO:*\n`;

    items.forEach((item, index) => {
      const subtotal = item.price * item.quantity;
      message += `${index + 1}. ${item.name} x${item.quantity} - S/ ${subtotal.toFixed(2)}\n`;
    });

    message += `\n💰 *TOTAL A PAGAR: S/ ${totalPrice.toFixed(2)}*\n\n`;
    message += `📱 *Pago por Yape al:* ${store.yape_number}\n`;
    message += `🔢 *N° Operación Yape:* ${yapeOperationCode || 'Adjunto captura a continuación'}\n\n`;
    message += `_Enviado desde el catálogo digital de Feria Digital._`;

    // Redirigir a WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${store.whatsapp_number}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Tu carrito está vacío</h2>
          <p className="text-sm text-gray-500 mt-2">
            Aún no has seleccionado productos de este catálogo.
          </p>
          <Link
            href={`/${store.slug}`}
            className="mt-6 inline-flex items-center px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-red-600 hover:bg-red-700 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Explorar Catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href={`/${store.slug}`}
            className="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Seguir Comprando
          </Link>
          <span className="font-bold text-gray-900">Finalizar Pedido</span>
          <button
            onClick={clearCart}
            className="text-xs text-red-600 hover:underline font-medium"
          >
            Vaciar Carrito
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Lista de Productos Seleccionados */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900 text-base">Resumen de Productos</h2>
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {item.image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg border border-gray-100"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                      Item
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900">{item.name}</h3>
                    <p className="text-xs text-gray-500">
                      S/ {item.price.toFixed(2)} c/u
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 text-gray-600 hover:text-black"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2 text-xs font-bold text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 text-gray-600 hover:text-black"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="font-bold text-sm text-gray-900 min-w-[70px] text-right">
                    S/ {(item.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-200 flex justify-between items-center text-base font-extrabold text-gray-900">
            <span>Total a Pagar:</span>
            <span className="text-xl text-red-600">S/ {totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Sección de Pago con Yape */}
        <div className="bg-purple-50 rounded-2xl border border-purple-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-purple-900">
            <QrCode className="w-6 h-6 text-purple-700" />
            <h2 className="font-bold text-base">Paga con Yape / Plin</h2>
          </div>
          <p className="text-xs text-purple-800">
            Realiza la transferencia por el total de tu pedido al siguiente número:
          </p>

          <div className="bg-white rounded-xl p-4 border border-purple-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 font-medium">Número de Yape:</span>
              <p className="text-lg font-black text-purple-900 font-mono">{store.yape_number}</p>
            </div>
            <button
              onClick={handleCopyYape}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 transition"
            >
              {copiedYape ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 mr-1 text-green-600" />
                  ¡Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copiar Número
                </>
              )}
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-purple-950 mb-1">
              Número de Operación de Yape (Opcional):
            </label>
            <input
              type="text"
              value={yapeOperationCode}
              onChange={(e) => setYapeOperationCode(e.target.value)}
              placeholder="Ej: 12345678"
              className="w-full bg-white border border-purple-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>

        {/* Formulario de Datos de Entrega */}
        <form onSubmit={handleSendOrder} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-5">
          <h2 className="font-bold text-gray-900 text-base flex items-center">
            <Truck className="w-5 h-5 mr-2 text-red-600" />
            Datos de Entrega y Contacto
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tu Nombre Completo *</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ej: María Gómez"
              className="mt-1 block w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Modalidad de Entrega</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType('delivery')}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition ${
                  deliveryType === 'delivery'
                    ? 'border-red-600 bg-red-50 text-red-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Envío a Domicilio
              </button>
              <button
                type="button"
                onClick={() => setDeliveryType('pickup')}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition ${
                  deliveryType === 'pickup'
                    ? 'border-red-600 bg-red-50 text-red-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Recojo en Tienda
              </button>
            </div>
          </div>

          {deliveryType === 'delivery' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Dirección y Referencia</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Av. Principal 123, Dpto 402 - Frente al parque"
                className="mt-1 block w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl font-bold text-base text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 transition"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Enviar Pedido a WhatsApp
          </button>
        </form>
      </main>
    </div>
  );
}
