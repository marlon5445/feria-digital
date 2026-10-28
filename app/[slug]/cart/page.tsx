import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CartClient from './CartClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CartPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: store, error } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !store) {
    notFound();
  }

  return <CartClient store={store} />;
}
