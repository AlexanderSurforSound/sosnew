import { Metadata } from 'next';
import Link from 'next/link';
import { FileText, Mail, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | Surf or Sound',
  description: 'Read the terms and conditions for using Surf or Sound vacation rental services.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-ocean-600 to-ocean-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8" />
            <span className="text-ocean-200 font-medium">Legal</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
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
              Welcome to Surf or Sound. By accessing or using our website and services, you agree to be bound by these Terms of Service. Please read them carefully.
            </p>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using the Surf or Sound website and services, you accept and agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.
            </p>

            <h2>2. Description of Services</h2>
            <p>
              Surf or Sound operates as a vacation rental marketplace, connecting property owners with guests seeking accommodations on Hatteras Island, North Carolina. We facilitate bookings, payments, and communications between parties.
            </p>

            <h2>3. User Accounts</h2>
            <h3>Registration</h3>
            <p>
              To book a property or access certain features, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate.
            </p>
            <h3>Account Security</h3>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized access.
            </p>

            <h2>4. Booking and Reservations</h2>
            <h3>Reservation Process</h3>
            <ul>
              <li>All reservations are subject to availability and confirmation</li>
              <li>A booking is confirmed upon receipt of required payment</li>
              <li>You will receive a confirmation email with booking details</li>
            </ul>

            <h3>Payment Terms</h3>
            <ul>
              <li>A 50% deposit is required at the time of booking</li>
              <li>The remaining balance is due 30 days prior to check-in</li>
              <li>Bookings made within 30 days of check-in require full payment</li>
              <li>All prices are in US dollars and subject to applicable taxes and fees</li>
            </ul>

            <h3>Cancellation Policy</h3>
            <ul>
              <li><strong>60+ days before check-in:</strong> Full refund minus $50 processing fee</li>
              <li><strong>30-59 days before check-in:</strong> 50% refund</li>
              <li><strong>Less than 30 days:</strong> No refund (unless covered by travel insurance)</li>
            </ul>

            <h2>5. Guest Responsibilities</h2>
            <p>As a guest, you agree to:</p>
            <ul>
              <li>Treat the rental property with care and respect</li>
              <li>Comply with all property rules and local laws</li>
              <li>Not exceed the maximum occupancy listed for the property</li>
              <li>Report any damage or issues promptly</li>
              <li>Leave the property in a reasonable condition</li>
              <li>Not engage in illegal activities on the premises</li>
              <li>Not host events or parties without prior written approval</li>
            </ul>

            <h2>6. Property Rules</h2>
            <p>
              Each property may have specific rules regarding noise, pets, smoking, parking, and use of amenities. These rules are provided before booking and must be followed during your stay.
            </p>

            <h2>7. Damages and Security Deposits</h2>
            <p>
              Some properties require a security deposit or damage waiver. You are responsible for any damage beyond normal wear and tear. We may charge your payment method on file for documented damages.
            </p>

            <h2>8. Liability Limitations</h2>
            <p>
              Surf or Sound acts as an intermediary between guests and property owners. We are not liable for:
            </p>
            <ul>
              <li>Property conditions, amenities, or accuracy of listings</li>
              <li>Personal injury or property damage during your stay</li>
              <li>Acts of nature, emergencies, or circumstances beyond our control</li>
              <li>Actions or omissions of property owners or other guests</li>
            </ul>
            <p>
              Our total liability shall not exceed the amount you paid for your reservation.
            </p>

            <h2>9. Intellectual Property</h2>
            <p>
              All content on our website, including text, graphics, logos, and software, is the property of Surf or Sound and protected by copyright and trademark laws. You may not reproduce, distribute, or create derivative works without our written permission.
            </p>

            <h2>10. Prohibited Activities</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use our services for any unlawful purpose</li>
              <li>Attempt to interfere with or disrupt our services</li>
              <li>Impersonate any person or entity</li>
              <li>Submit false or misleading information</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>

            <h2>11. Data Scraping, Bots, and Automated Access</h2>
            <p>
              You expressly agree that you will NOT use any robot, spider, scraper, crawler, bot, data mining tool, or any automated means or interface not provided by us to access our services, extract data, or otherwise collect information from our website. This includes but is not limited to:
            </p>
            <ul>
              <li>Scraping, harvesting, or collecting property listings, pricing data, availability information, images, reviews, or any other content from our website</li>
              <li>Using automated tools to monitor property availability, pricing changes, or booking status</li>
              <li>Creating derivative databases or datasets from information obtained from our website</li>
              <li>Training artificial intelligence or machine learning models using content from our website</li>
              <li>Reproducing, republishing, or redistributing our property listings or content on other websites or platforms</li>
              <li>Accessing our website through any automated means at a rate that exceeds reasonable human browsing activity</li>
              <li>Circumventing any technological measures we use to protect our website and content</li>
            </ul>
            <p>
              We reserve the right to block, restrict, or terminate access to our website for any user or IP address that we believe is engaging in prohibited automated access. We may pursue legal action against any party that violates these terms, including seeking damages and injunctive relief. Violation of this section may also constitute violations of the Computer Fraud and Abuse Act (18 U.S.C. § 1030) and similar state laws.
            </p>

            <h2>12. Dispute Resolution</h2>
            <p>
              Any disputes arising from these Terms or our services shall be resolved through binding arbitration in Dare County, North Carolina, in accordance with the rules of the American Arbitration Association.
            </p>

            <h2>13. Modifications</h2>
            <p>
              We reserve the right to modify these Terms at any time. Changes become effective upon posting to our website. Your continued use of our services after changes constitutes acceptance of the modified terms.
            </p>

            <h2>14. Termination</h2>
            <p>
              We may terminate or suspend your account and access to our services at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users or our business.
            </p>

            <h2>15. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of North Carolina, without regard to its conflict of law provisions.
            </p>

            <h2>16. Contact Information</h2>
            <p>For questions about these Terms of Service, please contact us:</p>
            <ul>
              <li>Email: legal@surforsound.com</li>
              <li>Phone: (252) 555-0100</li>
              <li>Mail: 46878 NC Highway 12, Buxton, NC 27920</li>
            </ul>
          </div>
        </div>

        {/* Related Links */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/privacy"
            className="px-4 py-2 bg-white rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/contact"
            className="px-4 py-2 bg-white rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Contact Us
          </Link>
          <a
            href="mailto:legal@surforsound.com"
            className="px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Email Legal Team
          </a>
        </div>
      </div>
    </div>
  );
}
