'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MessageCircle,
  QrCode,
  ShoppingBag,
  ChevronDown,
  Check,
  Store,
  Flame,
  CheckCircle2,
} from 'lucide-react';

const WA_PHONE = '51986441292';

const buildWaUrl = (message: string) =>
  `https://api.whatsapp.com/send?phone=${WA_PHONE}&text=${encodeURIComponent(message)}`;

const HERO_WA_URL = buildWaUrl('Hola, deseo más información para afiliarme y tener mi tienda virtual.');
const PLAN_MENSUAL_WA_URL = buildWaUrl('Hola, me interesa afiliarme al Plan Mensual de S/ 30.');
const PLAN_TRIMESTRAL_WA_URL = buildWaUrl('Hola, me interesa afiliarme al Plan Trimestral de S/ 70.');
const PLAN_ANUAL_WA_URL = buildWaUrl('Hola, me interesa afiliarme al Plan Anual de S/ 200.');

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'checkout' | 'whatsapp'>('catalog');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: '¿Cobran comisión por mis ventas?',
      a: 'No, 0% de comisión. Todo el dinero de tus ventas va directamente a tu Yape, Plin o cuenta bancaria sin intermediarios ni retenciones.',
    },
    {
      q: '¿Necesito computadora para administrarlo?',
      a: 'No, puedes registrarte, subir fotos de tus productos, cambiar precios y personalizar los datos de tu tienda directamente desde tu celular.',
    },
    {
      q: '¿Mis clientes necesitan descargar alguna app?',
      a: 'No, tus clientes abren tu enlace al instante en cualquier navegador (Chrome, Safari, etc.) sin necesidad de registrarse ni instalar aplicaciones.',
    },
    {
      q: '¿Cómo comparto mi tienda virtual con mis clientes?',
      a: 'Recibes un enlace corto y exclusivo (ej: feriadigital.pe/tu-tienda) que puedes colocar en tu biografía de Instagram, TikTok, Facebook o compartir en tus estados de WhatsApp.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-red-500 selection:text-white">
      {/* ─── 1. NAVBAR SUPERIOR ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-500/20 group-hover:scale-105 transition">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 block leading-tight">
                Feria<span className="text-red-600">Digital</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Tiendas Virtuales E-commerce
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#beneficios" className="hover:text-red-600 transition">
              Beneficios
            </a>
            <a href="#demo" className="hover:text-red-600 transition">
              Cómo Funciona
            </a>
            <a href="#precios" className="hover:text-red-600 transition">
              Precios
            </a>
            <a href="#faq" className="hover:text-red-600 transition">
              Preguntas Frecuentes
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              Iniciar Sesión
            </Link>
            <a
              href={HERO_WA_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white bg-red-600 hover:bg-red-700 px-4 py-2.5 rounded-xl shadow-md shadow-red-600/20 hover:shadow-red-600/30 transition transform active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Solicitar Tienda</span>
            </a>
          </div>
        </div>
      </header>

      {/* ─── 2. HERO SECTION DE ALTO IMPACTO ──────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-gradient-to-b from-white via-red-50/30 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Badge Superior */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-red-100/80 text-red-700 border border-red-200/60 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-red-600 animate-ping" />
              <span>⚡ Tu Tienda Virtual E-commerce lista en minutos</span>
            </div>

            {/* Título Principal */}
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.14]">
              La Tienda Virtual Profesional que tu negocio necesita{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-600 to-purple-600 block sm:inline">
                (Sin Comisiones ni Costos Excesivos)
              </span>
            </h1>

            {/* Subtítulo */}
            <p className="text-base sm:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto font-normal">
              Obtén un e-commerce completo con tu propio link personalizado, catálogo con carrito de compras
              interactivo y gestión de pagos con Yape/Plin. La potencia de WooCommerce o Shopify a una fracción del
              precio y sin pagar mensualidades caras.
            </p>

            {/* Botón de Acción Principal (Hero CTA WhatsApp) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <a
                href={HERO_WA_URL}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-9 py-4 rounded-2xl text-base font-black text-white bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/25 hover:shadow-red-600/40 hover:-translate-y-0.5 transition-all"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Solicitar mi Tienda Virtual</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-semibold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 0% Comisiones por venta
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Pagos directos a tu Yape/Plin
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Sin costos excesivos
              </span>
            </div>
          </div>

          {/* ─── 3. SHOWCASE / MOCKUP VISUAL INTERACTIVO ─────────────────────── */}
          <div id="demo" className="mt-16 sm:mt-20 max-w-4xl mx-auto">
            {/* Pestañas Interactivas */}
            <div className="flex items-center justify-center p-1.5 bg-slate-200/70 backdrop-blur-xs rounded-2xl max-w-lg mx-auto mb-8 gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('catalog')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'catalog'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Explora el Catálogo
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('checkout')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'checkout'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2. Selecciona Yape
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('whatsapp')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'whatsapp'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3. Recibe en WhatsApp
              </button>
            </div>

            {/* Smartphone Mockup Frame */}
            <div className="relative mx-auto max-w-[340px] sm:max-w-[380px] bg-slate-900 p-3.5 sm:p-4 rounded-[42px] shadow-2xl shadow-slate-900/30 border-4 border-slate-800">
              {/* Dynamic Island / Notch */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-20 flex items-center justify-end px-3">
                <span className="w-2 h-2 rounded-full bg-slate-800" />
              </div>

              {/* Pantalla Interna */}
              <div className="relative bg-slate-50 rounded-[30px] overflow-hidden min-h-[520px] flex flex-col border border-slate-800/20 text-left pt-8 pb-4">
                {/* ─ VISTA TAB 1: Catálogo ─ */}
                {activeTab === 'catalog' && (
                  <div className="flex-1 flex flex-col justify-between p-4 space-y-4 animate-in fade-in duration-300">
                    <div>
                      {/* Cabecera Tienda Demo */}
                      <div className="bg-gradient-to-r from-red-600 to-rose-600 p-3.5 rounded-2xl text-white flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-white text-red-600 font-black flex items-center justify-center text-sm shadow-xs">
                            DG
                          </div>
                          <div>
                            <h4 className="font-extrabold text-xs sm:text-sm leading-tight">Detallitos Gourmet</h4>
                            <span className="text-[10px] text-red-100 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Abierto ahora
                            </span>
                          </div>
                        </div>
                        <span className="bg-white/20 text-[10px] font-bold px-2 py-1 rounded-lg">E-commerce</span>
                      </div>

                      {/* Lista de Productos Demo */}
                      <div className="mt-3 space-y-2.5">
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2 shadow-2xs">
                          <div className="flex items-center gap-2.5">
                            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center font-bold text-xs shrink-0">
                              🎁
                            </div>
                            <div>
                              <p className="font-bold text-xs text-slate-800">Box Dulce Tentación</p>
                              <p className="text-[10px] text-slate-500">Alfajores + Trufas</p>
                              <p className="text-xs font-black text-red-600 mt-0.5">S/ 35.00</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 shadow-xs"
                          >
                            + Agregar
                          </button>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2 shadow-2xs">
                          <div className="flex items-center gap-2.5">
                            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center font-bold text-xs shrink-0">
                              🍰
                            </div>
                            <div>
                              <p className="font-bold text-xs text-slate-800">Torta Personalizada 1kg</p>
                              <p className="text-[10px] text-slate-500">Sabor chocolate húmedo</p>
                              <p className="text-xs font-black text-red-600 mt-0.5">S/ 55.00</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 shadow-xs"
                          >
                            + Agregar
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Botón Flotante Carrito */}
                    <div className="bg-slate-900 text-white p-3 rounded-2xl flex items-center justify-between shadow-lg">
                      <div className="flex items-center gap-2 text-xs">
                        <ShoppingBag className="w-4 h-4 text-red-400" />
                        <span className="font-bold">2 productos en carrito</span>
                      </div>
                      <span className="font-black text-xs text-emerald-400">Total: S/ 90.00</span>
                    </div>
                  </div>
                )}

                {/* ─ VISTA TAB 2: Checkout Yape / Plin ─ */}
                {activeTab === 'checkout' && (
                  <div className="flex-1 flex flex-col justify-between p-4 space-y-4 animate-in fade-in duration-300">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-purple-200">
                        <QrCode className="w-5 h-5 text-purple-600" />
                        <h4 className="font-bold text-sm text-purple-950">Pagos con Yape / Plin</h4>
                      </div>

                      {/* Mockup QR */}
                      <div className="bg-white p-4 rounded-2xl border-2 border-purple-200 text-center space-y-3 shadow-xs">
                        <div className="w-32 h-32 bg-purple-50 mx-auto rounded-xl flex items-center justify-center border border-purple-100">
                          <QrCode className="w-20 h-20 text-purple-700" />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-slate-500 uppercase">Número Oficial</p>
                          <p className="text-lg font-black text-purple-900 font-mono tracking-wider">987 524 254</p>
                        </div>
                        <span className="inline-block text-[10px] font-bold bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                          Titular: Detallitos Gourmet SAC
                        </span>
                      </div>

                      <div className="bg-slate-100 p-2.5 rounded-xl text-[11px] text-slate-600">
                        Total a pagar: <strong className="text-slate-900">S/ 90.00</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('whatsapp')}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-3 rounded-xl shadow-md transition"
                    >
                      Continuar Pedido por WhatsApp →
                    </button>
                  </div>
                )}

                {/* ─ VISTA TAB 3: Mensaje WhatsApp ─ */}
                {activeTab === 'whatsapp' && (
                  <div className="flex-1 flex flex-col justify-between p-3.5 space-y-3 bg-[#E5DDD5] animate-in fade-in duration-300 rounded-[22px]">
                    <div className="flex items-center gap-2 p-2 bg-[#075E54] text-white rounded-xl shadow-xs">
                      <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                        DG
                      </div>
                      <div>
                        <p className="font-bold text-xs">Detallitos Gourmet</p>
                        <p className="text-[9px] text-emerald-200">En línea</p>
                      </div>
                    </div>

                    {/* Burbuja de Mensaje de WhatsApp */}
                    <div className="bg-white p-3 rounded-2xl shadow-sm text-slate-800 text-[11px] leading-relaxed border-l-4 border-emerald-500 space-y-2">
                      <p className="font-bold text-emerald-800">🛍️ NUEVO PEDIDO — Detallitos Gourmet</p>
                      <div className="text-[10px] space-y-0.5 text-slate-600 border-b border-slate-100 pb-1.5">
                        <p>👤 <strong>Cliente:</strong> María Guadalupe</p>
                        <p>🛵 <strong>Entrega:</strong> Envío a Domicilio</p>
                        <p>📍 <strong>Dirección:</strong> Av. Las Flores 123, Miraflores</p>
                        <p>💳 <strong>Método de Pago:</strong> Yape / Plin</p>
                      </div>
                      <div>
                        <p className="font-bold text-[10px] text-slate-700">📦 DETALLE DEL PEDIDO:</p>
                        <p className="text-[10px] text-slate-600">• [Boxes] Box Dulce Tentación x1 - S/ 35.00</p>
                        <p className="text-[10px] text-slate-600">• [Tortas] Torta Personalizada x1 - S/ 55.00</p>
                      </div>
                      <p className="font-black text-xs text-slate-900 pt-1 border-t border-slate-100">
                        💰 TOTAL A PAGAR: S/ 90.00
                      </p>
                      <span className="block text-right text-[9px] text-slate-400">10:45 a.m. ✓✓</span>
                    </div>

                    <div className="bg-white p-2 rounded-xl flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">¡Pedido recibido en segundos!</span>
                      <span className="text-emerald-600 font-bold">Sin comisiones</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. BENEFICIOS Y PROPUESTA DE VALOR (GRID DE 4 TARJETAS) ──────── */}
      <section id="beneficios" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest">¿Por qué elegirnos?</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Diseñado exclusivamente para el comercio emprendedor en Perú
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Todo lo que necesitas para vender por internet sin complicaciones técnicas ni cobros abusivos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tarjeta 1 */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/70 hover:border-red-200 hover:bg-white hover:shadow-xl hover:shadow-red-500/5 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition">
                📲
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Pedidos Directos a WhatsApp</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Olvídate de chats desordenados preguntando precios. Recibe el pedido listo con productos, cantidades y
                dirección.
              </p>
            </div>

            {/* Tarjeta 2 */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/70 hover:border-purple-200 hover:bg-white hover:shadow-xl hover:shadow-purple-500/5 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition">
                💳
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Pagos Instantáneos con Yape / Plin</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Muestra tu QR personalizado y solicita el número de operación para validar tus ventas en tiempo real.
              </p>
            </div>

            {/* Tarjeta 3 */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/70 hover:border-blue-200 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition">
                🚀
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Tu propio Link Personalizado</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Obtén tu enlace único <code className="text-blue-700 font-mono text-xs">/tu-tienda</code> perfecto para
                tu bio de Instagram, TikTok o Facebook.
              </p>
            </div>

            {/* Tarjeta 4 */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/70 hover:border-amber-200 hover:bg-white hover:shadow-xl hover:shadow-amber-500/5 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition">
                📊
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Cero Comisiones por Venta</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                El 100% de lo que vendes es para ti. Sin cobros por transacción ni cobros ocultos a fin de mes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. TABLA DE PLANES Y PRECIOS (PRICING SECTION) ────────────────── */}
      <section id="precios" className="py-20 sm:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Inversión Accesible</span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Planes Simples y Transparentes
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Elige el plan ideal para tu negocio y comienza a recibir pedidos organizados hoy mismo.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {/* a) PLAN MENSUAL */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Plan Mensual</h3>
                  <p className="text-xs text-slate-500 mt-1">Ideal para probar e impulsar tus ventas</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">S/ 30</span>
                  <span className="text-xs font-bold text-slate-500">/ mes</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Catálogo e-commerce con carrito interactivo</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Hasta 20 productos activos</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Pedidos directos a WhatsApp ilimitados</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Integración con QR de Yape / Plin</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Soporte por WhatsApp</span>
                  </li>
                </ul>
              </div>
              <a
                href={PLAN_MENSUAL_WA_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-8 w-full py-3.5 px-4 rounded-xl text-center text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition inline-flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Elegir Plan Mensual</span>
              </a>
            </div>

            {/* b) PLAN TRIMESTRAL (MÁS POPULAR / RECOMENDADO) */}
            <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-8 shadow-2xl border-2 border-red-500 flex flex-col justify-between lg:-translate-y-2">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-600 to-rose-600 text-white text-[11px] font-black uppercase px-4 py-1.5 rounded-full shadow-md tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                <span>MÁS POPULAR / RECOMENDADO</span>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-white">Plan Trimestral</h3>
                  <p className="text-xs text-slate-400 mt-1">La mejor relación valor / precio</p>
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-5xl font-black text-white">S/ 70</span>
                    <span className="text-xs font-bold text-slate-400">por 3 meses</span>
                  </div>
                  <span className="inline-block mt-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
                    Ahorro de S/ 20
                  </span>
                </div>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="font-semibold text-white">Hasta 45 productos activos</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Múltiples fotos por producto (Galería)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Ayuda en la configuración inicial</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Pedidos ilimitados sin comisiones</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Soporte prioritario por WhatsApp</span>
                  </li>
                </ul>
              </div>

              <a
                href={PLAN_TRIMESTRAL_WA_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-8 w-full py-4 px-4 rounded-xl text-center text-sm font-black text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30 transition inline-flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Elegir Plan Trimestral</span>
              </a>
            </div>

            {/* c) PLAN ANUAL (MÁXIMO AHORRO) */}
            <div className="relative bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition">
              <div className="absolute -top-3.5 right-6 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-emerald-200 tracking-wider">
                MÁXIMO AHORRO
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Plan Anual</h3>
                  <p className="text-xs text-slate-500 mt-1">Para negocios consolidados todo el año</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">S/ 200</span>
                  <span className="text-xs font-bold text-slate-500">por 1 año</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-slate-900">Productos ILIMITADOS</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Badge de Tienda Oficial Verificada</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Galería con múltiples fotos por producto</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Soporte prioritario 24/7</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Mayor rentabilidad y presencia garantizada</span>
                  </li>
                </ul>
              </div>

              <a
                href={PLAN_ANUAL_WA_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-8 w-full py-3.5 px-4 rounded-xl text-center text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition inline-flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Elegir Plan Anual</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. SECCIÓN DE PREGUNTAS FRECUENTES (FAQ ACCORDION) ───────────── */}
      <section id="faq" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Dudas Resueltas</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Preguntas Frecuentes</h2>
            <p className="text-slate-600 text-sm">
              Todo lo que necesitas saber antes de empezar a digitalizar tus ventas.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/50 overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm sm:text-base hover:text-red-600 transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-red-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 7. CTA BANNER PRE-FOOTER (CANALIZADO A WHATSAPP) ──────────────── */}
      <section className="bg-gradient-to-r from-red-600 to-rose-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            ¿Listo para tener tu Tienda Virtual profesional?
          </h2>
          <p className="text-red-100 text-base max-w-xl mx-auto">
            Escríbenos directamente a WhatsApp y te ayudamos a configurar tu e-commerce en minutos.
          </p>
          <div className="pt-2">
            <a
              href={HERO_WA_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 px-9 py-4 rounded-2xl bg-white text-red-600 font-black text-base shadow-xl hover:bg-slate-50 transition transform hover:-translate-y-0.5 active:scale-95"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Solicitar mi Tienda Virtual</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── 8. FOOTER DINÁMICO ───────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-sm">
              FD
            </div>
            <span className="font-extrabold text-white text-base">Feria Digital</span>
          </div>

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Feria Digital. Todos los derechos reservados.
          </p>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <a href={HERO_WA_URL} target="_blank" rel="noreferrer" className="hover:text-white transition">
              Contacto por WhatsApp
            </a>
            <Link href="/login" className="hover:text-white transition">
              Acceso Clientes
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
