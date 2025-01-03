import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { getShippingMethods, getPaymentGateways, createOrder } from '../lib/wordpress';
import type { PaymentGateway, CheckoutFormData, ShippingMethod } from '../lib/wordpress';
import PacketaPointSelector from './PacketaPointSelector';
import type { PacketaPoint } from '../lib/packeta';
import { toast } from 'sonner';
import Image from 'next/image';

interface SavedFormData {
  billing: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    postcode?: string;
    country?: string;
  };
  shipping: {
    first_name?: string;
    last_name?: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    postcode?: string;
    country?: string;
  };
}

export default function CheckoutForm() {
  const { items, totalPrice, clearCart } = useCart();
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([]);
  const [selectedPacketaPoint, setSelectedPacketaPoint] = useState<PacketaPoint | null>(null);
  const [loading, setLoading] = useState(false);
  const [useShippingAsBilling, setUseShippingAsBilling] = useState(true);

  const [formData, setFormData] = useState<Partial<CheckoutFormData>>({
    shipping: {
      first_name: '',
      last_name: '',
      address_1: '',
      city: '',
      postcode: '',
      country: 'SK',
      company: '',
      address_2: '',
      state: ''
    },
    billing: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address_1: '',
      city: '',
      postcode: '',
      country: 'SK',
      company: '',
      address_2: '',
      state: ''
    }
  });

  // Load saved form data from localStorage on component mount
  useEffect(() => {
    try {
      const savedFormData = localStorage.getItem('checkoutFormData');
      if (savedFormData) {
        const parsedData = JSON.parse(savedFormData) as SavedFormData;
        setFormData(prev => {
          const billing = prev.billing || {
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            address_1: '',
            city: '',
            postcode: '',
            country: 'SK'
          };
          
          const shipping = prev.shipping || {
            first_name: '',
            last_name: '',
            address_1: '',
            city: '',
            postcode: '',
            country: 'SK'
          };

          return {
            ...prev,
            billing: {
              ...billing,
              first_name: parsedData.billing.first_name || billing.first_name,
              last_name: parsedData.billing.last_name || billing.last_name,
              email: parsedData.billing.email || billing.email,
              phone: parsedData.billing.phone || billing.phone,
              address_1: parsedData.billing.address_1 || billing.address_1,
              address_2: parsedData.billing.address_2,
              city: parsedData.billing.city || billing.city,
              postcode: parsedData.billing.postcode || billing.postcode,
              country: 'SK'
            },
            shipping: {
              ...shipping,
              first_name: parsedData.shipping.first_name || shipping.first_name,
              last_name: parsedData.shipping.last_name || shipping.last_name,
              address_1: parsedData.shipping.address_1 || shipping.address_1,
              address_2: parsedData.shipping.address_2,
              city: parsedData.shipping.city || shipping.city,
              postcode: parsedData.shipping.postcode || shipping.postcode,
              country: 'SK'
            }
          };
        });
      }
    } catch (error) {
      console.error('Error loading saved form data:', error);
    }
  }, []);

  // Save form data to localStorage when it changes
  useEffect(() => {
    if (!formData.billing || !formData.shipping) return;

    try {
      const dataToSave: SavedFormData = {
        billing: {
          first_name: formData.billing.first_name,
          last_name: formData.billing.last_name,
          email: formData.billing.email,
          phone: formData.billing.phone,
          address_1: formData.billing.address_1,
          address_2: formData.billing.address_2,
          city: formData.billing.city,
          postcode: formData.billing.postcode,
          country: formData.billing.country
        },
        shipping: {
          first_name: formData.shipping.first_name,
          last_name: formData.shipping.last_name,
          address_1: formData.shipping.address_1,
          address_2: formData.shipping.address_2,
          city: formData.shipping.city,
          postcode: formData.shipping.postcode,
          country: formData.shipping.country
        }
      };
      localStorage.setItem('checkoutFormData', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving form data:', error);
    }
  }, [formData.billing, formData.shipping]);

  const isPacketaPickupMethod = (methodId: string | number) => {
    // Convert methodId to string to ensure includes() works
    const id = String(methodId);
    return id === 'packeta_pickup';
  };

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const [shipping, payment] = await Promise.all([
          getShippingMethods(),
          getPaymentGateways()
        ]);
        
        // Transform shipping methods to split Packeta into two options
        const transformedMethods = shipping.flatMap(method => {
          // Log each method for debugging
          console.log('Processing method:', method);
          
          if (method.method_id === 'packetery_shipping_method' && method.enabled) {
            // Create two virtual methods from the Packeta method
            return [
              {
                ...method,
                id: 'packeta_pickup',
                title: 'Packeta - Odberné miesto',
                description: 'Vyzdvihnutie na odbernom mieste Packeta',
                method_id: 'packeta_pickup'
              },
              {
                ...method,
                id: 'packeta_home',
                title: 'Packeta - Doručenie domov',
                description: 'Doručenie na vašu adresu',
                method_id: 'packeta_home'
              }
            ];
          }
          return method;
        });

        console.log('Transformed shipping methods:', transformedMethods);
        
        // Filter out disabled methods and those without titles
        const enabledMethods = transformedMethods.filter(method => 
          method.enabled && method.title !== null && method.title !== undefined
        );
        
        console.log('Enabled shipping methods:', enabledMethods);
        setShippingMethods(enabledMethods);
        setPaymentGateways(payment.filter(gateway => gateway.enabled));
      } catch (error) {
        console.error('Error fetching methods:', error);
        toast.error('Chyba pri načítaní spôsobov dopravy a platby');
      }
    };

    fetchMethods();
  }, []);

  const handleInputChange = (
    section: 'billing' | 'shipping',
    field: string,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
      ...(useShippingAsBilling && section === 'billing'
        ? {
            shipping: {
              ...prev.shipping,
              [field]: value,
            },
          }
        : {}),
    }));
  };

  const handlePacketaPointSelect = (point: PacketaPoint) => {
    setSelectedPacketaPoint(point);

    const newFormData: Partial<CheckoutFormData> = {
      ...formData,
      shipping: {
        first_name: formData.billing?.first_name || 'Packeta',
        last_name: formData.billing?.last_name || 'Pickup',
        address_1: point.street,
        city: point.city,
        postcode: point.zip,
        country: point.country,
        company: '',
        address_2: '',
        state: ''
      } as CheckoutFormData['shipping'],
      shipping_method: 'packeta'
    };

    setFormData(newFormData);
  };

  const handleShippingMethodChange = (method: ShippingMethod) => {
    setFormData(prev => ({
      ...prev,
      shipping_method: String(method.id),
      shipping_method_title: method.title || ''
    }));

    // Reset Packeta point if switching from Packeta pickup to another method
    if (!isPacketaPickupMethod(method.id) && selectedPacketaPoint) {
      setSelectedPacketaPoint(null);
      setFormData(prev => ({
        ...prev,
        meta_data: [],
        packeta_data: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = {
      billing: ['first_name', 'last_name', 'email', 'phone', 'address_1', 'city', 'postcode'],
      shipping: ['first_name', 'last_name', 'address_1', 'city', 'postcode'],
    };

    // Validate billing fields
    const missingBillingFields = requiredFields.billing.filter(
      field => !formData.billing?.[field as keyof typeof formData.billing]
    );

    if (missingBillingFields.length > 0) {
      toast.error('Prosím, vyplňte všetky povinné fakturačné údaje');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.billing?.email || '')) {
      toast.error('Prosím, zadajte platný email');
      return;
    }

    // Validate phone format (allow +, spaces, and numbers)
    const phoneRegex = /^[+\d\s]{9,}$/;
    if (!phoneRegex.test(formData.billing?.phone || '')) {
      toast.error('Prosím, zadajte platné telefónne číslo');
      return;
    }

    // Validate shipping fields if not using billing address
    if (!useShippingAsBilling) {
      const missingShippingFields = requiredFields.shipping.filter(
        field => !formData.shipping?.[field as keyof typeof formData.shipping]
      );

      if (missingShippingFields.length > 0) {
        toast.error('Prosím, vyplňte všetky povinné doručovacie údaje');
        return;
      }
    }

    // Validate PSČ format (5 digits for Slovak postal codes)
    const pscRegex = /^\d{5}$/;
    if (!pscRegex.test(formData.billing?.postcode || '')) {
      toast.error('Prosím, zadajte platné PSČ (5 číslic)');
      return;
    }

    if (!useShippingAsBilling && !pscRegex.test(formData.shipping?.postcode || '')) {
      toast.error('Prosím, zadajte platné PSČ pre doručovaciu adresu (5 číslic)');
      return;
    }

    if (!formData.shipping_method) {
      toast.error('Prosím, vyberte spôsob dopravy');
      return;
    }

    // Only require pickup point selection for Z-Point shipping method
    if (isPacketaPickupMethod(formData.shipping_method) && !selectedPacketaPoint) {
      toast.error('Prosím, vyberte odberné miesto Packeta');
      return;
    }

    if (!formData.payment_method) {
      toast.error('Prosím, vyberte spôsob platby');
      return;
    }

    try {
      setLoading(true);
      await createOrder(formData as CheckoutFormData);
      toast.success('Objednávka bola úspešne vytvorená!');
      clearCart();
      // Redirect to success page
      window.location.href = '/objednavka/uspesna';
    } catch (error) {
      toast.error('Nastala chyba pri vytváraní objednávky');
      console.error('Error creating order:', error);
      // Redirect to failure page
      window.location.href = '/objednavka/neuspesna';
    } finally {
      setLoading(false);
    }
  };

  // Update PacketaPointSelector props
  const packetaProps = {
    onSelect: handlePacketaPointSelect
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Billing Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Fakturačné údaje</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meno <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.billing?.first_name}
              onChange={(e) => handleInputChange('billing', 'first_name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 invalid:border-red-500"
              placeholder="Vaše meno"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priezvisko <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.billing?.last_name}
              onChange={(e) => handleInputChange('billing', 'last_name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 invalid:border-red-500"
              placeholder="Vaše priezvisko"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
              value={formData.billing?.email}
              onChange={(e) => handleInputChange('billing', 'email', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 invalid:border-red-500"
              placeholder="vas@email.sk"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefón <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              pattern="[+\d\s]{9,}"
              value={formData.billing?.phone}
              onChange={(e) => handleInputChange('billing', 'phone', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 invalid:border-red-500"
              placeholder="+421"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ulica a číslo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.billing?.address_1}
              onChange={(e) => handleInputChange('billing', 'address_1', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 invalid:border-red-500"
              placeholder="Hlavná 123"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Doplnková adresa
            </label>
            <input
              type="text"
              value={formData.billing?.address_2}
              onChange={(e) => handleInputChange('billing', 'address_2', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              placeholder="Poschodie, byt, atď. (voliteľné)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mesto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.billing?.city}
              onChange={(e) => handleInputChange('billing', 'city', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 invalid:border-red-500"
              placeholder="Vaše mesto"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PSČ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              pattern="\d{5}"
              value={formData.billing?.postcode}
              onChange={(e) => handleInputChange('billing', 'postcode', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 invalid:border-red-500"
              placeholder="12345"
            />
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="useShippingAsBilling"
            checked={useShippingAsBilling}
            onChange={(e) => setUseShippingAsBilling(e.target.checked)}
            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <label htmlFor="useShippingAsBilling" className="ml-2 text-sm text-gray-600">
            Doručiť na rovnakú adresu
          </label>
        </div>

        {!useShippingAsBilling && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meno <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.shipping?.first_name}
                onChange={(e) => handleInputChange('shipping', 'first_name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 invalid:border-red-500"
                placeholder="Meno príjemcu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priezvisko <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.shipping?.last_name}
                onChange={(e) => handleInputChange('shipping', 'last_name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 invalid:border-red-500"
                placeholder="Priezvisko príjemcu"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ulica a číslo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.shipping?.address_1}
                onChange={(e) => handleInputChange('shipping', 'address_1', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 invalid:border-red-500"
                placeholder="Ulica a číslo doručenia"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doplnková adresa
              </label>
              <input
                type="text"
                value={formData.shipping?.address_2}
                onChange={(e) => handleInputChange('shipping', 'address_2', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                placeholder="Poschodie, byt, atď. (voliteľné)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mesto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.shipping?.city}
                onChange={(e) => handleInputChange('shipping', 'city', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 invalid:border-red-500"
                placeholder="Mesto doručenia"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PSČ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                pattern="\d{5}"
                value={formData.shipping?.postcode}
                onChange={(e) => handleInputChange('shipping', 'postcode', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 invalid:border-red-500"
                placeholder="12345"
              />
            </div>
          </div>
        )}
      </div>

      {/* Shipping Methods */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Spôsob dopravy</h2>
        <div className="space-y-3">
          {shippingMethods.map((method) => (
            <label key={method.id} className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50">
              <input
                type="radio"
                name="shipping_method"
                value={method.id}
                checked={formData.shipping_method === method.id}
                onChange={() => handleShippingMethodChange(method)}
                className="mt-1 rounded-full border-gray-300 text-green-600 focus:ring-green-500"
              />
              <div>
                <div className="font-medium">{method.title}</div>
                {method.description && (
                  <div className="text-sm text-gray-500">{method.description}</div>
                )}
                {method.settings?.cost?.value && (
                  <div className="text-sm font-medium text-green-600 mt-1">
                    {parseFloat(method.settings.cost.value).toFixed(2)} €
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Packeta Point Selector - only show for Z-Point shipping method */}
      {isPacketaPickupMethod(formData.shipping_method || '') && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Výber odberného miesta</h2>
          <PacketaPointSelector {...packetaProps} />
        </div>
      )}

      {/* Payment Methods */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Spôsob platby</h2>
        <div className="space-y-3">
          {paymentGateways
            .filter(gateway => gateway.id !== 'stripe_link_checkout') // Filter out the empty Stripe Link method
            .map((gateway) => (
              <label key={gateway.id} className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment_method"
                  value={gateway.id}
                  checked={formData.payment_method === gateway.id}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    payment_method: e.target.value,
                    payment_method_title: gateway.title
                  }))}
                  className="mt-1 rounded-full border-gray-300 text-green-600 focus:ring-green-500"
                />
                <div>
                  <div className="font-medium">{gateway.title}</div>
                  {gateway.description && (
                    <div className="text-sm text-gray-500">{gateway.description}</div>
                  )}
                </div>
              </label>
            ))}
        </div>
      </div>

      {/* Order Notes */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Poznámka k objednávke</h2>
        <textarea
          value={formData.customer_note}
          onChange={(e) => setFormData(prev => ({ ...prev, customer_note: e.target.value }))}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
          placeholder="Voliteľná poznámka k objednávke..."
        />
      </div>

      {/* Order Summary */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Zhrnutie objednávky</h2>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-4 py-3 border-b border-gray-100 last:border-0">
              {item.image && (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>
              )}
              <div className="flex-grow min-w-0">
                <h3 className="font-medium text-gray-900 line-clamp-2">{item.name}</h3>
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="text-gray-500">Množstvo: {item.quantity}</span>
                  <span className="font-medium">{(item.price * item.quantity).toFixed(2)} €</span>
                </div>
              </div>
            </div>
          ))}

          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Cena produktov</span>
              <span>{totalPrice.toFixed(2)} €</span>
            </div>
            {formData.shipping_method && (
              <div className="flex justify-between text-gray-600">
                <span>Doprava</span>
                <span>
                  {shippingMethods.find(method => method.id === formData.shipping_method)?.settings?.cost?.value 
                    ? `${parseFloat(shippingMethods.find(method => method.id === formData.shipping_method)?.settings?.cost?.value || '0').toFixed(2)} €` 
                    : 'Zadarmo'}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
              <span>Celková suma</span>
              <span className="text-green-600">
                {(totalPrice + (shippingMethods.find(method => method.id === formData.shipping_method)?.settings?.cost?.value 
                  ? parseFloat(shippingMethods.find(method => method.id === formData.shipping_method)?.settings?.cost?.value) 
                  : 0)).toFixed(2)} €
              </span>
            </div>
          </div>

          {formData.payment_method === 'stripe' && (
            <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-1">
                  <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                </svg>
                Bezpečná platba
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-1">
                  <path d="M4.464 3.162A2 2 0 016.28 2h7.44a2 2 0 011.816 1.162l1.154 2.5c.067.145.115.291.145.438A3.508 3.508 0 0016 6H4c-.288 0-.568.035-.835.1.03-.147.078-.293.145-.438l1.154-2.5z" />
                  <path fillRule="evenodd" d="M2 9.5a2 2 0 012-2h12a2 2 0 110 4H4a2 2 0 01-2-2zm13.24 0a.75.75 0 01.75-.75H16a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75h-.01a.75.75 0 01-.75-.75V9.5zm-2.25-.75a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75H13a.75.75 0 00.75-.75V9.5a.75.75 0 00-.75-.75h-.01z" clipRule="evenodd" />
                </svg>
                Šifrované údaje
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Spracovávam...' : 'Dokončiť objednávku'}
      </button>
    </form>
  );
} 