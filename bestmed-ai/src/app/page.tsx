import { MedicineAlternativesFinder } from './_components/MedicineAlternativesFinder';
import { Pill } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100">
      <MedicineAlternativesFinder />
    </main>
  );
}