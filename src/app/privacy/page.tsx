import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-500 font-medium">Last updated: August 17, 2026</p>
        </div>

        {/* Content */}
        <article className="prose prose-blue max-w-none text-gray-700 prose-headings:text-gray-900 prose-headings:font-bold prose-h2:mt-10 prose-h2:mb-4 prose-p:mb-5 prose-p:leading-relaxed">
          <p>
            Welcome to Moncradle! We are deeply committed to protecting your privacy and ensuring the security of the personal information you share with us. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our web and mobile applications to track your baby's growth, nutrition, and milestones.
          </p>

          <h2>1. Information We Collect</h2>
          <p>
            We collect information that you provide directly to us, such as when you create an account, build a baby profile, log health records, or communicate with us. This includes:
          </p>
          <ul>
            <li><strong>Personal Information:</strong> Your name, email address, phone number, and password.</li>
            <li><strong>Child Information:</strong> Your child's name, birth date, gender, weight, height, and milestones.</li>
            <li><strong>Health & Nutrition Data:</strong> Logs regarding feeding schedules, sleep routines, allergies, and health records entered into the app.</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>
            The data we collect is used strictly to provide and improve the Moncradle experience. Specifically, we use your information to:
          </p>
          <ul>
            <li>Personalize the app experience by offering age-appropriate parenting tips, nutrition plans, and milestone predictions.</li>
            <li>Enable consultations with healthcare professionals through our "Expert Consultation" features.</li>
            <li>Maintain, operate, and secure your account and data.</li>
            <li>Send you important administrative notifications, updates, and reminders.</li>
          </ul>

          <h2>3. Health Data and Privacy</h2>
          <p>
            Given the sensitive nature of health and development tracking, we apply strict encryption to your child's health records. We do <strong>not</strong> sell your child's health or developmental data to third-party advertisers or marketers.
          </p>

          <h2>4. Data Sharing & Disclosure</h2>
          <p>
            We do not share your personal information with third parties except in the following limited circumstances:
          </p>
          <ul>
            <li><strong>With your consent:</strong> When you actively choose to share records with a doctor or expert via our platform.</li>
            <li><strong>Service Providers:</strong> We use trusted third-party cloud hosting and database providers (e.g., AWS, MongoDB Atlas) who are bound by strict data processing agreements.</li>
            <li><strong>Legal Requirements:</strong> If required by law, subpoena, or other legal processes.</li>
          </ul>

          <h2>5. Children's Privacy</h2>
          <p>
            Moncradle is designed for use by parents and guardians. We do not knowingly collect personal information directly from children under the age of 13. All information regarding a child must be entered by their parent or legal guardian.
          </p>

          <h2>6. Data Security</h2>
          <p>
            We implement robust physical, technical, and administrative security measures to protect your data from unauthorized access, disclosure, or destruction. However, please be aware that no method of transmission over the internet is 100% secure.
          </p>

          <h2>7. Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy or how your data is handled, please contact our Data Protection Officer at:
          </p>
          <p className="font-semibold text-[var(--color-primary)]">
            privacy@moncradle.com
          </p>
        </article>
      </main>
    </div>
  );
}
