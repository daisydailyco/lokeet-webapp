import Link from 'next/link';

export default function LegalPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-100 to-[#f9f8e5] flex items-center justify-center p-4">
      <Link href="/" className="absolute top-6 left-6 flex items-center justify-center hover:opacity-60 transition-opacity">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
      </Link>
      <div className="bg-white border-2 border-black rounded-3xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl font-bold">Lokeet</Link>
          <p className="text-gray-600 mt-2">Legal</p>
        </div>
        <div className="space-y-4">
          <Link
            href="/legal/terms-of-service"
            className="flex items-center justify-between w-full px-4 py-3 border-2 border-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            Terms of Service
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
          <Link
            href="/legal/privacy-policy"
            className="flex items-center justify-between w-full px-4 py-3 border-2 border-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            Privacy Policy
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
