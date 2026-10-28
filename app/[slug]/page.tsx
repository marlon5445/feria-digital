import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CatalogClient from './CatalogClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CatalogPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // 1. Obtener la tienda por su slug
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .single();

  if (storeError || !store) {
    notFound();
  }

  // 2. Obtener los productos activos de la tienda
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', store.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  return <CatalogClient store={store} initialProducts={products || []} />;
}
