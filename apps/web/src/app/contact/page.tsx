'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  CheckCircle,
  ChevronDown,
  Headphones,
  Home,
  Calendar,
  HelpCircle,
  Key,
} from 'lucide-react';

const faqs = [
  {
    question: 'What is your cancellation policy?',
    answer: 'Our cancellation policy varies by property and booking type. Generally, cancellations made 30+ days before check-in receive a full refund. Cancellations 14-29 days before check-in receive a 50% refund. Less than 14 days notice may not be refundable. Please check your specific booking for details.',
  },
  {
    question: 'What time is check-in and check-out?',
    answer: 'Standard check-in time is 4:00 PM and check-out is 10:00 AM. Early check-in or late check-out may be available upon request, subject to availability. Contact us or your property manager to arrange.',
  },
  {
    question: 'Are pets allowed?',
    answer: "Many of our properties are pet-friendly! Look for the pet-friendly filter when searching. Pet fees typically range from $75-$150 per stay. Please note that some properties have breed or size restrictions.",
  },
  {
    question: 'How do I access my rental property?',
    answer: "Most properties use keyless entry with a unique door code provided 24-48 hours before your arrival. Your access code and detailed instructions will be sent via email and available in your trip dashboard.",
  },
  {
    question: 'What should I do in case of an emergency?',
    answer: 'For life-threatening emergencies, call 911. For property emergencies (plumbing, electrical, etc.), contact our 24/7 emergency line at (252) 555-0199. Non-urgent issues can be reported through your trip dashboard or by emailing support@surforsound.com.',
  },
];

const contactMethods = [
  {
    icon: Phone,
    title: 'Phone',
    description: 'Mon-Fri, 9am-6pm EST',
    value: '(252) 555-0100',
    action: 'tel:+12525550100',
  },
  {
    icon: Mail,
    title: 'Email',
    description: 'We respond within 24 hours',
    value: 'support@surforsound.com',
    action: 'mailto:support@surforsound.com',
  },
  {
    icon: MessageSquare,
    title: 'Live Chat',
    description: 'Chat with Sandy, our AI concierge',
    value: 'Start a conversation',
    action: '#chat',
  },
];

const topics = [
  { value: 'booking', label: 'Booking Inquiry', icon: Calendar },
  { value: 'property', label: 'Property Question', icon: Home },
  { value: 'support', label: 'Guest Support', icon: Headphones },
  { value: 'owners', label: 'Property Owner', icon: Key },
  { value: 'other', label: 'Other', icon: HelpCircle },
];

// Subject-specific configurations
const subjectConfigs: Record<string, {
  title: string;
  subtitle: string;
  topic: string;
  placeholder: string;
}> = {
  owners: {
    title: 'List Your Property',
    subtitle: 'Maximize your rental income with the Outer Banks\' premier property management company.',
    topic: 'owners',
    placeholder: 'Tell us about your property and your goals for rental income...',
  },
  booking: {
    title: 'Booking Assistance',
    subtitle: 'Need help with a reservation? We\'re here to help you plan your perfect getaway.',
    topic: 'booking',
    placeholder: 'What dates are you looking at? Any specific requirements?',
  },
};

export default function ContactPage() {
  const searchParams = useSearchParams();
  const subject = searchParams.get('subject') || '';
  const config = subjectConfigs[subject];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    topic: config?.topic || '',
    propertyId: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Update form when subject changes
  useEffect(() => {
    if (config) {
      setFormData(prev => ({ ...prev, topic: config.topic }));
    }
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className={`text-white ${
        subject === 'owners'
          ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
          : 'bg-gradient-to-r from-ocean-600 to-ocean-700'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {subject === 'owners' && (
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 mb-4">
                <Key className="w-4 h-4" />
                <span className="text-sm font-medium">Property Owners</span>
              </div>
            )}
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {config?.title || 'How can we help?'}
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              {config?.subtitle || 'Our team is here to make your Hatteras Island vacation perfect. Reach out anytime.'}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid md:grid-cols-3 gap-6">
          {contactMethods.map((method, index) => (
            <motion.a
              key={method.title}
              href={method.action}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow group"
            >
              <div className="w-14 h-14 bg-ocean-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-ocean-200 transition-colors">
                <method.icon className="w-7 h-7 text-ocean-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{method.title}</h3>
              <p className="text-gray-500 text-sm mb-2">{method.description}</p>
              <p className="text-ocean-600 font-medium">{method.value}</p>
            </motion.a>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>

            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-green-800 mb-2">Message Sent!</h3>
                <p className="text-green-700 mb-4">
                  Thank you for reaching out. Our team will get back to you within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', topic: '', propertyId: '', message: '' });
                  }}
                  className="text-green-600 font-medium hover:underline"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
                <div className="space-y-5">
                  {/* Topic Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      What can we help you with?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {topics.map((topic) => (
                        <button
                          key={topic.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, topic: topic.value })}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                            formData.topic === topic.value
                              ? 'border-ocean-500 bg-ocean-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <topic.icon className={`w-5 h-5 ${
                            formData.topic === topic.value ? 'text-ocean-600' : 'text-gray-400'
                          }`} />
                          <span className={`font-medium ${
                            formData.topic === topic.value ? 'text-ocean-700' : 'text-gray-700'
                          }`}>
                            {topic.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name & Email */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  {/* Property ID */}
                  {formData.topic === 'property' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Property Name or Confirmation Code
                      </label>
                      <input
                        type="text"
                        value={formData.propertyId}
                        onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                        placeholder="e.g., Oceanfront Paradise or SOS-2024-1234"
                      />
                    </div>
                  )}

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 resize-none"
                      placeholder={config?.placeholder || 'How can we help you?'}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-ocean-600 text-white rounded-xl font-semibold hover:bg-ocean-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>

          {/* FAQs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                        expandedFaq === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedFaq === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="px-5 pb-5"
                    >
                      <p className="text-gray-600">{faq.answer}</p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            {/* Office Info */}
            <div className="mt-8 bg-ocean-50 rounded-2xl p-6">
              <h3 className="font-semibold text-ocean-900 mb-4">Visit Our Office</h3>
              <div className="space-y-3 text-ocean-800">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p>46878 NC Highway 12</p>
                    <p>Buxton, NC 27920</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 flex-shrink-0" />
                  <p>Mon-Sat: 9am-5pm • Sun: 10am-4pm</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
