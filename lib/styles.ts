// Shared Tailwind class strings for the Lokeet design system.
// Import these in pages/components instead of repeating inline.

export const page = {
  root: 'relative min-h-screen bg-gradient-to-br from-gray-100 to-[#f9f8e5]',
  centeredAuth: 'relative min-h-screen bg-gradient-to-br from-gray-100 to-[#f9f8e5] flex items-center justify-center p-4',
};

export const card = {
  base: 'bg-white border-2 border-black rounded-3xl shadow-lg p-8',
};

export const button = {
  primary: 'bg-white text-gray-900 font-semibold py-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors duration-300 border-2 border-gray-900',
  primaryFull: 'w-full bg-white text-gray-900 font-semibold py-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors duration-300 border-2 border-gray-900 disabled:opacity-50',
};

export const input = {
  base: 'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#42a746] focus:border-transparent',
  withIcon: 'w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-[#42a746] focus:border-transparent',
};

export const text = {
  heading: 'text-4xl md:text-6xl font-bold text-gray-900 leading-tight tracking-tighter',
  cardHeading: 'text-3xl font-bold',
  body: 'text-lg text-gray-600',
  small: 'text-sm text-gray-700',
  brand: 'text-4xl font-bold',
};

export const colors = {
  green: '#42a746',
};
