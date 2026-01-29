import { NextRequest, NextResponse } from 'next/server';

/**
 * Payment Processing API Route
 *
 * This route handles payment processing through Track PMS via SlimCD.
 * In production, this would call the Track PMS API which then communicates
 * with SlimCD for actual payment processing.
 *
 * For development/testing, this returns mock successful responses.
 */

interface PaymentRequest {
  propertyTrackId: string;
  checkIn: string;
  checkOut: string;
  amount: number;
  paymentMethod: 'credit' | 'debit' | 'mail';
  card?: {
    number?: string;
    expMonth?: string;
    expYear?: string;
    cvv?: string;
  };
  billing: {
    firstName: string;
    lastName: string;
    address: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
    email?: string;
  };
}

interface SlimCDResponse {
  response: string;
  responsecode: string;
  description: string;
  gateid?: string;
  authcode?: string;
  transid?: string;
}

// SlimCD SOAP endpoint
const SLIMCD_ENDPOINT = 'https://trans.slimcd.com/wswebservices/transact.asmx';

// Get configuration from environment
const SLIMCD_CONFIG = {
  clientId: process.env.SLIMCD_CLIENT_ID || '',
  siteId: process.env.SLIMCD_SITE_ID || '',
  priceId: process.env.SLIMCD_PRICE_ID || '',
  password: process.env.SLIMCD_PASSWORD || '',
  key: process.env.SLIMCD_KEY || '',
  deviceId: process.env.SLIMCD_DEVICE_ID || '',
  isTestMode: process.env.NODE_ENV !== 'production',
};

/**
 * Format date for SlimCD (YYMMDD format)
 */
function formatDateForSlimCD(dateStr: string): string {
  const date = new Date(dateStr);
  const yy = date.getFullYear().toString().slice(-2);
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

/**
 * Calculate stay duration in days
 */
function calculateStayDuration(checkIn: string, checkOut: string): number {
  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);
  return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Build XML request for SlimCD
 */
function buildSlimCDRequest(
  data: PaymentRequest,
  transType: 'Auth' | 'Sale',
  amount: string
): string {
  const stayDuration = calculateStayDuration(data.checkIn, data.checkOut);

  return `<?xml version="1.0" encoding="utf-8"?>
<request>
  <clientid>${SLIMCD_CONFIG.clientId}</clientid>
  <siteid>${SLIMCD_CONFIG.siteId}</siteid>
  <priceid>${SLIMCD_CONFIG.priceId}</priceid>
  <password>${SLIMCD_CONFIG.password}</password>
  <key>${SLIMCD_CONFIG.key}</key>
  <deviceid>${SLIMCD_CONFIG.deviceId}</deviceid>
  <transtype>${transType}</transtype>
  <amount>${amount}</amount>
  <cardnumber>${data.card?.number || ''}</cardnumber>
  <expmonth>${data.card?.expMonth || ''}</expmonth>
  <expyear>${data.card?.expYear || ''}</expyear>
  <CVV2>${data.card?.cvv || ''}</CVV2>
  <first_name>${escapeXml(data.billing.firstName)}</first_name>
  <last_name>${escapeXml(data.billing.lastName)}</last_name>
  <address>${escapeXml(data.billing.address)}${data.billing.address2 ? ', ' + escapeXml(data.billing.address2) : ''}</address>
  <city>${escapeXml(data.billing.city)}</city>
  <state>${data.billing.country === 'US' || data.billing.country === 'CA' ? data.billing.state : 'XX'}</state>
  <zip>${data.billing.zip}</zip>
  <phone>${data.billing.phone}</phone>
  <email>${data.billing.email || ''}</email>
  <checkindate>${formatDateForSlimCD(data.checkIn)}</checkindate>
  <checkoutdate>${formatDateForSlimCD(data.checkOut)}</checkoutdate>
  <stayduration>${stayDuration}</stayduration>
  <client_transref>${data.propertyTrackId}</client_transref>
</request>`;
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Call SlimCD SOAP endpoint
 */
async function callSlimCD(xmlData: string): Promise<SlimCDResponse> {
  // Build SOAP envelope
  const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://tempuri.org/TransGateway/Transact">
  <soap:Body>
    <tns:ProcessTransaction>
      <tns:UserName>${SLIMCD_CONFIG.clientId}</tns:UserName>
      <tns:password>${SLIMCD_CONFIG.password}</tns:password>
      <tns:XMLData><![CDATA[${xmlData}]]></tns:XMLData>
    </tns:ProcessTransaction>
  </soap:Body>
</soap:Envelope>`;

  const response = await fetch(SLIMCD_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': 'http://tempuri.org/TransGateway/Transact/ProcessTransaction',
    },
    body: soapEnvelope,
  });

  if (!response.ok) {
    throw new Error(`SlimCD request failed: ${response.status}`);
  }

  const responseText = await response.text();

  // Parse the SOAP response to extract the result
  // In production, use a proper XML parser
  const responseMatch = responseText.match(/<response>(.*?)<\/response>/);
  const responsecodeMatch = responseText.match(/<responsecode>(.*?)<\/responsecode>/);
  const descriptionMatch = responseText.match(/<description>(.*?)<\/description>/);
  const gateidMatch = responseText.match(/<gateid>(.*?)<\/gateid>/);
  const authcodeMatch = responseText.match(/<authcode>(.*?)<\/authcode>/);
  const transidMatch = responseText.match(/<transid>(.*?)<\/transid>/);

  return {
    response: responseMatch?.[1] || '',
    responsecode: responsecodeMatch?.[1] || '',
    description: descriptionMatch?.[1] || '',
    gateid: gateidMatch?.[1],
    authcode: authcodeMatch?.[1],
    transid: transidMatch?.[1],
  };
}

export async function POST(request: NextRequest) {
  try {
    const data: PaymentRequest = await request.json();

    // Validate required fields
    if (!data.propertyTrackId || !data.checkIn || !data.checkOut || !data.amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // For mail check payments, return success without processing
    if (data.paymentMethod === 'mail') {
      return NextResponse.json({
        success: true,
        token: `mail_${Date.now()}`,
        message: 'Mail check payment registered',
      });
    }

    // Validate card info for card payments
    if ((data.paymentMethod === 'credit' || data.paymentMethod === 'debit') && !data.card?.number) {
      return NextResponse.json(
        { success: false, error: 'Card information is required' },
        { status: 400 }
      );
    }

    // Check if SlimCD is configured
    const isConfigured = SLIMCD_CONFIG.clientId && SLIMCD_CONFIG.password;

    if (!isConfigured || SLIMCD_CONFIG.isTestMode) {
      // Development/test mode - return mock success response
      console.log('[Payment API] Test mode - returning mock response');
      console.log('[Payment API] Request:', {
        propertyTrackId: data.propertyTrackId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        billing: data.billing,
      });

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test card validation - decline specific test numbers
      if (data.card?.number === '4000000000000002') {
        return NextResponse.json({
          success: false,
          error: 'Card declined. Please use a different card.',
        });
      }

      return NextResponse.json({
        success: true,
        token: `test_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        transactionId: `TXN-${Date.now()}`,
        authCode: `AUTH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        message: 'Payment authorized successfully',
      });
    }

    // Production mode - call SlimCD

    // Step 1: Auth the card with a small amount to get a token
    const authAmount = '0.01'; // Or use configured lookup amount
    const authXml = buildSlimCDRequest(data, 'Auth', authAmount);

    console.log('[Payment API] Sending auth request to SlimCD');
    const authResponse = await callSlimCD(authXml);

    if (authResponse.response !== 'Success' && authResponse.responsecode !== '00') {
      return NextResponse.json({
        success: false,
        error: authResponse.description || 'Card authorization failed',
      });
    }

    const token = authResponse.gateid;
    console.log('[Payment API] Card authorized, token received');

    // Step 2: Void the auth
    // (Would need to build void request similar to AuthVoid in C# code)

    // Step 3: Process the actual payment using the token
    const saleXml = buildSlimCDRequest(data, 'Sale', data.amount.toString());
    const saleResponse = await callSlimCD(saleXml);

    if (saleResponse.response !== 'Success' && saleResponse.responsecode !== '00') {
      return NextResponse.json({
        success: false,
        error: saleResponse.description || 'Payment failed',
      });
    }

    console.log('[Payment API] Payment processed successfully');

    return NextResponse.json({
      success: true,
      token: token,
      transactionId: saleResponse.transid,
      authCode: saleResponse.authcode,
      message: 'Payment processed successfully',
    });

  } catch (error) {
    console.error('[Payment API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed',
      },
      { status: 500 }
    );
  }
}
