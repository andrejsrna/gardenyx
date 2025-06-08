'use client';

import Link from 'next/link';
import { ExternalLink, ArrowRight, ShoppingCart, BookOpen } from 'lucide-react';

interface ContextualLink {
  text: string;
  href: string;
  type: 'internal' | 'external' | 'product' | 'blog';
  description?: string;
  isHighPriority?: boolean;
}

interface ContextualLinksProps {
  links: ContextualLink[];
  layout?: 'horizontal' | 'vertical' | 'grid';
  title?: string;
  className?: string;
}

const ICON_MAP = {
  internal: ArrowRight,
  external: ExternalLink,
  product: ShoppingCart,
  blog: BookOpen,
};

const TYPE_STYLES = {
  internal: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
  external: 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100',
  product: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
  blog: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
};

export default function ContextualLinks({ 
  links, 
  layout = 'vertical', 
  title = 'Súvisiace odkazy',
  className = ''
}: ContextualLinksProps) {
  if (!links.length) return null;

  const getLayoutClasses = () => {
    switch (layout) {
      case 'horizontal':
        return 'flex flex-wrap gap-3';
      case 'grid':
        return 'grid grid-cols-1 sm:grid-cols-2 gap-4';
      default:
        return 'space-y-3';
    }
  };

  const LinkComponent = ({ link }: { link: ContextualLink }) => {
    const Icon = ICON_MAP[link.type];
    const isExternal = link.type === 'external';
    const linkProps = isExternal 
      ? { target: '_blank', rel: 'noopener noreferrer' }
      : {};

    if (layout === 'horizontal') {
      return (
        <Link
          href={link.href}
          {...linkProps}
          className={`inline-flex items-center px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${TYPE_STYLES[link.type]} ${
            link.isHighPriority ? 'ring-2 ring-offset-1 ring-green-300' : ''
          }`}
        >
          {link.text}
          <Icon className="w-4 h-4 ml-2" />
        </Link>
      );
    }

    return (
      <Link
        href={link.href}
        {...linkProps}
        className={`block p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${TYPE_STYLES[link.type]} ${
          link.isHighPriority ? 'ring-2 ring-offset-1 ring-green-300' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-sm mb-1">
              {link.text}
            </h4>
            {link.description && (
              <p className="text-xs text-gray-600 line-clamp-2">
                {link.description}
              </p>
            )}
          </div>
          <Icon className="w-5 h-5 ml-3 flex-shrink-0" />
        </div>
      </Link>
    );
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-6 ${className}`}>
      <h3 className="font-bold text-lg mb-4 text-gray-900 flex items-center">
        <BookOpen className="w-5 h-5 mr-2 text-green-600" />
        {title}
      </h3>
      
      <div className={getLayoutClasses()}>
        {links.map((link, index) => (
          <LinkComponent key={index} link={link} />
        ))}
      </div>
    </div>
  );
}

 