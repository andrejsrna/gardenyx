'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

interface Order {
  id: string;
  status: string;
  createdAt: string;
  total: { toString(): string };
  currency: string;
  items: Array<{
    productName: string;
    quantity: number;
    total: { toString(): string };
  }>;
  meta?: Array<{
    key: string;
    value: string;
  }>;
}

interface BillingFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address_1: string;
  city: string;
  postcode: string;
  country: string;
  company?: string;
}

export default function AccountPage() {
  const router = useRouter();
  const { isAuthenticated, customerData, login: authLogin, logout: authLogout, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [billingFormData, setBillingFormData] = useState<BillingFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address_1: '',
    city: '',
    postcode: '',
    country: 'SK'
  });

  const fetchOrders = useCallback(async (email: string) => {
    try {
      const response = await fetch(`/api/orders?email=${encodeURIComponent(email)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Chyba pri načítaní objednávok');
      setOrders([]);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await authLogin(formData.email, formData.password);
      toast.success('Prihlásenie úspešné');
      // Reload the page after successful login
      window.location.reload();
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Prihlásenie zlyhalo', {
        description: 'Nesprávne prihlasovacie údaje alebo iná chyba',
      });
    }
  };

  const handleLogout = async () => {
    try {
      setOrders([]); // Clear orders immediately
      await authLogout();
      toast.success('Odhlásenie úspešné');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Odhlásenie zlyhalo');
    }
  };

  const handleBillingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // TODO: Implement a dedicated profile update endpoint; for now just keep data locally
      setIsEditing(false);
      toast.success('Údaje boli uložené iba lokálne');
    } catch (error) {
      console.error('Error updating billing information:', error);
      toast.error(error instanceof Error ? error.message : 'Nepodarilo sa aktualizovať údaje');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Nepodarilo sa odoslať email na obnovenie hesla');
      }

      toast.success('Email na obnovenie hesla bol odoslaný');
      setIsForgotPassword(false);
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error(error instanceof Error ? error.message : 'Nepodarilo sa odoslať email na obnovenie hesla');
    } finally {
      setIsResetting(false);
    }
  };

  useEffect(() => {
    if (customerData?.billing) {
      setBillingFormData({
        first_name: customerData.billing.first_name || customerData.first_name || '',
        last_name: customerData.billing.last_name || customerData.last_name || '',
        email: customerData.billing.email || customerData.email || '',
        phone: customerData.billing.phone || '',
        address_1: customerData.billing.address_1 || '',
        city: customerData.billing.city || '',
        postcode: customerData.billing.postcode || '',
        country: customerData.billing.country || 'SK'
      });
    }
  }, [customerData]);

  // Also fetch orders when customerData becomes available
  useEffect(() => {
    if (customerData?.email || customerData?.billing?.email) {
      fetchOrders(customerData?.billing?.email || customerData.email!);
    }
  }, [customerData?.email, customerData?.billing?.email, fetchOrders]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (isForgotPassword) {
      return (
        <div className="max-w-md mx-auto mb-16 mt-16 p-8 bg-white rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-green-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Obnovenie hesla</h1>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div className="relative">
              <input
                type="email"
                id="reset-email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="peer w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm focus:border-green-500 focus:ring-green-500 placeholder-transparent"
                placeholder="Email"
                required
              />
              <label
                htmlFor="reset-email"
                className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-600 transition-all
                         peer-placeholder-shown:top-4 peer-placeholder-shown:left-4 peer-placeholder-shown:text-sm
                         peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs"
              >
                Email
              </label>
              <span className="absolute inset-y-0 end-0 grid w-10 place-content-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </span>
            </div>

            <button
              type="submit"
              disabled={isResetting}
              className="w-full bg-green-600 text-white py-4 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400
                       disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {isResetting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Odosielam...</span>
                </div>
              ) : (
                'Odoslať link na obnovenie hesla'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsForgotPassword(false)}
              className="text-sm text-gray-600 hover:text-green-600 transition-colors"
            >
              Späť na prihlásenie
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-md mx-auto mb-16 mt-16 p-8 bg-white rounded-2xl shadow-sm">
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
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Prihlásenie</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              id="login"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="peer w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm focus:border-green-500 focus:ring-green-500 placeholder-transparent"
              placeholder="Prihlasovacie meno"
              required
            />
            <label
              htmlFor="login"
              className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-600 transition-all
                       peer-placeholder-shown:top-4 peer-placeholder-shown:left-4 peer-placeholder-shown:text-sm
                       peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs"
            >
              Prihlasovacie meno
            </label>
            <span className="absolute inset-y-0 end-0 grid w-10 place-content-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </span>
          </div>

          <div className="relative">
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="peer w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm focus:border-green-500 focus:ring-green-500 placeholder-transparent"
              placeholder="Heslo"
              required
            />
            <label
              htmlFor="password"
              className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-600 transition-all
                       peer-placeholder-shown:top-4 peer-placeholder-shown:left-4 peer-placeholder-shown:text-sm
                       peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs"
            >
              Heslo
            </label>
            <span className="absolute inset-y-0 end-0 grid w-10 place-content-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </span>
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
                <span>Prihlasujem...</span>
              </div>
            ) : (
              'Prihlásiť sa'
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <button
            onClick={() => setIsForgotPassword(true)}
            className="text-sm text-gray-600 hover:text-green-600 transition-colors"
          >
            Zabudli ste heslo?
          </button>
          <div>
            <button
              onClick={() => router.push('/registracia')}
              className="text-sm text-gray-600 hover:text-green-600 transition-colors"
            >
              Nemáte účet? <span className="text-green-600 font-medium">Zaregistrujte sa</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Môj účet</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          Odhlásiť sa
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Navigation */}
        <div className="w-full md:w-64 space-y-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left px-4 py-2 rounded-lg ${
              activeTab === 'orders'
                ? 'bg-green-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Objednávky
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`w-full text-left px-4 py-2 rounded-lg ${
              activeTab === 'account'
                ? 'bg-green-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Údaje účtu
          </button>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'orders' && (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Moje objednávky
                </h3>
              </div>
              <div className="border-t border-gray-200">
                {orders.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {orders.map((order) => {
                      const rawInvoiceUrl = order.meta?.find(meta => meta.key === '_invoice_url')?.value;
                      const invoiceUrl = rawInvoiceUrl?.startsWith('http') ? rawInvoiceUrl : rawInvoiceUrl ? `https://${rawInvoiceUrl.replace(/^\/+/, '')}` : null;
                      const invoiceNumber = order.meta?.find(meta => meta.key === '_invoice_number')?.value;
                      return (
                        <div key={order.id} className="p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                Objednávka #{order.id}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString('sk-SK')}
                              </div>
                              <div className="mt-2">
                                {order.items.map((item, index) => (
                                  <div key={index} className="text-sm text-gray-600">
                                    {item.productName} × {item.quantity}
                                  </div>
                                ))}
                              </div>
                              <div className="mt-2 flex flex-col gap-1">
                                {order.meta?.find(meta => meta.key === '_packeta_barcode')?.value && (
                                  <a
                                    href={`https://tracking.app.packeta.com/sk/${order.meta.find(meta => meta.key === '_packeta_barcode')?.value}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-700"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                    </svg>
                                    Sledovať zásielku
                                  </a>
                                )}
                                {invoiceUrl && (
                                  <a
                                    href={invoiceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-green-600 hover:text-green-700 inline-flex items-center gap-1"
                                  >
                                    <span>Stiahnuť faktúru</span>
                                    {invoiceNumber && (
                                      <span className="text-xs text-gray-500">({invoiceNumber})</span>
                                    )}
                                  </a>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">
                                {order.total.toString()} €
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.status === 'processing'
                                  ? 'Spracováva sa'
                                  : order.status === 'completed'
                                  ? 'Dokončená'
                                  : order.status}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    Zatiaľ nemáte žiadne objednávky
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'account' && customerData && (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Údaje účtu
                </h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  {isEditing ? 'Zrušiť' : 'Upraviť'}
                </button>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                {isEditing ? (
                  <form onSubmit={handleBillingSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="billing-first-name" className="block text-sm font-medium text-gray-700">
                          Meno <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="billing-first-name"
                          required
                          value={billingFormData.first_name}
                          onChange={(e) => setBillingFormData(prev => ({
                            ...prev,
                            first_name: e.target.value
                          }))}
                          placeholder="Vaše meno"
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="billing-last-name" className="block text-sm font-medium text-gray-700">
                          Priezvisko <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="billing-last-name"
                          required
                          value={billingFormData.last_name}
                          onChange={(e) => setBillingFormData(prev => ({
                            ...prev,
                            last_name: e.target.value
                          }))}
                          placeholder="Vaše priezvisko"
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="billing-email" className="block text-sm font-medium text-gray-700">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          id="billing-email"
                          required
                          value={billingFormData.email}
                          onChange={(e) => setBillingFormData(prev => ({
                            ...prev,
                            email: e.target.value
                          }))}
                          placeholder="Váš email"
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="billing-phone" className="block text-sm font-medium text-gray-700">
                          Telefón <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          id="billing-phone"
                          required
                          value={billingFormData.phone}
                          onChange={(e) => setBillingFormData(prev => ({
                            ...prev,
                            phone: e.target.value
                          }))}
                          placeholder="+421 XXX XXX XXX"
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="billing-address" className="block text-sm font-medium text-gray-700">
                          Adresa <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="billing-address"
                          required
                          value={billingFormData.address_1}
                          onChange={(e) => setBillingFormData(prev => ({
                            ...prev,
                            address_1: e.target.value
                          }))}
                          placeholder="Ulica a číslo"
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="billing-city" className="block text-sm font-medium text-gray-700">
                          Mesto <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="billing-city"
                          required
                          value={billingFormData.city}
                          onChange={(e) => setBillingFormData(prev => ({
                            ...prev,
                            city: e.target.value
                          }))}
                          placeholder="Mesto"
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="billing-postcode" className="block text-sm font-medium text-gray-700">
                          PSČ <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="billing-postcode"
                          required
                          pattern="\d{5}"
                          value={billingFormData.postcode}
                          onChange={(e) => setBillingFormData(prev => ({
                            ...prev,
                            postcode: e.target.value
                          }))}
                          placeholder="PSČ (5 číslic)"
                          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Zrušiť
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                      >
                        Uložiť zmeny
                      </button>
                    </div>
                  </form>
                ) : (
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Meno</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {customerData.billing?.first_name || customerData.first_name || '-'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Priezvisko</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {customerData.billing?.last_name || customerData.last_name || '-'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {customerData.email || '-'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Telefón</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {customerData.billing?.phone || '-'}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">
                        Fakturačná adresa
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {customerData.billing?.address_1 || '-'}
                        <br />
                        {customerData.billing?.postcode} {customerData.billing?.city}
                        <br />
                        {customerData.billing?.country || '-'}
                      </dd>
                    </div>
                  </dl>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
