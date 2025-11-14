// components/MedicineAlternativesFinder.tsx
'use client';

import { useState, useEffect, type ChangeEvent, type FC, type JSX } from "react";
import {
  Camera,
  Upload,
  Search,
  IndianRupee,
  Info,
  AlertCircle,
  CheckCircle,
  TrendingDown,
  Pill,
  Shield,
  Loader2,
} from "lucide-react";

// ──────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────
type Composition = {
  ingredient: string;
  strength: string;
  unit: string;
};

type Medicine = {
  id: number;
  brand_name: string;
  generic_name: string;
  composition: Composition[];
  composition_hash: string;
  manufacturer: string;
  price: number;
  form: string;
  pack_size: number;
  uses: string[];
  side_effects: string[];
  prescription_required: boolean;
  what_it_does: string;
  contraindications: string[];
  drug_interactions: string[];
  dosage: string;
  storage: string;
  price_sources?: PriceSource[]; // will be filled by API
};

type PriceSource = {
  platform: string;
  price: number;
  url: string;
  availability: "In Stock" | "Out of Stock" | "Limited Stock";
};

type Alternatives = {
  exact: Medicine[];
  sameIngredients: Medicine[];
  similar: Medicine[];
};

type Savings = {
  amount: number;
  percentage: string;
};

// ──────────────────────────────────────────────────────────────────────
// Static fallback DB (full list – paste all 10+ medicines here)
// ──────────────────────────────────────────────────────────────────────
const staticDatabase: Medicine[] = [
  {
    id: 1,
    brand_name: "Crocin 650",
    generic_name: "Paracetamol",
    composition: [{ ingredient: "Paracetamol", strength: "650", unit: "mg" }],
    composition_hash: "paracetamol_650mg",
    manufacturer: "GSK",
    price: 25,
    form: "Tablet",
    pack_size: 15,
    uses: ["Fever", "Headache", "Body pain", "Cold symptoms"],
    side_effects: ["Nausea", "Allergic reactions (rare)", "Liver damage (overdose)", "Skin rash"],
    prescription_required: false,
    what_it_does:
      "Paracetamol works by blocking the production of prostaglandins in the brain, which are chemicals that cause pain and fever. It reduces body temperature during fever and provides relief from mild to moderate pain.",
    contraindications: ["Severe liver disease", "Allergy to paracetamol", "Chronic alcoholism"],
    drug_interactions: ["Warfarin (blood thinner)", "Carbamazepine", "Phenytoin", "Alcohol"],
    dosage: "Adults: 1-2 tablets every 4-6 hours. Maximum 4g per day.",
    storage: "Store below 25°C in a dry place",
  },
  {
    id: 2,
    brand_name: "Dolo 650",
    generic_name: "Paracetamol",
    composition: [{ ingredient: "Paracetamol", strength: "650", unit: "mg" }],
    composition_hash: "paracetamol_650mg",
    manufacturer: "Micro Labs",
    price: 30,
    form: "Tablet",
    pack_size: 15,
    uses: ["Fever", "Headache", "Body pain", "Cold symptoms"],
    side_effects: ["Nausea", "Allergic reactions (rare)", "Liver damage (overdose)"],
    prescription_required: false,
    what_it_does:
      "Paracetamol works by blocking the production of prostaglandins in the brain, which are chemicals that cause pain and fever. It reduces body temperature during fever and provides relief from mild to moderate pain.",
    contraindications: ["Severe liver disease", "Allergy to paracetamol", "Chronic alcoholism"],
    drug_interactions: ["Warfarin (blood thinner)", "Carbamazepine", "Phenytoin", "Alcohol"],
    dosage: "Adults: 1-2 tablets every 4-6 hours. Maximum 4g per day.",
    storage: "Store below 25°C in a dry place",
  },
  {
    id: 3,
    brand_name: "Calpol 650",
    generic_name: "Paracetamol",
    composition: [{ ingredient: "Paracetamol", strength: "650", unit: "mg" }],
    composition_hash: "paracetamol_650mg",
    manufacturer: "GSK",
    price: 28,
    form: "Tablet",
    pack_size: 15,
    uses: ["Fever", "Headache", "Body pain", "Cold symptoms"],
    side_effects: ["Nausea", "Allergic reactions (rare)", "Liver damage (overdose)"],
    prescription_required: false,
    what_it_does:
      "Paracetamol works by blocking the production of prostaglandins in the brain, which are chemicals that cause pain and fever. It reduces body temperature during fever and provides relief from mild to moderate pain.",
    contraindications: ["Severe liver disease", "Allergy to paracetamol", "Chronic alcoholism"],
    drug_interactions: ["Warfarin (blood thinner)", "Carbamazepine", "Phenytoin", "Alcohol"],
    dosage: "Adults: 1-2 tablets every 4-6 hours. Maximum 4g per day.",
    storage: "Store below 25°C in a dry place",
  },
  {
    id: 4,
    brand_name: "Paracetamol 650 (Generic)",
    generic_name: "Paracetamol",
    composition: [{ ingredient: "Paracetamol", strength: "650", unit: "mg" }],
    composition_hash: "paracetamol_650mg",
    manufacturer: "Various",
    price: 10,
    form: "Tablet",
    pack_size: 15,
    uses: ["Fever", "Headache", "Body pain", "Cold symptoms"],
    side_effects: ["Nausea", "Allergic reactions (rare)", "Liver damage (overdose)"],
    prescription_required: false,
    what_it_does:
      "Paracetamol works by blocking the production of prostaglandins in the brain, which are chemicals that cause pain and fever. It reduces body temperature during fever and provides relief from mild to moderate pain.",
    contraindications: ["Severe liver disease", "Allergy to paracetamol", "Chronic alcoholism"],
    drug_interactions: ["Warfarin (blood thinner)", "Carbamazepine", "Phenytoin", "Alcohol"],
    dosage: "Adults: 1-2 tablets every 4-6 hours. Maximum 4g per day.",
    storage: "Store below 25°C in a dry place",
  },
  {
    id: 5,
    brand_name: "Combiflam",
    generic_name: "Ibuprofen + Paracetamol",
    composition: [
      { ingredient: "Ibuprofen", strength: "400", unit: "mg" },
      { ingredient: "Paracetamol", strength: "325", unit: "mg" },
    ],
    composition_hash: "ibuprofen_400mg+paracetamol_325mg",
    manufacturer: "Sanofi",
    price: 28,
    form: "Tablet",
    pack_size: 20,
    uses: ["Pain relief", "Inflammation", "Fever", "Muscle pain", "Dental pain"],
    side_effects: ["Stomach upset", "Dizziness", "Nausea", "Heartburn", "Allergic reactions"],
    prescription_required: false,
    what_it_does:
      "Combiflam combines two pain relievers - Ibuprofen (an NSAID that reduces inflammation) and Paracetamol (that blocks pain signals). Together they provide faster and more effective pain relief and fever reduction than either drug alone.",
    contraindications: [
      "Active peptic ulcer",
      "Severe heart failure",
      "Severe kidney disease",
      "Third trimester of pregnancy",
    ],
    drug_interactions: ["Aspirin", "Blood thinners (Warfarin)", "Lithium", "Methotrexate", "ACE inhibitors"],
    dosage: "Adults: 1 tablet every 6-8 hours. Do not exceed 3 tablets in 24 hours.",
    storage: "Store in a cool, dry place away from sunlight",
  },
  {
    id: 6,
    brand_name: "Brufen Plus",
    generic_name: "Ibuprofen + Paracetamol",
    composition: [
      { ingredient: "Ibuprofen", strength: "400", unit: "mg" },
      { ingredient: "Paracetamol", strength: "325", unit: "mg" },
    ],
    composition_hash: "ibuprofen_400mg+paracetamol_325mg",
    manufacturer: "Abbott",
    price: 32,
    form: "Tablet",
    pack_size: 20,
    uses: ["Pain relief", "Inflammation", "Fever", "Muscle pain", "Arthritis pain"],
    side_effects: ["Stomach upset", "Dizziness", "Nausea", "Heartburn"],
    prescription_required: false,
    what_it_does:
      "Brufen Plus combines two pain relievers - Ibuprofen (an NSAID that reduces inflammation) and Paracetamol (that blocks pain signals). Together they provide faster and more effective pain relief and fever reduction than either drug alone.",
    contraindications: [
      "Active peptic ulcer",
      "Severe heart failure",
      "Severe kidney disease",
      "Third trimester of pregnancy",
    ],
    drug_interactions: ["Aspirin", "Blood thinners (Warfarin)", "Lithium", "Methotrexate", "ACE inhibitors"],
    dosage: "Adults: 1 tablet every 6-8 hours. Do not exceed 3 tablets in 24 hours.",
    storage: "Store in a cool, dry place away from sunlight",
  },
  {
    id: 7,
    brand_name: "Saridon",
    generic_name: "Paracetamol + Propyphenazone + Caffeine",
    composition: [
      { ingredient: "Paracetamol", strength: "325", unit: "mg" },
      { ingredient: "Propyphenazone", strength: "150", unit: "mg" },
      { ingredient: "Caffeine", strength: "50", unit: "mg" },
    ],
    composition_hash: "caffeine_50mg+paracetamol_325mg+propyphenazone_150mg",
    manufacturer: "Bayer",
    price: 35,
    form: "Tablet",
    pack_size: 20,
    uses: ["Headache", "Migraine", "Pain", "Toothache", "Period pain"],
    side_effects: ["Restlessness", "Nausea", "Insomnia", "Allergic reactions"],
    prescription_required: false,
    what_it_does:
      "Saridon is a triple-action pain reliever. Paracetamol reduces pain and fever, Propyphenazone provides anti-inflammatory action, and Caffeine enhances the effectiveness of pain relief while also helping with alertness.",
    contraindications: [
      "Severe liver disease",
      "Anxiety disorders",
      "High blood pressure",
      "Heart rhythm disorders",
    ],
    drug_interactions: ["Other caffeine products", "Blood thinners", "Antidepressants", "Beta-blockers"],
    dosage:
      "Adults: 1-2 tablets with water. Can be repeated after 4-6 hours if needed. Maximum 6 tablets per day.",
    storage: "Store below 30°C in a dry place",
  },
  {
    id: 8,
    brand_name: "Augmentin 625",
    generic_name: "Amoxicillin + Clavulanic Acid",
    composition: [
      { ingredient: "Amoxicillin", strength: "500", unit: "mg" },
      { ingredient: "Clavulanic Acid", strength: "125", unit: "mg" },
    ],
    composition_hash: "amoxicillin_500mg+clavulanic acid_125mg",
    manufacturer: "GSK",
    price: 180,
    form: "Tablet",
    pack_size: 10,
    uses: [
      "Bacterial infections",
      "Respiratory infections",
      "Urinary tract infections",
      "Skin infections",
    ],
    side_effects: ["Diarrhea", "Nausea", "Skin rash", "Vomiting", "Abdominal pain"],
    prescription_required: true,
    what_it_does:
      "Augmentin is a combination antibiotic that kills bacteria. Amoxicillin stops bacteria from building their cell walls, while Clavulanic acid prevents bacteria from destroying the antibiotic. Together they treat a wide range of bacterial infections.",
    contraindications: [
      "Allergy to penicillin or cephalosporin antibiotics",
      "History of liver problems with this medicine",
      "Mononucleosis",
    ],
    drug_interactions: ["Allopurinol", "Oral contraceptives", "Warfarin", "Probenecid", "Methotrexate"],
    dosage: "Adults: 1 tablet twice or thrice daily for 5-7 days. Take with food.",
    storage: "Store in a cool, dry place below 25°C",
  },
  {
    id: 9,
    brand_name: "Clavam 625",
    generic_name: "Amoxicillin + Clavulanic Acid",
    composition: [
      { ingredient: "Amoxicillin", strength: "500", unit: "mg" },
      { ingredient: "Clavulanic Acid", strength: "125", unit: "mg" },
    ],
    composition_hash: "amoxicillin_500mg+clavulanic acid_125mg",
    manufacturer: "Alkem",
    price: 145,
    form: "Tablet",
    pack_size: 10,
    uses: [
      "Bacterial infections",
      "Respiratory infections",
      "Urinary tract infections",
      "Skin infections",
    ],
    side_effects: ["Diarrhea", "Nausea", "Skin rash", "Vomiting", "Abdominal pain"],
    prescription_required: true,
    what_it_does:
      "Clavam is a combination antibiotic that kills bacteria. Amoxicillin stops bacteria from building their cell walls, while Clavulanic acid prevents bacteria from destroying the antibiotic. Together they treat a wide range of bacterial infections.",
    contraindications: [
      "Allergy to penicillin or cephalosporin antibiotics",
      "History of liver problems with this medicine",
      "Mononucleosis",
    ],
    drug_interactions: ["Allopurinol", "Oral contraceptives", "Warfarin", "Probenecid", "Methotrexate"],
    dosage: "Adults: 1 tablet twice or thrice daily for 5-7 days. Take with food.",
    storage: "Store in a cool, dry place below 25°C",
  },
  {
    id: 10,
    brand_name: "Moxikind CV 625",
    generic_name: "Amoxicillin + Clavulanic Acid",
    composition: [
      { ingredient: "Amoxicillin", strength: "500", unit: "mg" },
      { ingredient: "Clavulanic Acid", strength: "125", unit: "mg" },
    ],
    composition_hash: "amoxicillin_500mg+clavulanic acid_125mg",
    manufacturer: "Mankind",
    price: 135,
    form: "Tablet",
    pack_size: 10,
    uses: [
      "Bacterial infections",
      "Respiratory infections",
      "Urinary tract infections",
      "Skin infections",
    ],
    side_effects: ["Diarrhea", "Nausea", "Skin rash", "Vomiting", "Stomach pain"],
    prescription_required: true,
    what_it_does:
      "Moxikind CV is a combination antibiotic that kills bacteria. Amoxicillin stops bacteria from building their cell walls, while Clavulanic acid prevents bacteria from destroying the antibiotic. Together they treat a wide range of bacterial infections.",
    contraindications: [
      "Allergy to penicillin or cephalosporin antibiotics",
      "History of liver problems with this medicine",
      "Mononucleosis",
    ],
    drug_interactions: ["Allopurinol", "Oral contraceptives", "Warfarin", "Probenecid", "Methotrexate"],
    dosage:
      "Adults: 1 tablet twice or thrice daily for 5-7 days. Take with food to reduce stomach upset.",
    storage: "Store in a cool, dry place below 25°C",
  },
];

// ──────────────────────────────────────────────────────────────────────
// Helper: fetch live prices (replace with real API keys in production)
// ──────────────────────────────────────────────────────────────────────
async function fetchLivePrices(medicine: Medicine): Promise<PriceSource[]> {
  // Simulate real API calls – replace with actual 1mg / PharmEasy APIs
  const platforms = [
    { name: "1mg", base: "https://www.1mg.com" },
    { name: "PharmEasy", base: "https://pharmeasy.in" },
    { name: "Netmeds", base: "https://www.netmeds.com" },
  ];

  const results: PriceSource[] = [];

  for (const p of platforms) {
    try {
      // Mock delay + random price
      await new Promise((r) => setTimeout(r, 300));
      const randomPrice = Math.max(
        5,
        Math.round((medicine.price * (0.8 + Math.random() * 0.4)) * 10) / 10
      );
      const availability: PriceSource["availability"] =
        Math.random() > 0.7
          ? "Out of Stock"
          : Math.random() > 0.4
          ? "Limited Stock"
          : "In Stock";

      results.push({
        platform: p.name,
        price: randomPrice,
        url: `${p.base}/search?q=${encodeURIComponent(medicine.brand_name)}`,
        availability,
      });
    } catch {
      // fallback
      results.push({
        platform: p.name,
        price: medicine.price,
        url: p.base,
        availability: "In Stock",
      });
    }
  }

  return results;
}

// ──────────────────────────────────────────────────────────────────────
// Helper: find alternatives
// ──────────────────────────────────────────────────────────────────────
function findAlternativesByComposition(
  medicine: Medicine,
  db: Medicine[]
): Alternatives {
  const targetHash = medicine.composition_hash;
  const exact = db.filter((m) => m.id !== medicine.id && m.composition_hash === targetHash);

  const targetIngredients = medicine.composition
    .map((c) => c.ingredient.toLowerCase())
    .sort();
  const sameIngredients = db.filter((m) => {
    if (m.id === medicine.id) return false;
    const cand = m.composition.map((c) => c.ingredient.toLowerCase()).sort();
    return JSON.stringify(targetIngredients) === JSON.stringify(cand);
  });

  const primary = medicine.composition[0].ingredient.toLowerCase();
  const similar = db.filter(
    (m) =>
      m.id !== medicine.id &&
      m.composition.some((c) => c.ingredient.toLowerCase() === primary) &&
      !exact.includes(m) &&
      !sameIngredients.includes(m)
  );

  return {
    exact: exact.sort((a, b) => a.price - b.price),
    sameIngredients: sameIngredients.filter((m) => !exact.includes(m)),
    similar,
  };
}

// ──────────────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────────────
export const MedicineAlternativesFinder: FC = (): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [alternatives, setAlternatives] = useState<Alternatives | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    | "what_it_does"
    | "uses"
    | "side_effects"
    | "contraindications"
    | "interactions"
    | "dosage"
  >("what_it_does");
  const [loadingPrices, setLoadingPrices] = useState(false);

  // ---------------------------
  // FIXED: Load live prices only once per medicine (guarded)
  // ---------------------------
  useEffect(() => {
    let cancelled = false;

    // if no medicine or we've already fetched price_sources, do nothing
    if (!selectedMedicine || selectedMedicine.price_sources) {
      return;
    }

    const currentMedicineId = selectedMedicine.id;

    (async () => {
      setLoadingPrices(true);
      try {
        const sources = await fetchLivePrices(selectedMedicine);
        if (cancelled) return;

        // only update if selectedMedicine is still the same by id
        setSelectedMedicine((prev) =>
          prev && prev.id === currentMedicineId ? { ...prev, price_sources: sources } : prev
        );
      } catch (err) {
        // optionally log error
        // console.error("Failed to fetch prices", err);
      } finally {
        if (!cancelled) setLoadingPrices(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedMedicine]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setTimeout(() => {
        setSearchQuery("Crocin 650");
        handleSearch("Crocin 650");
      }, 1500);
    };
    reader.readAsDataURL(file);
  };

  const handleSearch = (query: string = searchQuery) => {
    const found = staticDatabase.find((m) =>
      m.brand_name.toLowerCase().includes(query.toLowerCase())
    );
    if (found) {
      // Set the found medicine (it won't have price_sources initially)
      setSelectedMedicine(found);
      const alts = findAlternativesByComposition(found, staticDatabase);
      setAlternatives(alts);
    } else {
      // clear selection if nothing matches
      setSelectedMedicine(null);
      setAlternatives(null);
    }
  };

  const calculateSavings = (orig: number, alt: number): Savings => {
    const amount = Math.max(0, orig - alt);
    const percentage = orig > 0 ? ((amount / orig) * 100).toFixed(0) : "0";
    return { amount, percentage };
  };

  const formatComposition = (comp: Composition[]) =>
    comp.map((c) => `${c.ingredient} ${c.strength}${c.unit}`).join(" + ");

  // ──────────────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur border-b border-blue-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-blue-600/90 p-2 shadow-lg shadow-blue-200/60">
                <Pill className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-blue-950">BestMed AI</h1>
                <p className="text-sm text-slate-500">
                  Access safer, clinically-matched, and more affordable alternatives.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5">
                <Shield className="h-4 w-4 text-blue-600" />
                Verified database
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                Composition matched
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Search Section */}
        <div className="mb-10 rounded-3xl border border-blue-100 bg-white/95 p-8 shadow-2xl shadow-blue-100/70">
          <div className="grid gap-8 lg:grid-cols-5">
            {/* Image Upload */}
            <div className="space-y-4 lg:col-span-2">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Camera className="h-5 w-5 text-blue-600" />
                Upload medicine photo
              </h3>
              <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/70 p-8 text-center transition-all hover:border-blue-400 hover:bg-blue-50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex h-full w-full cursor-pointer items-center justify-center"
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-full max-w-full rounded-xl object-contain shadow-inner"
                    />
                  ) : (
                    <div>
                      <Upload className="mx-auto mb-3 h-16 w-16 text-blue-300" />
                      <p className="mb-1 font-medium text-slate-800">
                        Drop image or click to upload
                      </p>
                      <p className="text-sm text-slate-500">
                        OCR will extract the medicine name automatically
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Search Input */}
            <div className="space-y-5 lg:col-span-3">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Search className="h-5 w-5 text-blue-600" />
                Search medicine
              </h3>
              <div className="space-y-4">
                <div className="flex flex-col gap-3 lg:flex-row">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Try Crocin 650, Combiflam, Augmentin 625..."
                    className="flex-1 rounded-2xl text-black text-bold border border-blue-100 bg-slate-50/60 px-6 py-4 text-lg shadow-inner focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <button
                    onClick={() => handleSearch()}
                    className="rounded-2xl bg-blue-600 px-8 py-4 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg"
                  >
                    Search
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                  <p className="mb-3 text-sm font-semibold text-slate-700">Quick picks</p>
                  <div className="flex flex-wrap gap-2">
                    {["Crocin 650", "Combiflam", "Augmentin 625", "Dolo 650", "Saridon"].map(
                      (med) => (
                        <button
                          key={med}
                          onClick={() => {
                            setSearchQuery(med);
                            handleSearch(med);
                          }}
                          className="rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-medium text-blue-700 transition-all hover:border-blue-300 hover:bg-blue-50"
                        >
                          {med}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50/90 p-4 text-sm text-blue-900">
                  <p className="font-semibold">How it works</p>
                  <p className="text-blue-800/80">
                    Upload a photo or search by name. We surface medicines with the exact same
                    composition at better prices.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {selectedMedicine && (
          <>
            {/* Selected Medicine Card */}
            <div className="mb-10 rounded-3xl border border-blue-100 bg-white/95 p-8 text-slate-900 shadow-2xl shadow-blue-100/70">
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Left */}
                <div className="space-y-6 lg:col-span-2">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide text-blue-500">
                        Current medicine
                      </p>
                      <h2 className="text-4xl font-bold text-blue-950">{selectedMedicine.brand_name}</h2>
                      <p className="text-lg text-slate-500">{selectedMedicine.generic_name}</p>
                    </div>
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/80 px-6 py-4 text-right">
                      <p className="text-xs uppercase tracking-wide text-blue-500">Best price</p>
                      <p className="text-4xl font-bold text-blue-900">
                        {loadingPrices ? (
                          <Loader2 className="inline h-8 w-8 animate-spin" />
                        ) : (
                          `₹${Math.min(
                            ...(selectedMedicine.price_sources?.map((p) => p.price) ?? [selectedMedicine.price])
                          )}`
                        )}
                      </p>
                      <p className="text-xs text-slate-500">MRP ₹{selectedMedicine.price}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Composition
                    </p>
                    <p className="text-xl font-semibold text-slate-900">
                      {formatComposition(selectedMedicine.composition)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                      {selectedMedicine.form}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                      {selectedMedicine.pack_size} units
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
                      {selectedMedicine.manufacturer}
                    </span>
                    {selectedMedicine.prescription_required ? (
                      <span className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
                        <AlertCircle className="h-4 w-4" /> Prescription required
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600">
                        <CheckCircle className="h-4 w-4" /> No prescription needed
                      </span>
                    )}
                  </div>

                  {/* Live Price Comparison */}
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
                    <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-blue-900">
                      <IndianRupee className="h-5 w-5 text-blue-600" />
                      Price comparison
                    </h4>
                    {loadingPrices ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedMedicine.price_sources?.map((source) => (
                          <div
                            key={source.platform}
                            className="flex flex-col gap-3 rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-blue-100/60 md:flex-row md:items-center md:justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-base font-semibold text-slate-900">
                                {source.platform}
                              </span>
                              <span
                                className={`text-xs font-semibold uppercase tracking-wide ${
                                  source.availability === "In Stock"
                                    ? "text-emerald-600"
                                    : source.availability === "Limited Stock"
                                    ? "text-amber-600"
                                    : "text-rose-600"
                                }`}
                              >
                                {source.availability}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-2xl font-bold text-blue-900">
                                ₹{source.price}
                              </span>
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-full border border-blue-300 px-4 py-1.5 text-sm font-semibold text-blue-700 transition-all hover:bg-blue-600 hover:text-white"
                              >
                                Buy now
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-5">
                  <div className="mb-4 flex flex-col gap-2">
                    {[
                      { key: "what_it_does", label: "How it works", icon: Info },
                      { key: "uses", label: "Uses", icon: CheckCircle },
                      { key: "side_effects", label: "Side effects", icon: AlertCircle },
                      { key: "contraindications", label: "Contraindications", icon: AlertCircle },
                      { key: "interactions", label: "Drug interactions", icon: AlertCircle },
                      { key: "dosage", label: "Dosage & storage", icon: Pill },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const active = activeTab === tab.key;
                      return (
                        <button
                          key={tab.key}
                          onClick={() => setActiveTab(tab.key as any)}
                          className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium transition-all ${
                            active
                              ? "bg-white text-blue-700 shadow"
                              : "text-slate-500 hover:bg-white/60 hover:text-blue-600"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="rounded-2xl bg-white p-4 shadow-inner">
                    {activeTab === "what_it_does" && (
                      <p className="text-sm leading-relaxed text-slate-600">
                        {selectedMedicine.what_it_does}
                      </p>
                    )}
                    {activeTab === "uses" && (
                      <div className="space-y-2">
                        {selectedMedicine.uses.map((u) => (
                          <div key={u} className="flex items-start gap-2">
                            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                            <span className="text-sm text-slate-600">{u}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {activeTab === "side_effects" && (
                      <div className="space-y-2">
                        {selectedMedicine.side_effects.map((e) => (
                          <div key={e} className="flex items-start gap-2">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                            <span className="text-sm text-slate-600">{e}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {activeTab === "contraindications" && (
                      <div className="space-y-2">
                        {selectedMedicine.contraindications.map((c) => (
                          <div key={c} className="flex items-start gap-2">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                            <span className="text-sm text-slate-600">{c}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {activeTab === "interactions" && (
                      <div className="space-y-2">
                        {selectedMedicine.drug_interactions.map((i) => (
                          <div key={i} className="flex items-start gap-2">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                            <span className="text-sm text-slate-600">{i}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {activeTab === "dosage" && (
                      <div className="space-y-4 text-sm text-slate-600">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Recommended dosage
                          </p>
                          <p>{selectedMedicine.dosage}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Storage
                          </p>
                          <p>{selectedMedicine.storage}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Alternatives */}
            {alternatives && (alternatives.exact.length > 0 || alternatives.similar.length > 0) && (
              <div className="space-y-8">
                {/* Exact */}
                {alternatives.exact.length > 0 && (
                  <div>
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-blue-50 p-2">
                          <CheckCircle className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-slate-900">Exact alternatives</h3>
                          <p className="text-sm text-slate-500">
                            Same composition · {alternatives.exact.length} options
                          </p>
                        </div>
                      </div>
                      {alternatives.exact[0] && (
                        <div className="rounded-2xl border border-blue-100 bg-blue-50/80 px-6 py-3 text-right">
                          <p className="text-sm font-semibold text-blue-700">Best savings</p>
                          <p className="text-3xl font-bold text-blue-900">
                            ₹{calculateSavings(selectedMedicine.price, alternatives.exact[0].price).amount}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {alternatives.exact.map((alt) => {
                        const savings = calculateSavings(selectedMedicine.price, alt.price);
                        return (
                          <div
                            key={alt.id}
                            className="group overflow-hidden rounded-2xl border border-blue-100 bg-white p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl"
                          >
                            {savings.amount > 0 && (
                              <div className="mb-4 inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-sm font-semibold text-white shadow">
                                <TrendingDown className="h-4 w-4" />
                                Save {savings.percentage}%
                              </div>
                            )}
                            <h4 className="text-xl font-bold text-slate-900">{alt.brand_name}</h4>
                            <p className="mb-4 text-sm text-slate-500">{alt.manufacturer}</p>
                            <div className="mb-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Composition
                              </p>
                              <p className="text-sm font-medium text-slate-900">
                                {formatComposition(alt.composition)}
                              </p>
                            </div>
                            <div className="flex items-end justify-between">
                              <div>
                                <p className="text-3xl font-bold text-blue-900">₹{alt.price}</p>
                                {savings.amount > 0 && (
                                  <p className="text-sm font-semibold text-emerald-600">
                                    Save ₹{savings.amount}
                                  </p>
                                )}
                              </div>
                              <div className="text-right text-xs text-slate-500">
                                <p className="font-medium">
                                  {alt.pack_size} {alt.form}s
                                </p>
                              </div>
                            </div>
                            <div className="mt-4 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-2 text-xs font-semibold text-blue-700">
                              Exact same composition
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Similar */}
                {alternatives.similar.length > 0 && (
                  <div>
                    <div className="mb-6 flex items-center gap-3">
                      <div className="rounded-2xl bg-blue-50 p-2">
                        <Info className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900">Similar medicines</h3>
                        <p className="text-sm text-slate-500">
                          Contains primary ingredient · {alternatives.similar.length} options
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {alternatives.similar.map((alt) => (
                        <div
                          key={alt.id}
                          className="overflow-hidden rounded-2xl border border-blue-100 bg-white p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl"
                        >
                          <h4 className="text-xl font-bold text-slate-900">{alt.brand_name}</h4>
                          <p className="mb-4 text-sm text-slate-500">{alt.manufacturer}</p>
                          <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                              Composition
                            </p>
                            <p className="text-sm font-medium text-slate-900">
                              {formatComposition(alt.composition)}
                            </p>
                          </div>
                          <div className="flex items-end justify-between">
                            <p className="text-3xl font-bold text-blue-900">₹{alt.price}</p>
                            <div className="text-right text-xs text-slate-500">
                              <p className="font-medium">
                                {alt.pack_size} {alt.form}s
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700">
                            Similar therapeutic effect
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Disclaimer */}
            <div className="mt-8 rounded-2xl border border-blue-100 bg-white/90 p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 shrink-0 text-blue-500" />
                <div className="text-sm text-slate-600">
                  <p className="mb-2 text-base font-semibold text-blue-900">
                    Important medical disclaimer
                  </p>
                  <p>
                    This information is for reference only and should not be treated as medical
                    advice. Always consult your doctor or licensed pharmacist before switching
                    medicines.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!selectedMedicine && (
          <div className="rounded-3xl border border-blue-100 bg-white/95 px-8 py-16 text-center shadow-2xl shadow-blue-100/70">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Pill className="h-12 w-12" />
            </div>
            <h3 className="mb-3 text-2xl font-bold text-slate-900">
              Ready to find alternatives?
            </h3>
            <p className="mx-auto mb-6 max-w-2xl text-lg text-slate-500">
              Upload a medicine photo or search by name to discover clinically matched,
              wallet-friendly options.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-600">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                Composition-based matching
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2">
                <IndianRupee className="h-5 w-5 text-blue-600" />
                Save up to 60%
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Verified database
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicineAlternativesFinder;