import { NextResponse } from 'next/server';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

// Initialize WooCommerce API
const api = new WooCommerceRestApi({
  url: process.env.WORDPRESS_URL!,
  consumerKey: process.env.WC_CONSUMER_KEY!,
  consumerSecret: process.env.WC_CONSUMER_SECRET!,
  version: 'wc/v3',
  queryStringAuth: true
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('Attempting WordPress auth for:', email);

    // First authenticate with WordPress
    const authResponse = await fetch(`${process.env.WORDPRESS_URL}/wp-json/jwt-auth/v1/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: email,
        password: password
      })
    });

    const authData = await authResponse.json();
    console.log('Auth response:', authData); // Debug log

    if (!authResponse.ok || !authData.token) {
      return NextResponse.json(
        { 
          error: 'Nesprávne prihlasovacie údaje',
          details: authData.message || 'Authentication failed'
        },
        { status: 401 }
      );
    }

    try {
      // Get customer data from WooCommerce using the email from JWT response
      const { data: customers } = await api.get('customers', {
        search: authData.user_email // Use the email from JWT response
      });

      console.log('WooCommerce search params:', { search: authData.user_email }); // Debug log
      console.log('Found customers:', customers); // Debug log

      if (!customers || customers.length === 0) {
        return NextResponse.json(
          { 
            error: 'Nesprávne prihlasovacie údaje',
            details: 'Customer not found'
          },
          { status: 401 }
        );
      }

      const userData = customers[0];
      
      const response = NextResponse.json({
        customerToken: authData.token,
        customerId: userData.id,
        firstName: userData.first_name || authData.user_display_name || '',
        lastName: userData.last_name || '',
        email: userData.email,
        message: 'Login successful'
      });

      response.cookies.set({
        name: 'customerToken',
        value: authData.token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });

      response.cookies.set({
        name: 'customerId',
        value: userData.id.toString(),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });

      response.cookies.set({
        name: 'customerName',
        value: userData.first_name || authData.user_display_name || '',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });

      return response;

    } catch (error) {
      console.error('WooCommerce API error:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        // Log the full error object for debugging
        console.error('Full error:', JSON.stringify(error, null, 2));
      }
      
      // Try to get the customer directly using the user ID from JWT
      try {
        const userId = authData.data?.user?.id;
        if (userId) {
          const { data: customer } = await api.get(`customers/${userId}`);
          
          const response = NextResponse.json({
            customerToken: authData.token,
            customerId: customer.id,
            message: 'Login successful',
            user: {
              id: customer.id,
              email: customer.email,
              first_name: customer.first_name,
              last_name: customer.last_name,
              username: authData.user_nicename
            }
          });

          response.cookies.set({
            name: 'customerToken',
            value: authData.token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
          });

          response.cookies.set({
            name: 'customerId',
            value: customer.id.toString(),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
          });

          return response;
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }

      return NextResponse.json(
        { 
          error: 'Nepodarilo sa načítať údaje zákazníka',
          details: error instanceof Error ? error.message : 'Failed to fetch customer data'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        error: 'Prihlásenie zlyhalo',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 