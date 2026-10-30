'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  MessageCircle,
  Truck,
  CheckCircle,
  Copy,
  X,
  QrCode,
  Wallet,
  Banknote,
  ShoppingBag,
} from 'lucide-react';

interface Store {
  id: string;
  slug: string;
  name: string;
  whatsapp_number: string;
  yape_number: string;
  theme_color: string;
  qr_code_url?: string | null;
}

// ─── Tipos de método de pago ───────────────────────────────────────────────
type PaymentMethod = 'yape' | 'cash' | 'transfer';

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  yape: 'Yape / Plin',
  cash: 'Pago contra entrega / Efectivo',
  transfer: 'Transferencia Bancaria',
};

// ─── Modal de Yape/Plin ────────────────────────────────────────────────────
function YapeModal({
  store,
  yapeOperationCode,
  onOperationCodeChange,
  onClose,
}: {
  store: Store;
  yapeOperationCode: string;
  onOperationCodeChange: (v: string) => void;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(store.yape_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // QR dinámico: usa qr_code_url de la tienda si existe, si no genera uno con el número
  const qrSrc =
    store.qr_code_url ||
    `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(store.yape_number)}`;

  // Evitar scroll del body mientras el modal está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Panel */}
      <div className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">

        {/* Encabezado del Modal */}
        <div className="flex items-center justify-between px-5 py-4 bg-purple-600">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-white" />
            <h2 className="font-bold text-white text-base">Pagos con Yape / Plin</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* QR */}
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrSrc}
              alt="QR de Yape/Plin"
              width={180}
              height={180}
              className="rounded-xl border border-purple-100 shadow-sm"
            />
          </div>

          {/* Número de Yape con botón Copiar */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-purple-600 font-semibold uppercase tracking-wide">
                Número de Yape
              </span>
              <p className="text-xl font-black text-purple-900 font-mono tracking-widest mt-0.5">
                {store.yape_number}
              </p>
            </div>
            <button
              onClick={handleCopy}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                copied
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200'
              }`}
            >
              {copied ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  ¡Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copiar
                </>
              )}
            </button>
          </div>

          {/* Número de Operación */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Número de Operación{' '}
              <span className="text-gray-400 font-normal">(Opcional)</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={yapeOperationCode}
              onChange={(e) => onOperationCodeChange(e.target.value)}
              placeholder="Ej: 12345678 — ingresa el código de tu operación"
              className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>

          {/* Botón Confirmar */}
          <button
            onClick={onClose}
            className="w-full bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <CheckCircle className="w-5 h-5" />
            Entendido / Continuar Pedido
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente Principal ──────────────────────────────────────────────────
export default function CartClient({ store }: { store: Store }) {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore();

  const [customerName, setCustomerName] = useState('');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('yape');
  const [yapeOperationCode, setYapeOperationCode] = useState('');
  const [showYapeModal, setShowYapeModal] = useState(false);

  const totalPrice = getTotalPrice();
  const themeColor = store.theme_color || '#dc2626';

  // ── Opciones de método de pago ──────────────────────────────────────────
  const paymentOptions: { id: PaymentMethod; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'yape',
      label: 'Yape / Plin',
      icon: <QrCode className="w-5 h-5 text-purple-600" />,
      badge: 'Recomendado',
    },
    {
      id: 'cash',
      label: 'Pago contra entrega / Efectivo',
      icon: <Banknote className="w-5 h-5 text-emerald-600" />,
    },
    {
      id: 'transfer',
      label: 'Transferencia Bancaria',
      icon: <Wallet className="w-5 h-5 text-blue-600" />,
    },
  ];

  // ─── Construcción del mensaje de WhatsApp ──────────────────────────────────
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

    const modalidadEntrega = deliveryType === 'delivery' ? 'Envío a Domicilio' : 'Recojo en Tienda';
    const direccionReferencia = deliveryType === 'delivery'
      ? (address.trim() || 'Coordinar por WhatsApp')
      : 'Recojo en tienda';

    const paymentLabel = PAYMENT_LABELS[paymentMethod] || 'Yape / Plin';
    const metodoPago = paymentMethod === 'yape' && yapeOperationCode.trim()
      ? `${paymentLabel} (Nº Op: ${yapeOperationCode.trim()})`
      : paymentLabel;

    const itemsDetail = items
      .map(
        (item) =>
          `• [${item.category || 'General'}] ${item.name} x${item.quantity} - S/ ${(item.price * item.quantity).toFixed(2)}`
      )
      .join('\n');

    const totalMonto = totalPrice.toFixed(2);

    let mensajeTexto = `🛍️ *NUEVO PEDIDO — ${store.name}*\n\n`;
    mensajeTexto += `👤 *Cliente:* ${customerName}\n`;
    mensajeTexto += `🛵 *Entrega:* ${modalidadEntrega}\n`;
    mensajeTexto += `📍 *Dirección:* ${direccionReferencia}\n`;
    mensajeTexto += `💳 *Método de Pago:* ${metodoPago}\n\n`;
    mensajeTexto += `📦 *DETALLE DEL PEDIDO:*\n`;
    mensajeTexto += `${itemsDetail}\n\n`;
    mensajeTexto += `💰 *TOTAL A PAGAR: S/ ${totalMonto}*\n`;

    if (store.yape_number) {
      mensajeTexto += `\n📱 *Pago por Yape/Plin al:* ${store.yape_number}\n`;
      mensajeTexto += `_(Adjunto captura de pago a continuación)_\n`;
    }

    mensajeTexto += `\n_Enviado desde el catálogo digital de ${store.name}._`;

    const rawPhone = (store.whatsapp_number || '').replace(/\D/g, '');
    const cleanPhone = rawPhone.length === 9 ? `51${rawPhone}` : rawPhone;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(mensajeTexto)}`;
    window.open(whatsappUrl, '_blank');
  };
  // ── Carrito vacío ───────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Tu carrito está vacío</h2>
          <p className="text-sm text-slate-500 mt-2">
            Aún no has seleccionado productos de este catálogo.
          </p>
          <Link
            href={`/${store.slug}`}
            className="mt-6 inline-flex items-center px-6 py-2.5 rounded-xl font-bold text-sm text-white transition shadow-sm"
            style={{ backgroundColor: themeColor }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Explorar Catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      {/* ── Topbar ──────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href={`/${store.slug}`}
            className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Seguir Comprando
          </Link>
          <span className="font-bold text-slate-900">Finalizar Pedido</span>
          <button
            onClick={clearCart}
            className="text-xs text-red-500 hover:text-red-700 font-semibold transition"
          >
            Vaciar
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">

        {/* ── 1. Resumen de Productos ────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-900 text-base">Resumen de Productos</h2>
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {item.image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-xl border border-slate-100 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300 shrink-0">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-slate-900 line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-slate-500">S/ {item.price.toFixed(2)} c/u</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 transition"
                      aria-label="Disminuir"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 text-xs font-bold text-slate-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 transition"
                      aria-label="Aumentar"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="font-bold text-sm text-slate-900 min-w-[66px] text-right">
                    S/ {(item.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-slate-300 hover:text-red-500 p-1 transition"
                    aria-label="Eliminar producto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
            <span className="font-bold text-slate-700">Total a Pagar:</span>
            <span className="text-xl font-black text-slate-900">S/ {totalPrice.toFixed(2)}</span>
          </div>
        </section>

        {/* ── 2. Método de Pago ─────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <h2 className="font-bold text-slate-900 text-base">Método de Pago</h2>

          <div className="space-y-2">
            {paymentOptions.map((option) => {
              const isActive = paymentMethod === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setPaymentMethod(option.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                    isActive
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {/* Radio visual */}
                  <span
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isActive ? 'border-purple-500' : 'border-slate-300'
                    }`}
                  >
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                    )}
                  </span>

                  {/* Icono */}
                  <span className="shrink-0">{option.icon}</span>

                  {/* Etiqueta */}
                  <span
                    className={`text-sm font-semibold flex-1 ${
                      isActive ? 'text-purple-900' : 'text-slate-700'
                    }`}
                  >
                    {option.label}
                  </span>

                  {/* Badge */}
                  {option.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                      {option.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* CTA de Yape cuando está seleccionado */}
          {paymentMethod === 'yape' && (
            <button
              type="button"
              onClick={() => setShowYapeModal(true)}
              className="w-full bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all mt-1"
            >
              <QrCode className="w-5 h-5" />
              Ver QR y Datos de Yape / Plin
            </button>
          )}

          {/* Resumen del número de operación si ya fue ingresado */}
          {paymentMethod === 'yape' && yapeOperationCode && (
            <p className="text-xs text-purple-700 bg-purple-50 rounded-lg px-3 py-2 font-medium">
              ✓ N° Operación registrado:{' '}
              <span className="font-black font-mono">{yapeOperationCode}</span>
            </p>
          )}
        </section>

        {/* ── 3. Datos de Entrega y Contacto ────────────────────────────── */}
        <form onSubmit={handleSendOrder} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Truck className="w-5 h-5 text-slate-500" />
            Datos de Entrega y Contacto
          </h2>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Tu Nombre Completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ej: María Gómez"
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
            />
          </div>

          {/* Modalidad */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Modalidad de Entrega
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { value: 'delivery', label: 'Envío a Domicilio' },
                  { value: 'pickup', label: 'Recojo en Tienda' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDeliveryType(opt.value)}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold border-2 transition ${
                    deliveryType === opt.value
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dirección */}
          {deliveryType === 'delivery' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Dirección y Referencia
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Av. Principal 123, Dpto 402 — Frente al parque"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition resize-none"
              />
            </div>
          )}

          {/* Botón enviar */}
          <button
            type="submit"
            className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl font-bold text-base text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] shadow-lg shadow-emerald-100 transition"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Confirmar Pedido por WhatsApp
          </button>
        </form>
      </main>

      {/* ── Modal Yape/Plin ──────────────────────────────────────────────── */}
      {showYapeModal && (
        <YapeModal
          store={store}
          yapeOperationCode={yapeOperationCode}
          onOperationCodeChange={setYapeOperationCode}
          onClose={() => setShowYapeModal(false)}
        />
      )}
    </div>
  );
}
