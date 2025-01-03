'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface RegistrationFormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
  address_1: string;
  city: string;
  postcode: string;
  country: string;
}

interface ValidationErrors {
  [key: string]: string;
}

export default function RegistrationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegistrationFormData>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    address_1: '',
    city: '',
    postcode: '',
    country: 'SK'
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [honeypot] = useState('');

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Name validations
    if (formData.first_name.length < 2) {
      newErrors.first_name = 'Meno musí mať aspoň 2 znaky';
    }
    if (formData.last_name.length < 2) {
      newErrors.last_name = 'Priezvisko musí mať aspoň 2 znaky';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Neplatný email';
    }

    // Password validation (at least 8 chars, 1 uppercase, 1 number)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'Heslo musí mať aspoň 8 znakov, jedno veľké písmeno a jedno číslo';
    }

    // Phone validation (Slovak/Czech format)
    const phoneRegex = /^(\+421|\+420|0)[1-9][0-9]{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Neplatné telefónne číslo';
    }

    // Address validation
    if (formData.address_1.length < 5) {
      newErrors.address_1 = 'Zadajte platnú adresu';
    }

    // City validation
    if (formData.city.length < 2) {
      newErrors.city = 'Zadajte platné mesto';
    }

    // PSČ validation
    const pscRegex = /^\d{5}$/;
    if (!pscRegex.test(formData.postcode)) {
      newErrors.postcode = 'PSČ musí mať 5 číslic';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check honeypot
    if (honeypot) {
      console.log('Potential spam detected');
      toast.error('Registrácia zlyhala', {
        description: 'Skúste to prosím znova neskôr.',
      });
      return;
    }

    if (!validateForm()) {
      toast.error('Nesprávne vyplnené údaje', {
        description: 'Prosím, skontrolujte všetky polia.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          timestamp: Date.now(), // Add timestamp for rate limiting
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Registrácia úspešná', {
          description: 'Teraz sa môžete prihlásiť.',
        });
        router.push('/moj-ucet');
      } else {
        toast.error('Registrácia zlyhala', {
          description: data.error || 'Skúste to prosím znova.',
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registrácia zlyhala', {
        description: 'Skúste to prosím znova neskôr.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2} 
              stroke="currentColor" 
              className="w-5 h-5 text-green-600"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Registrácia</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="relative">
              <input
                type="text"
                id="first_name"
                required
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                className={`peer w-full rounded-lg border-gray-200 p-4 text-sm shadow-sm focus:border-green-500 focus:ring-green-500 placeholder-transparent
                  ${errors.first_name ? 'border-red-500' : ''}`}
                placeholder="Meno"
              />
              {errors.first_name && (
                <p className="mt-1 text-xs text-red-500">{errors.first_name}</p>
              )}
              <label
                htmlFor="first_name"
                className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-600 transition-all 
                         peer-placeholder-shown:top-4 peer-placeholder-shown:left-4 peer-placeholder-shown:text-sm
                         peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs"
              >
                Meno
              </label>
            </div>

            <div className="relative">
              <input
                type="text"
                id="last_name"
                required
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                className={`peer w-full rounded-lg border-gray-200 p-4 text-sm shadow-sm focus:border-green-500 focus:ring-green-500 placeholder-transparent
                  ${errors.last_name ? 'border-red-500' : ''}`}
                placeholder="Priezvisko"
              />
              {errors.last_name && (
                <p className="mt-1 text-xs text-red-500">{errors.last_name}</p>
              )}
              <label
                htmlFor="last_name"
                className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-600 transition-all 
                         peer-placeholder-shown:top-4 peer-placeholder-shown:left-4 peer-placeholder-shown:text-sm
                         peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs"
              >
                Priezvisko
              </label>
            </div>

            <div className="relative">
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={`peer w-full rounded-lg border-gray-200 p-4 text-sm shadow-sm focus:border-green-500 focus:ring-green-500 placeholder-transparent
                  ${errors.email ? 'border-red-500' : ''}`}
                placeholder="Email"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
              <label
                htmlFor="email"
                className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-600 transition-all 
                         peer-placeholder-shown:top-4 peer-placeholder-shown:left-4 peer-placeholder-shown:text-sm
                         peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs"
              >
                Email
              </label>
            </div>

            <div className="relative">
              <input
                type="password"
                id="password"
                required
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className={`peer w-full rounded-lg border-gray-200 p-4 text-sm shadow-sm focus:border-green-500 focus:ring-green-500 placeholder-transparent
                  ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Heslo"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
              <label
                htmlFor="password"
                className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-600 transition-all 
                         peer-placeholder-shown:top-4 peer-placeholder-shown:left-4 peer-placeholder-shown:text-sm
                         peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs"
              >
                Heslo
              </label>
            </div>

            <div className="relative">
              <input
                type="tel"
                id="phone"
                required
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className={`peer w-full rounded-lg border-gray-200 p-4 text-sm shadow-sm focus:border-green-500 focus:ring-green-500 placeholder-transparent
                  ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="Telefón"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
              )}
              <label
                htmlFor="phone"
                className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-600 transition-all 
                         peer-placeholder-shown:top-4 peer-placeholder-shown:left-4 peer-placeholder-shown:text-sm
                         peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs"
              >
                Telefón
              </label>
            </div>

            <div className="relative sm:col-span-2">
              <input
                type="text"
                id="address_1"
                required
                value={formData.address_1}
                onChange={(e) => setFormData(prev => ({ ...prev, address_1: e.target.value }))}
                className={`peer w-full rounded-lg border-gray-200 p-4 text-sm shadow-sm focus:border-green-500 focus:ring-green-500 placeholder-transparent
                  ${errors.address_1 ? 'border-red-500' : ''}`}
                placeholder="Adresa"
              />
              {errors.address_1 && (
                <p className="mt-1 text-xs text-red-500">{errors.address_1}</p>
              )}
              <label
                htmlFor="address_1"
                className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-600 transition-all 
                         peer-placeholder-shown:top-4 peer-placeholder-shown:left-4 peer-placeholder-shown:text-sm
                         peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs"
              >
                Adresa
              </label>
            </div>

            <div className="relative">
              <input
                type="text"
                id="city"
                required
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className={`peer w-full rounded-lg border-gray-200 p-4 text-sm shadow-sm focus:border-green-500 focus:ring-green-500 placeholder-transparent
                  ${errors.city ? 'border-red-500' : ''}`}
                placeholder="Mesto"
              />
              {errors.city && (
                <p className="mt-1 text-xs text-red-500">{errors.city}</p>
              )}
              <label
                htmlFor="city"
                className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-600 transition-all 
                         peer-placeholder-shown:top-4 peer-placeholder-shown:left-4 peer-placeholder-shown:text-sm
                         peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs"
              >
                Mesto
              </label>
            </div>

            <div className="relative">
              <input
                type="text"
                id="postcode"
                required
                pattern="\d{5}"
                value={formData.postcode}
                onChange={(e) => setFormData(prev => ({ ...prev, postcode: e.target.value }))}
                className={`peer w-full rounded-lg border-gray-200 p-4 text-sm shadow-sm focus:border-green-500 focus:ring-green-500 placeholder-transparent
                  ${errors.postcode ? 'border-red-500' : ''}`}
                placeholder="PSČ"
              />
              {errors.postcode && (
                <p className="mt-1 text-xs text-red-500">{errors.postcode}</p>
              )}
              <label
                htmlFor="postcode"
                className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-600 transition-all 
                         peer-placeholder-shown:top-4 peer-placeholder-shown:left-4 peer-placeholder-shown:text-sm
                         peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs"
              >
                PSČ
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-4 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 
                     disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Registrujem...</span>
              </div>
            ) : (
              'Registrovať sa'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/moj-ucet')}
            className="text-sm text-gray-600 hover:text-green-600 transition-colors"
          >
            Už máte účet? <span className="text-green-600 font-medium">Prihláste sa</span>
          </button>
        </div>
      </div>
    </div>
  );
} 