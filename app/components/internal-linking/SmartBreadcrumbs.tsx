'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  name: string;
  href: string;
  description?: string;
}

interface SmartBreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
  showDescriptions?: boolean;
}

export default function SmartBreadcrumbs({ 
  items, 
  showHome = true, 
  className = '',
  showDescriptions = false 
}: SmartBreadcrumbsProps) {
  const breadcrumbItems = showHome 
    ? [{ name: 'Domov', href: '/', description: 'Najsilnejšia kĺbová výživa' }, ...items]
    : items;

  return (
    <nav 
      className={`flex flex-wrap items-center space-x-1 text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        const isHome = index === 0 && showHome;

        return (
          <div key={item.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
            )}
            
            {isLast ? (
              <span 
                className="text-gray-900 font-medium"
                aria-current="page"
              >
                {isHome && <Home className="w-4 h-4 inline mr-1" />}
                {item.name}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-gray-600 hover:text-green-600 transition-colors font-medium flex items-center group"
                title={showDescriptions && item.description ? item.description : undefined}
              >
                {isHome && <Home className="w-4 h-4 inline mr-1 group-hover:text-green-600" />}
                <span className="hover:underline">{item.name}</span>
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

 