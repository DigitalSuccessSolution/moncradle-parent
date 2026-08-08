export function NewsletterSection() {
  return (
    <section className="bg-white border-t border-[var(--color-border)] py-8 md:py-10 flex flex-col md:flex-row items-center justify-between gap-6">
      <div>
        <h3 className="font-bold text-lg text-gray-900 mb-1">Never Miss an Update!</h3>
        <p className="text-xs font-medium text-gray-500">Subscribe to get helpful parenting tips, product updates & exclusive offers.</p>
      </div>

      <div className="flex w-full md:w-auto gap-2">
        <input
          type="email"
          placeholder="Enter your email"
          className="flex-1 md:w-64 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-xs font-medium outline-none focus:border-[var(--color-primary)] transition-colors"
        />
        <button className="bg-[var(--color-primary)] text-white px-6 py-2.5 rounded-xl font-bold shadow-md shadow-[var(--color-primary)]/20 hover:bg-[var(--color-primary-light)] transition-colors text-xs whitespace-nowrap">
          Subscribe
        </button>
      </div>
    </section>
  );
}
