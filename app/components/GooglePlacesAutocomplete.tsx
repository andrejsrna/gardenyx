'use client';

import { useRef, useEffect, useState } from 'react';

interface AddressComponents {
  streetNumber?: string;
  route?: string;
  locality?: string;
  postalCode?: string;
  country?: string;
}

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (address: AddressComponents) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function GooglePlacesAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Zadajte vašu adresu",
  className = "",
  required = false,
  disabled = false,
}: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isApiError, setIsApiError] = useState(false);

  useEffect(() => {
    const initAutocomplete = () => {
      const googleMaps = (window as typeof window & { google?: { maps?: { places?: { Autocomplete: unknown } } } }).google;
      if (!inputRef.current || !googleMaps?.maps?.places?.Autocomplete) {
        console.log('Google Maps API not yet available, waiting...');
        setIsApiError(true);
        return;
      }

      try {
        const autocomplete = new (googleMaps.maps.places.Autocomplete as new (input: HTMLInputElement, options?: object) => {
          addListener: (event: string, callback: () => void) => void;
          getPlace: () => {
            address_components?: Array<{
              long_name: string;
              short_name: string;
              types: string[];
            }>;
          };
        })(inputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'SK' },
          fields: ['address_components', 'formatted_address'],
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          
          if (!place.address_components) {
            return;
          }

          let streetNumber = '';
          let route = '';
          let locality = '';
          let postalCode = '';
          let country = '';

          place.address_components.forEach((component: {
            long_name: string;
            short_name: string;
            types: string[];
          }) => {
            const types = component.types;
            
            // Street number
            if (types.includes('street_number')) {
              streetNumber = component.long_name;
            }
            
            // Street name/route
            if (types.includes('route')) {
              route = component.long_name;
            }
            
            // City/locality - try multiple possible types
            if (types.includes('locality') || 
                types.includes('postal_town') || 
                types.includes('administrative_area_level_2') ||
                types.includes('sublocality_level_1') ||
                types.includes('sublocality')) {
              locality = component.long_name;
            }
            
            // Postal code
            if (types.includes('postal_code')) {
              postalCode = component.long_name.replace(/\s+/g, '');
            }
            
            // Country
            if (types.includes('country')) {
              country = component.short_name;
            }
          });

          const fullAddress = `${route} ${streetNumber}`.trim();
          onChange(fullAddress);

          onPlaceSelect({
            streetNumber,
            route,
            locality,
            postalCode,
            country,
          });
        });

        setIsLoaded(true);
        setIsApiError(false);
        console.log('Google Places Autocomplete initialized successfully');
      } catch (error) {
        console.error('Error initializing Google Places Autocomplete:', error);
        setIsApiError(true);
      }
    };

    // Check if Google Maps is already loaded
    const googleMaps = (window as typeof window & { google?: { maps?: { places?: { Autocomplete: unknown } } } }).google;
    if (googleMaps?.maps?.places?.Autocomplete) {
      initAutocomplete();
    } else {
      // Wait for Google Maps to load
      const checkGoogleMaps = setInterval(() => {
        const googleMapsCheck = (window as typeof window & { google?: { maps?: { places?: { Autocomplete: unknown } } } }).google;
        if (googleMapsCheck?.maps?.places?.Autocomplete) {
          clearInterval(checkGoogleMaps);
          initAutocomplete();
        }
      }, 500);

      // Cleanup interval after 15 seconds
      const timeout = setTimeout(() => {
        clearInterval(checkGoogleMaps);
        if (!isLoaded) {
          console.error('Google Maps API failed to load after 15 seconds');
          setIsApiError(true);
        }
      }, 15000);

      return () => {
        clearInterval(checkGoogleMaps);
        clearTimeout(timeout);
      };
    }
  }, [onChange, onPlaceSelect, isLoaded]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  if (isApiError) {
    return (
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`${className}`}
          required={required}
          disabled={disabled}
          autoComplete="street-address"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 13.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-xs text-amber-600 mt-1">
          Google Maps nie je dostupné. Zadajte adresu manuálne.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={`${className}`}
        required={required}
        disabled={disabled}
        autoComplete="street-address"
      />
      {isLoaded && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      )}
      {!isLoaded && !isApiError && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
} 