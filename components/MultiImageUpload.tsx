'use client';

import React, { useState } from 'react';
import { UploadCloud, Loader2, Image as ImageIcon, X, Plus } from 'lucide-react';

interface MultiImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
}

export default function MultiImageUpload({
  images,
  onChange,
  maxImages = 6,
  label = 'Fotos del Producto (Galería)',
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const availableSlots = maxImages - images.length;
    if (availableSlots <= 0) {
      setError(`Ya has alcanzado el límite máximo de ${maxImages} fotos.`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, availableSlots);

    for (const file of filesToUpload) {
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona solo archivos de imagen válidos.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Cada imagen no debe superar los 5MB.');
        return;
      }
    }

    setUploading(true);
    setError(null);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      setError('Configuración de Cloudinary incompleta en las variables de entorno.');
      setUploading(false);
      return;
    }

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );
        const data = await response.json();
        if (data.secure_url) {
          return data.secure_url.replace('/upload/', '/upload/f_webp,q_auto,w_800/');
        } else {
          throw new Error(data.error?.message || 'Error al subir una de las imágenes');
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      onChange([...images, ...uploadedUrls]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al subir fotos';
      setError(msg);
    } finally {
      setUploading(false);
      // Reset input value to allow selecting same file again if desired
      e.target.value = '';
    }
  };

  const handleRemove = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <span className="text-xs text-gray-500">
          {images.length}/{maxImages} fotos
        </span>
      </div>

      {/* Miniaturas de imágenes */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {images.map((url, idx) => (
          <div
            key={url + idx}
            className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group shadow-sm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Foto ${idx + 1}`}
              className="w-full h-full object-cover"
            />
            {idx === 0 && (
              <span className="absolute bottom-1 left-1 bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                Principal
              </span>
            )}
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute top-1 right-1 bg-red-600/90 hover:bg-red-700 text-white rounded-full p-1 opacity-90 group-hover:opacity-100 transition shadow-sm"
              aria-label="Eliminar foto"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {/* Botón para subir más si no se supera el límite */}
        {images.length < maxImages && (
          <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100 flex flex-col items-center justify-center cursor-pointer transition text-gray-500 hover:text-gray-700">
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-red-600" />
            ) : (
              <>
                <Plus className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-semibold">Añadir</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFiles}
              disabled={uploading}
            />
          </label>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Sube hasta {maxImages} fotos (PNG, JPG o WebP hasta 5MB). La primera foto será la principal.
      </p>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}

