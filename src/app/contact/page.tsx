import type { Metadata } from 'next';
import ContactSection from '@/components/contact/ContactSection';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Harshit Shaw about a project, role, open-source idea, or collaboration.',
};

export default function ContactPage() {
  return <ContactSection />;
}
