import { Zap, MessageCircle, Smartphone, Gift } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-red-50">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Gift className="w-8 h-8 text-red-600" />
          <span className="text-2xl font-black tracking-tight text-gray-900">
            Feria<span className="text-red-600">Digital</span>
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 pt-12 pb-20 text-center">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 mb-6">
          🎄 Especial Campaña Navideña
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
          Crea tu Catálogo Digital y Vende por{' '}
          <span className="text-red-600">WhatsApp & Yape</span> en minutos
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
          La solución más rápida y elegante para emprendedores peruanos. Comparte tu link único, recibe pedidos detallados con comprobante de Yape directo a tu WhatsApp y multiplica tus ventas navideñas.
        </p>
        <div className="mt-8 flex justify-center">
          <a
            href="#beneficios"
            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold rounded-xl text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm transition"
          >
            Ver Beneficios
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section id="beneficios" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600 mb-6">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Tu Enlace Personalizado</h3>
            <p className="text-gray-600 text-sm">
              Tendrás tu propia URL: <code className="bg-gray-100 px-1 py-0.5 rounded text-red-600 font-mono">feriadigital.pe/[tu-tienda]</code> lista para compartir en Instagram, TikTok y estados.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Integración con Yape</h3>
            <p className="text-gray-600 text-sm">
              Tus clientes verán tu número de Yape directamente en el checkout y podrán ingresar su número de operación para validar el pago.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600 mb-6">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Pedidos al WhatsApp</h3>
            <p className="text-gray-600 text-sm">
              Recibe el pedido listo, detallado con productos, cantidades, dirección de envío y código de pago en un solo mensaje de WhatsApp.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8 text-center text-sm text-gray-500">
        <p>© 2025 Feria Digital. Impulsando el comercio navideño independiente.</p>
      </footer>
    </div>
  );
}
