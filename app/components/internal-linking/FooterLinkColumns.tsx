'use client';

import Link from 'next/link';

interface FooterLinkItem {
  title: string;
  href: string;
  isHighPriority?: boolean;
  description?: string;
}

interface FooterLinkColumn {
  title: string;
  links: FooterLinkItem[];
}

interface FooterLinkColumnsProps {
  columns: FooterLinkColumn[];
  className?: string;
}

export default function FooterLinkColumns({ columns, className = '' }: FooterLinkColumnsProps) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 ${className}`}>
      {columns.map((column, columnIndex) => (
        <div key={columnIndex}>
          <h3 className="font-bold text-lg mb-4 text-gray-900">
            {column.title}
          </h3>
          <ul className="space-y-3">
            {column.links.map((link, linkIndex) => (
              <li key={linkIndex}>
                <Link
                  href={link.href}
                  className={`text-gray-600 hover:text-green-600 transition-colors block ${
                    link.isHighPriority ? 'font-medium' : ''
                  }`}
                  title={link.description}
                >
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// Pre-defined footer link structure
export const FOOTER_LINK_COLUMNS: FooterLinkColumn[] = [
  {
    title: 'Produkty',
    links: [
      {
        title: 'Najsilnejšia kĺbová výživa',
        href: '/kupit',
        isHighPriority: true,
        description: 'Náš hlavný produkt s 9 prírodných zložiek'
      },
      {
        title: 'Zloženie produktu',
        href: '/zlozenie',
        isHighPriority: true,
        description: 'Detailný prehľad všetkých ingrediencií'
      },
      {
        title: 'Obchodné podmienky',
        href: '/obchodne-podmienky',
        description: 'Podmienky nákupu a doručenia'
      },
      {
        title: 'Doprava a platba',
        href: '/doprava-a-platba',
        description: 'Informácie o doručení a platobných možnostiach'
      }
    ]
  },
  {
    title: 'Prírodné zložky',
    links: [
      {
        title: 'Glukozamín',
        href: '/zlozenie/glukozamin',
        isHighPriority: true,
        description: 'Stavebný kameň chrupavky'
      },
      {
        title: 'Chondroitín',
        href: '/zlozenie/chondroitin',
        isHighPriority: true,
        description: 'Podpora kĺbového tkaniva'
      },
      {
        title: 'MSM',
        href: '/zlozenie/msm',
        description: 'Organická síra pre kĺby'
      },
      {
        title: 'Kolagén',
        href: '/zlozenie/kolagen',
        description: 'Protein pre pevnosť kĺbov'
      },
      {
        title: 'Kurkuma',
        href: '/zlozenie/kurkuma',
        description: 'Protizápalové korenie'
      },
      {
        title: 'Vitamín C',
        href: '/zlozenie/vitamin-c',
        description: 'Pre tvorbu kolagénu'
      }
    ]
  },
  {
    title: 'Informácie',
    links: [
      {
        title: 'Blog o zdraví kĺbov',
        href: '/blog',
        isHighPriority: true,
        description: 'Články a rady pre zdravé kĺby'
      },
      {
        title: 'Často kladené otázky',
        href: '/casto-kladene-otazky',
        description: 'Odpovede na najčastejšie otázky'
      },
      {
        title: 'Kontakt',
        href: '/kontakt',
        description: 'Ako nás kontaktovať'
      },
      {
        title: 'Reklamácie',
        href: '/reklamacie',
        description: 'Informácie o reklamačnom konaní'
      }
    ]
  },
  {
    title: 'Užívanie a bezpečnosť',
    links: [
      {
        title: 'Správne užívanie',
        href: '/uzivanie',
        isHighPriority: true,
        description: 'Návod na správne užívanie produktu'
      },
      {
        title: 'Ochrana osobných údajov',
        href: '/ochrana-osobnych-udajov',
        description: 'GDPR a ochrana súkromia'
      }
    ]
  }
]; 