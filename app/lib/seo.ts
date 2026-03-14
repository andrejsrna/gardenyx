import type { Metadata } from 'next';

export const SITE_URL = 'https://najsilnejsiaklbovavyziva.sk';
const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.png`;

type StaticMetadataOptions = {
  title: string;
  description: string;
  path: string;
  image?: string;
};

export function buildStaticMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
}: StaticMetadataOptions): Metadata {
  const canonical = `${SITE_URL}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Najsilnejšia kĺbová výživa',
      locale: 'sk_SK',
      type: 'website',
      images: [
        {
          url: image,
          width: 1200,
          height: 1200,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}
