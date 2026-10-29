import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CatalogClient from './CatalogClient';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CatalogPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  try {
    // 1. Obtener la tienda por su slug
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (storeError || !store) {
      if (storeError) {
        console.warn('[CatalogPage] Error al consultar store:', storeError.message || storeError);
      }
      notFound();
    }

    // 2. Obtener los productos activos de la tienda
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', store.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (productsError) {
      console.warn('[CatalogPage] Error al consultar products:', productsError.message || productsError);
    }

    return <CatalogClient store={store} initialProducts={products || []} />;
  } catch (err) {
    console.error('[CatalogPage] Error inesperado en consulta de esquema:', err);
    notFound();
  }
}
