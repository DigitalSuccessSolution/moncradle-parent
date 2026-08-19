import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans pb-24 md:pb-0 relative">
      <main className="max-w-[800px] mx-auto px-4 md:px-8 py-8 md:py-12 space-y-8">
        
        {/* Navigation */}
        <div className="flex items-center mb-6">
          <Link
            href="/"
            className="flex items-center gap-1 px-4 py-2 -ml-4 rounded-full text-gray-700 hover:bg-gray-100 hover:text-[var(--color-primary)] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-semibold text-sm">Back to Home</span>
          </Link>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-500 font-medium">Last updated: August 17, 2026</p>
        </div>

        {/* Content */}
        <article className="prose prose-blue max-w-none text-gray-700 prose-headings:text-gray-900 prose-headings:font-bold prose-h2:mt-10 prose-h2:mb-4 prose-p:mb-5 prose-p:leading-relaxed">
          <p>
            Welcome to Moncradle! By accessing or using our mobile application, website, and related services (collectively, the "Services"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Services.
          </p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            These Terms form a legally binding contract between you and Moncradle. By registering for an account or using the app, you represent that you are at least 18 years old and have the legal capacity to agree to these Terms.
          </p>

          <h2>2. Medical Disclaimer</h2>
          <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-900 rounded-r-lg mb-6 mt-4">
            <strong>Important:</strong> Moncradle is a tracking and informational tool. It is <strong>NOT</strong> a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your pediatrician or other qualified health provider with any questions you may have regarding a medical condition or your child's health. In case of a medical emergency, call your local emergency services immediately.
          </div>

          <h2>3. User Accounts</h2>
          <p>
            To use certain features of the Service, you must register for an account. You agree to:
          </p>
          <ul>
            <li>Provide accurate, current, and complete information.</li>
            <li>Maintain the security of your password and identification.</li>
            <li>Accept all responsibility for any and all activities that occur under your account.</li>
          </ul>

          <h2>4. App Usage & Content</h2>
          <p>
            Moncradle grants you a personal, non-exclusive, non-transferable, and revocable license to use the Services for personal, non-commercial purposes. You agree not to:
          </p>
          <ul>
            <li>Modify, copy, distribute, or reverse engineer the App or any of its contents.</li>
            <li>Use the Services for any illegal or unauthorized purpose.</li>
            <li>Upload any malicious code, viruses, or disruptive data.</li>
          </ul>

          <h2>5. Expert Consultations</h2>
          <p>
            If you utilize our platform to connect with doctors or parenting experts, please note that these interactions are subject to the individual professional's terms and availability. Moncradle facilitates these connections but does not guarantee specific medical outcomes or the availability of any particular expert.
          </p>

          <h2>6. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Moncradle and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your access to or use of or inability to access or use the Services.
          </p>

          <h2>7. Changes to Terms</h2>
          <p>
            We may modify these Terms at any time. We will provide notice of significant changes by updating the date at the top of this page or by sending you an email notification. Your continued use of the Services after such changes constitutes your acceptance of the new Terms.
          </p>

          <h2>8. Contact Information</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <p className="font-semibold text-[var(--color-primary)]">
            legal@moncradle.com
          </p>
        </article>
      </main>
    </div>
  );
}
