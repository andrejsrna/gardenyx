'use client';

import { normalizePublicAssetUrl } from '@/app/lib/media';
import ImageUploadZone from '@/app/admin/ImageUploadZone';

export default function ImageUpload({ defaultSrc, defaultAlt }: { defaultSrc: string; defaultAlt: string }) {
  return (
    <ImageUploadZone
      folder="products"
      hiddenFieldName="primaryImageSrc"
      defaultSrc={normalizePublicAssetUrl(defaultSrc)}
      altFieldName="primaryImageAlt"
      defaultAlt={defaultAlt}
    />
  );
}
