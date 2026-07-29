import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ASPAL Emulsion Waterproofing - Company Profile',
  description: 'Company profile web untuk produk dan jasa Aspal Emulsion Waterproofing pelapis anti bocor.',
};

export default function PortoAspalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
