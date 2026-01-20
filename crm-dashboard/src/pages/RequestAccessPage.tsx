import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { submitAccessRequest } from '@/services/access-requests';
import type { Property, CreateAccessRequestInput } from '@/types';

// AICODE-NOTE: Public access request form - no authentication required

export function RequestAccessPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateAccessRequestInput>({
    propertyId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    unit: '',
    reason: '',
  });

  // Fetch available properties (public endpoint)
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch('/api/public/properties');
        if (response.ok) {
          const data = await response.json();
          setProperties(data);
        }
      } catch (error) {
        console.error('Failed to fetch properties:', error);
      } finally {
        setIsLoadingProperties(false);
      }
    };

    fetchProperties();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const response = await submitAccessRequest(formData);

    if (response.success) {
      setSubmitSuccess(true);
      setFormData({
        propertyId: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        unit: '',
        reason: '',
      });
    } else {
      setSubmitError(response.error || 'Failed to submit request');
    }

    setIsSubmitting(false);
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-success-50 to-slate-100 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-success-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Request Submitted!
          </h2>
          <p className="text-slate-600 mb-6">
            Thank you for your access request. The property administrator will
            review your request and contact you at your provided email address.
          </p>

          <Link
            to="/login"
            className="inline-flex px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-slate-100 px-4 py-8">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="text-xl font-semibold text-slate-900">
              Alto CRM
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Request Access</h1>
          <p className="text-slate-600 mt-2">
            Fill out the form below to request access to a property
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {submitError && (
            <div className="mb-6 bg-error-50 border border-error-200 rounded-lg p-4">
              <p className="text-error-700 text-sm">{submitError}</p>
            </div>
          )}

          {/* Property selection */}
          <div className="mb-6">
            <label
              htmlFor="propertyId"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Property *
            </label>
            <select
              id="propertyId"
              name="propertyId"
              value={formData.propertyId}
              onChange={handleChange}
              required
              disabled={isLoadingProperties}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none disabled:bg-slate-100"
            >
              <option value="">
                {isLoadingProperties ? 'Loading...' : 'Select a property'}
              </option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.displayName || property.realm}
                </option>
              ))}
            </select>
          </div>

          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>

          {/* Phone */}
          <div className="mb-6">
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>

          {/* Unit */}
          <div className="mb-6">
            <label
              htmlFor="unit"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Unit / Apartment Number
            </label>
            <input
              type="text"
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              placeholder="e.g., Unit 101"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>

          {/* Reason */}
          <div className="mb-6">
            <label
              htmlFor="reason"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Reason for Access
            </label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={3}
              placeholder="Please describe why you need access..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>

          {/* Back to login link */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Already have access?{' '}
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default RequestAccessPage;
