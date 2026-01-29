/**
 * Wallet Payment Integration
 *
 * Supports Apple Pay and Google Pay using the Payment Request API.
 * Provides a unified interface for wallet payments across browsers.
 */

export interface WalletPaymentRequest {
  amount: number;
  currency?: string;
  label?: string;
  propertyName?: string;
  checkIn?: string;
  checkOut?: string;
}

export interface WalletPaymentResult {
  success: boolean;
  paymentMethod?: 'apple_pay' | 'google_pay' | 'card';
  token?: string;
  details?: {
    cardNetwork?: string;
    last4?: string;
    billingAddress?: {
      name?: string;
      addressLine?: string[];
      city?: string;
      region?: string;
      postalCode?: string;
      country?: string;
      phone?: string;
    };
  };
  error?: string;
}

/**
 * Check if Payment Request API is supported
 */
export function isPaymentRequestSupported(): boolean {
  return typeof window !== 'undefined' && 'PaymentRequest' in window;
}

/**
 * Check if Apple Pay is available
 */
export async function isApplePayAvailable(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // Check for Apple Pay JS
  if ('ApplePaySession' in window) {
    try {
      return (window as any).ApplePaySession.canMakePayments();
    } catch {
      return false;
    }
  }

  // Fallback: Check via Payment Request API
  if (!isPaymentRequestSupported()) return false;

  try {
    const request = new PaymentRequest(
      [{ supportedMethods: 'https://apple.com/apple-pay' }],
      { total: { label: 'Test', amount: { currency: 'USD', value: '0.01' } } }
    );
    return await request.canMakePayment();
  } catch {
    return false;
  }
}

/**
 * Check if Google Pay is available
 */
export async function isGooglePayAvailable(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!isPaymentRequestSupported()) return false;

  try {
    const request = new PaymentRequest(
      [{
        supportedMethods: 'https://google.com/pay',
        data: {
          environment: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'TEST',
          apiVersion: 2,
          apiVersionMinor: 0,
          allowedPaymentMethods: [{
            type: 'CARD',
            parameters: {
              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
              allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER'],
            },
            tokenizationSpecification: {
              type: 'PAYMENT_GATEWAY',
              parameters: {
                gateway: 'slimcd',
                gatewayMerchantId: process.env.NEXT_PUBLIC_SLIMCD_MERCHANT_ID || '',
              },
            },
          }],
          merchantInfo: {
            merchantId: process.env.NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_ID || '',
            merchantName: 'Surf or Sound Realty',
          },
        },
      }],
      { total: { label: 'Test', amount: { currency: 'USD', value: '0.01' } } }
    );
    return await request.canMakePayment();
  } catch {
    return false;
  }
}

/**
 * Check which wallet payment methods are available
 */
export async function getAvailableWalletMethods(): Promise<{
  applePay: boolean;
  googlePay: boolean;
  anyWallet: boolean;
}> {
  const [applePay, googlePay] = await Promise.all([
    isApplePayAvailable(),
    isGooglePayAvailable(),
  ]);

  return {
    applePay,
    googlePay,
    anyWallet: applePay || googlePay,
  };
}

/**
 * Process payment with Apple Pay or Google Pay
 */
export async function processWalletPayment(
  request: WalletPaymentRequest
): Promise<WalletPaymentResult> {
  if (!isPaymentRequestSupported()) {
    return {
      success: false,
      error: 'Payment Request API not supported',
    };
  }

  const { amount, currency = 'USD', label, propertyName, checkIn, checkOut } = request;

  // Build display items
  const displayItems: PaymentItem[] = [];
  if (propertyName) {
    displayItems.push({
      label: propertyName,
      amount: { currency, value: amount.toFixed(2) },
    });
  }
  if (checkIn && checkOut) {
    displayItems.push({
      label: `${checkIn} - ${checkOut}`,
      amount: { currency, value: '0.00' },
      pending: false,
    });
  }

  // Payment methods configuration
  const paymentMethods: PaymentMethodData[] = [];

  // Apple Pay
  const applePayAvailable = await isApplePayAvailable();
  if (applePayAvailable) {
    paymentMethods.push({
      supportedMethods: 'https://apple.com/apple-pay',
      data: {
        version: 3,
        merchantIdentifier: process.env.NEXT_PUBLIC_APPLE_PAY_MERCHANT_ID || 'merchant.com.surforSound',
        merchantCapabilities: ['supports3DS', 'supportsCredit', 'supportsDebit'],
        supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
        countryCode: 'US',
      },
    });
  }

  // Google Pay
  const googlePayAvailable = await isGooglePayAvailable();
  if (googlePayAvailable) {
    paymentMethods.push({
      supportedMethods: 'https://google.com/pay',
      data: {
        environment: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'TEST',
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [{
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX', 'DISCOVER'],
            billingAddressRequired: true,
            billingAddressParameters: {
              format: 'FULL',
              phoneNumberRequired: true,
            },
          },
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'slimcd',
              gatewayMerchantId: process.env.NEXT_PUBLIC_SLIMCD_MERCHANT_ID || '',
            },
          },
        }],
        merchantInfo: {
          merchantId: process.env.NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_ID || '',
          merchantName: 'Surf or Sound Realty',
        },
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPrice: amount.toFixed(2),
          currencyCode: currency,
          countryCode: 'US',
        },
      },
    });
  }

  // Basic card fallback
  paymentMethods.push({
    supportedMethods: 'basic-card',
    data: {
      supportedNetworks: ['visa', 'mastercard', 'amex', 'discover'],
      supportedTypes: ['credit', 'debit'],
    },
  });

  if (paymentMethods.length === 0) {
    return {
      success: false,
      error: 'No payment methods available',
    };
  }

  // Payment details
  const details: PaymentDetailsInit = {
    displayItems,
    total: {
      label: label || 'Surf or Sound Realty',
      amount: { currency, value: amount.toFixed(2) },
    },
  };

  // Payment options
  const options: PaymentOptions = {
    requestPayerName: true,
    requestPayerEmail: true,
    requestPayerPhone: true,
    requestShipping: false,
  };

  try {
    const paymentRequest = new PaymentRequest(paymentMethods, details, options);

    // Check if can make payment
    const canPay = await paymentRequest.canMakePayment();
    if (!canPay) {
      return {
        success: false,
        error: 'Cannot make payment with available methods',
      };
    }

    // Show payment sheet
    const response = await paymentRequest.show();

    // Determine payment method type
    let paymentMethod: 'apple_pay' | 'google_pay' | 'card' = 'card';
    if (response.methodName.includes('apple')) {
      paymentMethod = 'apple_pay';
    } else if (response.methodName.includes('google')) {
      paymentMethod = 'google_pay';
    }

    // Extract token from response
    const responseDetails = response.details as any;
    let token = '';

    if (paymentMethod === 'apple_pay') {
      token = responseDetails?.token?.paymentData
        ? btoa(JSON.stringify(responseDetails.token.paymentData))
        : '';
    } else if (paymentMethod === 'google_pay') {
      token = responseDetails?.paymentMethodData?.tokenizationData?.token || '';
    } else {
      // Basic card - we need to tokenize this ourselves
      token = `card_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }

    // Complete the payment
    await response.complete('success');

    return {
      success: true,
      paymentMethod,
      token,
      details: {
        cardNetwork: responseDetails?.cardNetwork || responseDetails?.paymentMethodData?.info?.cardNetwork,
        last4: responseDetails?.last4 || responseDetails?.paymentMethodData?.info?.cardDetails,
        billingAddress: response.payerName ? {
          name: response.payerName,
          phone: response.payerPhone || undefined,
        } : undefined,
      },
    };
  } catch (err) {
    // User cancelled or error occurred
    if ((err as Error).name === 'AbortError') {
      return {
        success: false,
        error: 'Payment cancelled',
      };
    }

    console.error('Wallet payment error:', err);
    return {
      success: false,
      error: (err as Error).message || 'Payment failed',
    };
  }
}

/**
 * Create a simple "Pay with Apple Pay" or "Pay with Google Pay" button handler
 */
export function createWalletPaymentHandler(
  onSuccess: (result: WalletPaymentResult) => void,
  onError: (error: string) => void
) {
  return async (request: WalletPaymentRequest) => {
    const result = await processWalletPayment(request);

    if (result.success) {
      onSuccess(result);
    } else {
      onError(result.error || 'Payment failed');
    }
  };
}
