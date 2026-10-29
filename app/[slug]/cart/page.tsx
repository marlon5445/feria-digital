import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CartClient from './CartClient';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CartPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  try {
    const { data: store, error } = await supabase
      .from('stores')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !store) {
      if (error) {
        console.warn('[CartPage] Error al consultar store:', error.message || error);
      }
      notFound();
    }

    return <CartClient store={store} />;
  } catch (err) {
    console.error('[CartPage] Error inesperado en consulta de esquema:', err);
    notFound();
  }
}
