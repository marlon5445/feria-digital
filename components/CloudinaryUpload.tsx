'use client';

import React, { useState } from 'react';
import { UploadCloud, Loader2, Image as ImageIcon } from 'lucide-react';

interface CloudinaryUploadProps {
  onUploadSuccess: (url: string) => void;
  currentImageUrl?: string | null;
  label?: string;
}

export default function CloudinaryUpload({
  onUploadSuccess,
  currentImageUrl,
  label = 'Subir Imagen del Producto'
}: CloudinaryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB.');
      return;
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

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        const optimizedUrl = data.secure_url.replace(
          '/upload/',
          '/upload/f_webp,q_auto,w_800/'
        );
        setPreview(optimizedUrl);
        onUploadSuccess(optimizedUrl);
      } else {
        throw new Error(data.error?.message || 'Error al subir la imagen');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error de conexión con Cloudinary';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      <div className="flex items-center space-x-4">
        {preview ? (
          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Vista previa"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 bg-gray-50 flex-shrink-0">
            <ImageIcon className="w-8 h-8" />
          </div>
        )}

        <div className="flex-1">
          <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition">
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin text-red-600" />
                Subiendo...
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4 mr-2 text-gray-600" />
                {preview ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
          <p className="text-xs text-gray-500 mt-1">Formato PNG, JPG o WebP hasta 5MB</p>
        </div>
      </div>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}
