import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Mail, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Surf or Sound',
  description: 'Learn how Surf or Sound collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-ocean-600 to-ocean-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8" />
            <span className="text-ocean-200 font-medium">Legal</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <div className="flex items-center gap-2 text-ocean-200">
            <Calendar className="w-4 h-4" />
            <span>Last updated: January 15, 2024</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600">
            <p className="lead text-xl text-gray-700">
              At Surf or Sound, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
            </p>

            <h2>Information We Collect</h2>
            <h3>Personal Information</h3>
            <p>We may collect personal information that you voluntarily provide to us when you:</p>
            <ul>
              <li>Create an account or make a reservation</li>
              <li>Subscribe to our newsletter</li>
              <li>Contact us with inquiries or feedback</li>
              <li>Participate in promotions or surveys</li>
            </ul>
            <p>This information may include:</p>
            <ul>
              <li>Name, email address, phone number</li>
              <li>Billing and shipping address</li>
              <li>Payment information (processed securely by our payment providers)</li>
              <li>Travel preferences and past booking history</li>
            </ul>

            <h3>Automatically Collected Information</h3>
            <p>When you visit our website, we automatically collect certain information, including:</p>
            <ul>
              <li>Device type, browser type, and operating system</li>
              <li>IP address and approximate location</li>
              <li>Pages viewed and time spent on our site</li>
              <li>Referring website or search terms used</li>
            </ul>

            <h2>How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Process and manage your reservations</li>
              <li>Communicate with you about your bookings and account</li>
              <li>Send promotional materials (with your consent)</li>
              <li>Improve our website and services</li>
              <li>Prevent fraud and ensure security</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>Information Sharing</h2>
            <p>We may share your information with:</p>
            <ul>
              <li><strong>Property Owners:</strong> To facilitate your booking and stay</li>
              <li><strong>Service Providers:</strong> Payment processors, email services, and analytics providers who help us operate our business</li>
              <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
            </ul>
            <p>We do not sell your personal information to third parties.</p>

            <h2>Cookies and Tracking</h2>
            <p>We use cookies and similar technologies to:</p>
            <ul>
              <li>Remember your preferences and login status</li>
              <li>Analyze website traffic and usage patterns</li>
              <li>Deliver personalized content and advertisements</li>
            </ul>
            <p>You can control cookie settings through your browser preferences. Note that disabling cookies may affect website functionality.</p>

            <h2>Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal information, including:</p>
            <ul>
              <li>SSL encryption for data transmission</li>
              <li>Secure data storage with access controls</li>
              <li>Regular security assessments and updates</li>
              <li>Employee training on data protection</li>
            </ul>

            <h2>Your Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul>
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Opt out of marketing communications</li>
              <li>Object to certain processing activities</li>
            </ul>

            <h2>Children's Privacy</h2>
            <p>Our services are not directed to individuals under 18. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal information, we will take steps to delete such information.</p>

            <h2>Third-Party Links</h2>
            <p>Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.</p>

            <h2>Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.</p>

            <h2>Contact Us</h2>
            <p>If you have questions about this Privacy Policy or our privacy practices, please contact us:</p>
            <ul>
              <li>Email: privacy@surforsound.com</li>
              <li>Phone: (252) 555-0100</li>
              <li>Mail: 46878 NC Highway 12, Buxton, NC 27920</li>
            </ul>
          </div>
        </div>

        {/* Related Links */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/terms"
            className="px-4 py-2 bg-white rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Terms of Service
          </Link>
          <Link
            href="/contact"
            className="px-4 py-2 bg-white rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Contact Us
          </Link>
          <a
            href="mailto:privacy@surforsound.com"
            className="px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Email Privacy Team
          </a>
        </div>
      </div>
    </div>
  );
}
