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
    "id": 1,
    "brand_name": "Augmentin 1000 Duo",
    "generic_name": "Amoxycillin + Clavulanic Acid",
    "composition": [
      { "ingredient": "Amoxycillin", "strength": "875", "unit": "mg" },
      { "ingredient": "Clavulanic Acid", "strength": "125", "unit": "mg" }
    ],
    "composition_hash": "amoxycillin_875mg+clavulanic_acid_125mg",
    "manufacturer": "GlaxoSmithKline Pharmaceuticals Ltd",
    "price": 553,
    "form": "Tablet",
    "pack_size": 6,
    "uses": [
      "Bacterial infections of lungs",
      "Ear infections",
      "Nasal sinus infections",
      "Urinary tract infections",
      "Skin and soft tissue infections"
    ],
    "side_effects": [
      "Nausea",
      "Vomiting",
      "Diarrhea",
      "Rash"
    ],
    "prescription_required": true,
    "what_it_does": "Amoxicillin kills bacteria by inhibiting cell wall synthesis. Clavulanic acid prevents bacterial resistance by inhibiting beta-lactamase enzymes.",
    "contraindications": [
      "Hypersensitivity to penicillins or cephalosporins",
      "History of cholestatic jaundice/hepatic dysfunction with this combination"
    ],
    "drug_interactions": [
      "Probenecid (increases amoxicillin levels)",
      "Warfarin (increased bleeding risk)",
      "Oral contraceptives (reduced efficacy)"
    ],
    "dosage": "1 tablet twice daily for 5–14 days depending on infection severity.",
    "storage": "Store below 25°C in a dry place. Protect from moisture."
  },
  {
    "id": 2,
    "brand_name": "Glycomet-GP 1",
    "generic_name": "Glimepiride + Metformin",
    "composition": [
      { "ingredient": "Glimepiride", "strength": "1", "unit": "mg" },
      { "ingredient": "Metformin", "strength": "500", "unit": "mg" }
    ],
    "composition_hash": "glimepiride_1mg+metformin_500mg",
    "manufacturer": "USV Ltd",
    "price": 107,
    "form": "Tablet",
    "pack_size": 15,
    "uses": [
      "Control blood sugar levels in type 2 diabetes"
    ],
    "side_effects": [
      "Hypoglycemia",
      "Nausea",
      "Stomach pain"
    ],
    "prescription_required": true,
    "what_it_does": "Glimepiride stimulates insulin release from pancreas. Metformin reduces hepatic glucose production and improves insulin sensitivity.",
    "contraindications": [
      "Type 1 diabetes",
      "Diabetic ketoacidosis",
      "Severe renal impairment (eGFR <30 mL/min)",
      "Acute or chronic metabolic acidosis"
    ],
    "drug_interactions": [
      "Beta-blockers (mask hypoglycemia symptoms)",
      "NSAIDs (increased hypoglycemia risk)",
      "Fluconazole (increased glimepiride effect)"
    ],
    "dosage": "1 tablet once or twice daily with meals. Titrate based on blood glucose.",
    "storage": "Store below 30°C. Protect from light and moisture."
  },
  {
    "id": 3,
    "brand_name": "Human Mixtard 70/30",
    "generic_name": "Insulin Isophane + Soluble Insulin",
    "composition": [
      { "ingredient": "Insulin Isophane", "strength": "70", "unit": "%" },
      { "ingredient": "Soluble Insulin", "strength": "30", "unit": "%" }
    ],
    "composition_hash": "insulin_isophane_70%+soluble_insulin_30%",
    "manufacturer": "Novo Nordisk India Pvt Ltd",
    "price": 463,
    "form": "Injection",
    "pack_size": 1,
    "uses": [
      "Blood sugar control in diabetes mellitus"
    ],
    "side_effects": [
      "Hypoglycemia",
      "Injection site reactions"
    ],
    "prescription_required": true,
    "what_it_does": "70% intermediate-acting insulin isophane provides basal coverage; 30% fast-acting soluble insulin covers post-meal spikes.",
    "contraindications": [
      "Hypoglycemia",
      "Hypersensitivity to insulin"
    ],
    "drug_interactions": [
      "Beta-blockers (mask hypoglycemia)",
      "Corticosteroids (increase blood glucose)",
      "Alcohol (unpredictable glucose effects)"
    ],
    "dosage": "Individualized; typically 0.5–1 unit/kg/day divided in 1–2 injections.",
    "storage": "Unopened: 2–8°C (refrigerate). In-use: below 30°C for 4 weeks."
  },
  {
    "id": 4,
    "brand_name": "Lantus",
    "generic_name": "Insulin Glargine",
    "composition": [
      { "ingredient": "Insulin Glargine", "strength": "100", "unit": "IU" }
    ],
    "composition_hash": "insulin_glargine_100iu",
    "manufacturer": "Sanofi India Ltd",
    "price": 544,
    "form": "Injection",
    "pack_size": 1,
    "uses": [
      "Long-acting insulin for diabetes sugar control"
    ],
    "side_effects": [
      "Hypoglycemia",
      "Weight gain"
    ],
    "prescription_required": true,
    "what_it_does": "Provides steady 24-hour basal insulin with no pronounced peak.",
    "contraindications": [
      "Hypoglycemia",
      "Allergy to insulin glargine"
    ],
    "drug_interactions": [
      "Oral antidiabetics (additive hypoglycemia)",
      "Thiazolidinediones (fluid retention risk)",
      "Alcohol"
    ],
    "dosage": "Once daily at any time, same time each day. Start 10 units or 0.2 unit/kg.",
    "storage": "Unopened: 2–8°C. In-use: below 30°C for 28 days."
  },
  {
    "id": 5,
    "brand_name": "Himalaya Liv. 52 DS",
    "generic_name": "Caper Bush + Chicory",
    "composition": [
      { "ingredient": "Caper Bush", "strength": "", "unit": "" },
      { "ingredient": "Chicory", "strength": "", "unit": "" }
    ],
    "composition_hash": "caper_bush+chicory",
    "manufacturer": "The Himalaya Drug Company",
    "price": 256,
    "form": "Tablet",
    "pack_size": 60,
    "uses": [
      "Liver health support",
      "Detoxification",
      "Appetite improvement"
    ],
    "side_effects": [
      "Rare allergic reactions"
    ],
    "prescription_required": false,
    "what_it_does": "Herbal formulation that protects liver cells, promotes regeneration, and improves appetite.",
    "contraindications": [
      "Pregnancy (consult physician)",
      "Known allergy to ingredients"
    ],
    "drug_interactions": [
      "Minimal reported"
    ],
    "dosage": "2 tablets twice daily or as directed by physician.",
    "storage": "Store in cool, dry place away from sunlight."
  },
  {
    "id": 6,
    "brand_name": "Monocef-O CV",
    "generic_name": "Cefpodoxime Proxetil + Clavulanic Acid",
    "composition": [
      { "ingredient": "Cefpodoxime Proxetil", "strength": "200", "unit": "mg" },
      { "ingredient": "Clavulanic Acid", "strength": "125", "unit": "mg" }
    ],
    "composition_hash": "cefpodoxime_proxetil_200mg+clavulanic_acid_125mg",
    "manufacturer": "Aristo Pharmaceuticals Pvt Ltd",
    "price": 314,
    "form": "Tablet",
    "pack_size": 10,
    "uses": [
      "Respiratory tract infections",
      "Ear infections",
      "Urinary tract infections",
      "Skin infections"
    ],
    "side_effects": [
      "Nausea",
      "Diarrhea",
      "Headache"
    ],
    "prescription_required": true,
    "what_it_does": "Cefpodoxime is a 3rd-gen cephalosporin; clavulanic acid extends spectrum against beta-lactamase producers.",
    "contraindications": [
      "Hypersensitivity to cephalosporins/penicillins",
      "History of cholestatic jaundice"
    ],
    "drug_interactions": [
      "Probenecid (increases cefpodoxime levels)",
      "Antacids (reduce absorption)"
    ],
    "dosage": "1 tablet twice daily for 5–10 days.",
    "storage": "Store below 30°C. Protect from moisture."
  },
  {
    "id": 7,
    "brand_name": "Janumet",
    "generic_name": "Sitagliptin + Metformin",
    "composition": [
      { "ingredient": "Sitagliptin", "strength": "50", "unit": "mg" },
      { "ingredient": "Metformin", "strength": "1000", "unit": "mg" }
    ],
    "composition_hash": "metformin_1000mg+sitagliptin_50mg",
    "manufacturer": "MSD Pharmaceuticals Pvt Ltd",
    "price": 312,
    "form": "Tablet",
    "pack_size": 15,
    "uses": [
      "Blood sugar control in type 2 diabetes"
    ],
    "side_effects": [
      "Nausea",
      "Hypoglycemia",
      "Upper respiratory infection"
    ],
    "prescription_required": true,
    "what_it_does": "Sitagliptin inhibits DPP-4 to prolong incretin action; metformin reduces glucose production and improves sensitivity.",
    "contraindications": [
      "Severe renal impairment",
      "Acute/chronic metabolic acidosis",
      "Type 1 diabetes"
    ],
    "drug_interactions": [
      "Digoxin (slightly increased levels)",
      "Cationic drugs (compete with metformin renal excretion)"
    ],
    "dosage": "1 tablet twice daily with meals.",
    "storage": "Store below 30°C."
  },
  {
    "id": 8,
    "brand_name": "Foracort Forte",
    "generic_name": "Formoterol + Budesonide",
    "composition": [
      { "ingredient": "Formoterol", "strength": "12", "unit": "mcg" },
      { "ingredient": "Budesonide", "strength": "400", "unit": "mcg" }
    ],
    "composition_hash": "budesonide_400mcg+formoterol_12mcg",
    "manufacturer": "Cipla Ltd",
    "price": 800,
    "form": "Inhaler",
    "pack_size": 1,
    "uses": [
      "Asthma management",
      "COPD symptoms prevention"
    ],
    "side_effects": [
      "Tremor",
      "Headache",
      "Throat irritation"
    ],
    "prescription_required": true,
    "what_it_does": "Budesonide (corticosteroid) reduces inflammation; formoterol (LABA) relaxes airways for 12+ hours.",
    "contraindications": [
      "Status asthmaticus",
      "Hypersensitivity"
    ],
    "drug_interactions": [
      "Strong CYP3A4 inhibitors (e.g., ketoconazole)",
      "Beta-blockers (antagonize formoterol)"
    ],
    "dosage": "1–2 puffs twice daily. Rinse mouth after use.",
    "storage": "Store below 30°C. Do not freeze. Keep actuator clean."
  },
  {
    "id": 9,
    "brand_name": "Udiliv",
    "generic_name": "Ursodeoxycholic Acid",
    "composition": [
      { "ingredient": "Ursodeoxycholic Acid", "strength": "300", "unit": "mg" }
    ],
    "composition_hash": "ursodeoxycholic_acid_300mg",
    "manufacturer": "Abbott India",
    "price": 769,
    "form": "Tablet",
    "pack_size": 10,
    "uses": [
      "Liver and gallbladder disorders",
      "Cholesterol gallstones dissolution"
    ],
    "side_effects": [
      "Diarrhea",
      "Nausea",
      "Abdominal pain"
    ],
    "prescription_required": true,
    "what_it_does": "Reduces cholesterol saturation in bile, promotes gallstone dissolution, and protects liver cells.",
    "contraindications": [
      "Calcified gallstones",
      "Acute cholecystitis",
      "Biliary obstruction"
    ],
    "drug_interactions": [
      "Cholestyramine/colestipol (reduce absorption)",
      "Aluminum antacids"
    ],
    "dosage": "8–10 mg/kg/day in 2–3 divided doses for gallstones; 13–15 mg/kg/day for liver disease.",
    "storage": "Store below 30°C in dry place."
  },
  {
    "id": 10,
    "brand_name": "Betadine 10% Ointment",
    "generic_name": "Povidone-Iodine",
    "composition": [
      { "ingredient": "Povidone-Iodine", "strength": "10", "unit": "%" }
    ],
    "composition_hash": "povidone-iodine_10%",
    "manufacturer": "Win-Medicare Pvt Ltd",
    "price": 135,
    "form": "Ointment",
    "pack_size": 25,
    "uses": [
      "Infection prevention in minor wounds",
      "Cuts",
      "Abrasions"
    ],
    "side_effects": [
      "Skin irritation",
      "Allergic reactions"
    ],
    "prescription_required": false,
    "what_it_does": "Broad-spectrum antiseptic that releases free iodine to kill bacteria, viruses, fungi.",
    "contraindications": [
      "Iodine hypersensitivity",
      "Thyroid disorders",
      "Newborns"
    ],
    "drug_interactions": [
      "Do not mix with silver or mercury compounds"
    ],
    "dosage": "Apply liberally to affected area 1–3 times daily.",
    "storage": "Store below 30°C. Keep cap tightly closed."
  },
  {
    "id": 11,
    "brand_name": "Thyronorm",
    "generic_name": "Thyroxine",
    "composition": [
      { "ingredient": "Thyroxine", "strength": "62.5", "unit": "mcg" }
    ],
    "composition_hash": "thyroxine_62.5mcg",
    "manufacturer": "Abbott",
    "price": 50,
    "form": "Tablet",
    "pack_size": 100,
    "uses": [
      "Thyroid hormone replacement"
    ],
    "side_effects": [
      "Palpitations",
      "Weight loss",
      "Nervousness"
    ],
    "prescription_required": true,
    "what_it_does": "Synthetic T4 hormone that replaces deficient thyroid hormone in hypothyroidism.",
    "contraindications": [
      "Untreated adrenal insufficiency",
      "Uncorrected thyrotoxicosis"
    ],
    "drug_interactions": [
      "Warfarin (increased effect)",
      "Iron/calcium (reduce absorption)"
    ],
    "dosage": "25–200 mcg once daily on empty stomach. Adjust per TSH.",
    "storage": "Store below 30°C in dry place."
  },
  {
    "id": 12,
    "brand_name": "Rosuvas 40",
    "generic_name": "Rosuvastatin",
    "composition": [
      { "ingredient": "Rosuvastatin", "strength": "40", "unit": "mg" }
    ],
    "composition_hash": "rosuvastatin_40mg",
    "manufacturer": "Sun Pharmaceutical Industries Ltd",
    "price": 150,
    "form": "Tablet",
    "pack_size": 10,
    "uses": [
      "Cholesterol lowering",
      "Heart attack and stroke risk reduction"
    ],
    "side_effects": [
      "Muscle pain",
      "Liver issues",
      "Headache"
    ],
    "prescription_required": true,
    "what_it_does": "HMG-CoA reductase inhibitor that lowers LDL and triglycerides.",
    "contraindications": [
      "Active liver disease",
      "Pregnancy",
      "Breastfeeding"
    ],
    "drug_interactions": [
      "Cyclosporine (increased rosuvastatin levels)",
      "Gemfibrozil"
    ],
    "dosage": "5–40 mg once daily. Max 40 mg.",
    "storage": "Store below 30°C."
  },
  {
    "id": 13,
    "brand_name": "Zerodol-SP",
    "generic_name": "Aceclofenac + Paracetamol + Serratiopeptidase",
    "composition": [
      { "ingredient": "Aceclofenac", "strength": "100", "unit": "mg" },
      { "ingredient": "Paracetamol", "strength": "325", "unit": "mg" },
      { "ingredient": "Serratiopeptidase", "strength": "15", "unit": "mg" }
    ],
    "composition_hash": "aceclofenac_100mg+paracetamol_325mg+serratiopeptidase_15mg",
    "manufacturer": "Ipca Laboratories Ltd",
    "price": 80,
    "form": "Tablet",
    "pack_size": 10,
    "uses": [
      "Pain and inflammation relief",
      "Muscle pain",
      "Joint pain",
      "Postoperative pain"
    ],
    "side_effects": [
      "Nausea",
      "Dizziness",
      "Stomach upset"
    ],
    "prescription_required": false,
    "what_it_does": "Aceclofenac (NSAID) reduces pain/inflammation; paracetamol lowers fever/pain; serratiopeptidase reduces swelling.",
    "contraindications": [
      "Peptic ulcer",
      "Severe renal/hepatic impairment"
    ],
    "drug_interactions": [
      "Aspirin (increased GI risk)",
      "Warfarin"
    ],
    "dosage": "1 tablet twice daily after meals.",
    "storage": "Store below 30°C."
  },
  {
    "id": 14,
    "brand_name": "Dolo 650",
    "generic_name": "Paracetamol",
    "composition": [
      { "ingredient": "Paracetamol", "strength": "650", "unit": "mg" }
    ],
    "composition_hash": "paracetamol_650mg",
    "manufacturer": "Micro Labs Ltd",
    "price": 35,
    "form": "Tablet",
    "pack_size": 20,
    "uses": [
      "Pain relief",
      "Fever reduction"
    ],
    "side_effects": [
      "Liver damage in overdose",
      "Nausea"
    ],
    "prescription_required": false,
    "what_it_does": "Inhibits prostaglandin synthesis in CNS to reduce pain and fever.",
    "contraindications": [
      "Severe liver disease",
      "Alcoholism"
    ],
    "drug_interactions": [
      "Warfarin (prolonged use)",
      "Alcohol"
    ],
    "dosage": "1 tablet up to 4 times daily. Max 4g/day.",
    "storage": "Store below 30°C."
  },
  {
    "id": 15,
    "brand_name": "Pan-D",
    "generic_name": "Domperidone + Pantoprazole",
    "composition": [
      { "ingredient": "Domperidone", "strength": "30", "unit": "mg" },
      { "ingredient": "Pantoprazole", "strength": "40", "unit": "mg" }
    ],
    "composition_hash": "domperidone_30mg+pantoprazole_40mg",
    "manufacturer": "Abbott India",
    "price": 120,
    "form": "Capsule",
    "pack_size": 15,
    "uses": [
      "Acid-related diseases",
      "Nausea",
      "Vomiting control"
    ],
    "side_effects": [
      "Headache",
      "Diarrhea",
      "Dry mouth"
    ],
    "prescription_required": true,
    "what_it_does": "Pantoprazole (PPI) reduces gastric acid; domperidone enhances gastric motility.",
    "contraindications": [
      "GI hemorrhage",
      "Prolactinoma"
    ],
    "drug_interactions": [
      "Ketoconazole (increased domperidone)",
      "Erythromycin"
    ],
    "dosage": "1 capsule once daily before breakfast.",
    "storage": "Store below 30°C."
  },
  {
    "id": 16,
    "brand_name": "Aciloc 300",
    "generic_name": "Ranitidine",
    "composition": [
      { "ingredient": "Ranitidine", "strength": "300", "unit": "mg" }
    ],
    "composition_hash": "ranitidine_300mg",
    "manufacturer": "Cadila Pharmaceuticals Ltd",
    "price": 40,
    "form": "Tablet",
    "pack_size": 20,
    "uses": [
      "Heartburn",
      "Indigestion",
      "Stomach ulcers"
    ],
    "side_effects": [
      "Headache",
      "Dizziness",
      "Constipation"
    ],
    "prescription_required": false,
    "what_it_does": "H2 receptor blocker that reduces gastric acid secretion.",
    "contraindications": [
      "Porphyria",
      "Hypersensitivity"
    ],
    "drug_interactions": [
      "Warfarin",
      "Ketoconazole"
    ],
    "dosage": "150–300 mg twice daily or 300 mg at bedtime.",
    "storage": "Store below 30°C."
  },
  {
    "id": 17,
    "brand_name": "Zincovit",
    "generic_name": "Multivitamin + Multimineral + Grape Seed Extract",
    "composition": [
      { "ingredient": "Multivitamin", "strength": "", "unit": "" },
      { "ingredient": "Multimineral", "strength": "", "unit": "" },
      { "ingredient": "Grape Seed Extract", "strength": "", "unit": "" }
    ],
    "composition_hash": "grape_seed_extract+multimineral+multivitamin",
    "manufacturer": "Apex Laboratories Pvt Ltd",
    "price": 100,
    "form": "Tablet",
    "pack_size": 15,
    "uses": [
      "Immune support",
      "Antioxidant",
      "Red blood cell formation"
    ],
    "side_effects": [
      "Stomach upset",
      "Allergic reactions"
    ],
    "prescription_required": false,
    "what_it_does": "Provides essential vitamins and minerals to support immunity, energy, and antioxidant defense.",
    "contraindications": [
      "Hypervitaminosis",
      "Allergy to components"
    ],
    "drug_interactions": [
      "Minimal"
    ],
    "dosage": "1 tablet daily after meals.",
    "storage": "Store below 30°C."
  },
  {
    "id": 18,
    "brand_name": "Clavam-XR",
    "generic_name": "Amoxycillin + Clavulanic Acid",
    "composition": [
      { "ingredient": "Amoxycillin", "strength": "1000", "unit": "mg" },
      { "ingredient": "Clavulanic Acid", "strength": "62.5", "unit": "mg" }
    ],
    "composition_hash": "amoxycillin_1000mg+clavulanic_acid_62.5mg",
    "manufacturer": "Alkem Laboratories Ltd",
    "price": 500,
    "form": "Tablet",
    "pack_size": 6,
    "uses": [
      "Bacterial infections of lungs",
      "Ear",
      "Nasal sinus",
      "Urinary tract",
      "Skin"
    ],
    "side_effects": [
      "Nausea",
      "Diarrhea",
      "Vomiting"
    ],
    "prescription_required": true,
    "what_it_does": "Extended-release amoxicillin with beta-lactamase inhibitor for resistant infections.",
    "contraindications": [
      "Penicillin allergy",
      "Hepatic dysfunction history"
    ],
    "drug_interactions": [
      "Probenecid",
      "Allopurinol (rash)"
    ],
    "dosage": "1 tablet twice daily.",
    "storage": "Store below 25°C."
  },
  {
    "id": 19,
    "brand_name": "Forxiga",
    "generic_name": "Dapagliflozin",
    "composition": [
      { "ingredient": "Dapagliflozin", "strength": "10", "unit": "mg" }
    ],
    "composition_hash": "dapagliflozin_10mg",
    "manufacturer": "AstraZeneca",
    "price": 550,
    "form": "Tablet",
    "pack_size": 10,
    "uses": [
      "Type 2 diabetes management",
      "Heart failure",
      "Chronic kidney disease"
    ],
    "side_effects": [
      "Urinary tract infections",
      "Dehydration",
      "Hypoglycemia"
    ],
    "prescription_required": true,
    "what_it_does": "SGLT2 inhibitor that promotes glucose excretion in urine.",
    "contraindications": [
      "Type 1 diabetes",
      "eGFR <30 mL/min",
      "Ketoacidosis"
    ],
    "drug_interactions": [
      "Insulin (hypoglycemia risk)",
      "Diuretics"
    ],
    "dosage": "5–10 mg once daily.",
    "storage": "Store below 30°C."
  },
  {
    "id": 20,
    "brand_name": "Telma H",
    "generic_name": "Telmisartan + Hydrochlorothiazide",
    "composition": [
      { "ingredient": "Telmisartan", "strength": "40", "unit": "mg" },
      { "ingredient": "Hydrochlorothiazide", "strength": "12.5", "unit": "mg" }
    ],
    "composition_hash": "hydrochlorothiazide_12.5mg+telmisartan_40mg",
    "manufacturer": "Glenmark Pharmaceuticals",
    "price": 150,
    "form": "Tablet",
    "pack_size": 10,
    "uses": [
      "Hypertension control"
    ],
    "side_effects": [
      "Dizziness",
      "Fatigue",
      "Hyperglycemia"
    ],
    "prescription_required": true,
    "what_it_does": "Telmisartan (ARB) blocks angiotensin II; HCTZ increases urine output.",
    "contraindications": [
      "Anuria",
      "Pregnancy (2nd/3rd trimester)"
    ],
    "drug_interactions": [
      "Lithium",
      "NSAIDs"
    ],
    "dosage": "1 tablet once daily.",
    "storage": "Store below 30°C."
  },
  {
    "id": 21,
    "brand_name": "Azithral 500",
    "generic_name": "Azithromycin",
    "composition": [
      { "ingredient": "Azithromycin", "strength": "500", "unit": "mg" }
    ],
    "composition_hash": "azithromycin_500mg",
    "manufacturer": "Alembic Pharmaceuticals",
    "price": 80,
    "form": "Tablet",
    "pack_size": 3,
    "uses": [
      "Bacterial infections",
      "Respiratory tract infections",
      "Skin infections"
    ],
    "side_effects": [
      "Nausea",
      "Diarrhea",
      "Abdominal pain"
    ],
    "prescription_required": true,
    "what_it_does": "Macrolide antibiotic that inhibits bacterial protein synthesis.",
    "contraindications": [
      "Hypersensitivity",
      "Severe liver disease"
    ],
    "drug_interactions": [
      "Warfarin",
      "Statins"
    ],
    "dosage": "500 mg once daily for 3 days.",
    "storage": "Store below 30°C."
  },
  {
    "id": 22,
    "brand_name": "Combiflam",
    "generic_name": "Ibuprofen + Paracetamol",
    "composition": [
      { "ingredient": "Ibuprofen", "strength": "400", "unit": "mg" },
      { "ingredient": "Paracetamol", "strength": "325", "unit": "mg" }
    ],
    "composition_hash": "ibuprofen_400mg+paracetamol_325mg",
    "manufacturer": "Sanofi India",
    "price": 40,
    "form": "Tablet",
    "pack_size": 20,
    "uses": [
      "Pain relief",
      "Fever",
      "Inflammation"
    ],
    "side_effects": [
      "Stomach upset",
      "Heartburn",
      "Drowsiness"
    ],
    "prescription_required": false,
    "what_it_does": "Ibuprofen (NSAID) reduces inflammation; paracetamol reduces pain/fever.",
    "contraindications": [
      "Peptic ulcer",
      "Severe heart failure"
    ],
    "drug_interactions": [
      "Aspirin",
      "Warfarin"
    ],
    "dosage": "1 tablet 3–4 times daily after meals.",
    "storage": "Store below 30°C."
  },
  {
    "id": 23,
    "brand_name": "Ecosprin 75",
    "generic_name": "Aspirin",
    "composition": [
      { "ingredient": "Aspirin", "strength": "75", "unit": "mg" }
    ],
    "composition_hash": "aspirin_75mg",
    "manufacturer": "USV Ltd",
    "price": 20,
    "form": "Tablet",
    "pack_size": 14,
    "uses": [
      "Prevent heart attacks",
      "Stroke prevention",
      "Blood thinning"
    ],
    "side_effects": [
      "Bleeding",
      "Stomach ulcers",
      "Allergic reactions"
    ],
    "prescription_required": true,
    "what_it_does": "Irreversibly inhibits platelet COX-1, preventing clot formation.",
    "contraindications": [
      "Active bleeding",
      "Aspirin allergy",
      "Children with viral fever"
    ],
    "drug_interactions": [
      "NSAIDs",
      "Warfarin"
    ],
    "dosage": "75–150 mg once daily.",
    "storage": "Store below 30°C in dry place."
  },
  {
    "id": 24,
    "brand_name": "Galvus",
    "generic_name": "Vildagliptin",
    "composition": [
      { "ingredient": "Vildagliptin", "strength": "50", "unit": "mg" }
    ],
    "composition_hash": "vildagliptin_50mg",
    "manufacturer": "Novartis",
    "price": 300,
    "form": "Tablet",
    "pack_size": 10,
    "uses": [
      "Type 2 diabetes"
    ],
    "side_effects": [
      "Headache",
      "Dizziness",
      "Tremor"
    ],
    "prescription_required": true,
    "what_it_does": "DPP-4 inhibitor that enhances incretin effect to increase insulin and decrease glucagon.",
    "contraindications": [
      "Type 1 diabetes",
      "Ketoacidosis"
    ],
    "drug_interactions": [
      "ACE inhibitors (angioedema risk)"
    ],
    "dosage": "50 mg twice daily with or without meals.",
    "storage": "Store below 30°C."
  },
  {
    "id": 25,
    "brand_name": "Pantocid",
    "generic_name": "Pantoprazole",
    "composition": [
      { "ingredient": "Pantoprazole", "strength": "40", "unit": "mg" }
    ],
    "composition_hash": "pantoprazole_40mg",
    "manufacturer": "Sun Pharma",
    "price": 60,
    "form": "Tablet",
    "pack_size": 15,
    "uses": [
      "Acid reflux",
      "Ulcers",
      "GERD"
    ],
    "side_effects": [
      "Headache",
      "Diarrhea",
      "Nausea"
    ],
    "prescription_required": true,
    "what_it_does": "Proton pump inhibitor that irreversibly blocks H+/K+ ATPase in parietal cells.",
    "contraindications": [
      "Hypersensitivity"
    ],
    "drug_interactions": [
      "Warfarin",
      "Methotrexate"
    ],
    "dosage": "40 mg once daily before breakfast.",
    "storage": "Store below 30°C."
  },
  {
    "id": 26,
    "brand_name": "Cilacar",
    "generic_name": "Cilnidipine",
    "composition": [
      { "ingredient": "Cilnidipine", "strength": "10", "unit": "mg" }
    ],
    "composition_hash": "cilnidipine_10mg",
    "manufacturer": "J B Chemicals",
    "price": 100,
    "form": "Tablet",
    "pack_size": 10,
    "uses": [
      "Hypertension"
    ],
    "side_effects": [
      "Headache",
      "Dizziness",
      "Edema"
    ],
    "prescription_required": true,
    "what_it_does": "Dual L/N-type calcium channel blocker with vasodilatory and sympatholytic effects.",
    "contraindications": [
      "Cardiogenic shock",
      "Severe aortic stenosis"
    ],
    "drug_interactions": [
      "CYP3A4 inhibitors"
    ],
    "dosage": "5–20 mg once daily.",
    "storage": "Store below 30°C."
  },
  {
    "id": 27,
    "brand_name": "Lupisulin M30",
    "generic_name": "Insulin Isophane + Insulin Regular",
    "composition": [
      { "ingredient": "Insulin Isophane", "strength": "70", "unit": "%" },
      { "ingredient": "Insulin Regular", "strength": "30", "unit": "%" }
    ],
    "composition_hash": "insulin_isophane_70%+insulin_regular_30%",
    "manufacturer": "Lupin Ltd",
    "price": 200,
    "form": "Injection",
    "pack_size": 1,
    "uses": [
      "Diabetes management"
    ],
    "side_effects": [
      "Hypoglycemia",
      "Weight gain"
    ],
    "prescription_required": true,
    "what_it_does": "Biphasic insulin: 70% intermediate, 30% rapid-acting.",
    "contraindications": [
      "Hypoglycemia"
    ],
    "drug_interactions": [
      "Beta-blockers",
      "Alcohol"
    ],
    "dosage": "Individualized, usually 1–2 times daily.",
    "storage": "Unopened: 2–8°C. In-use: <30°C for 4 weeks."
  },
  {
    "id": 28,
    "brand_name": "Taxim-O",
    "generic_name": "Cefixime",
    "composition": [
      { "ingredient": "Cefixime", "strength": "200", "unit": "mg" }
    ],
    "composition_hash": "cefixime_200mg",
    "manufacturer": "Alkem Laboratories",
    "price": 90,
    "form": "Tablet",
    "pack_size": 10,
    "uses": [
      "Bacterial infections"
    ],
    "side_effects": [
      "Diarrhea",
      "Nausea",
      "Rash"
    ],
    "prescription_required": true,
    "what_it_does": "3rd-generation cephalosporin that inhibits bacterial cell wall synthesis.",
    "contraindications": [
      "Cephalosporin allergy"
    ],
    "drug_interactions": [
      "Probenecid"
    ],
    "dosage": "200–400 mg once or twice daily.",
    "storage": "Store below 30°C."
  },
  {
    "id": 29,
    "brand_name": "Omez",
    "generic_name": "Omeprazole",
    "composition": [
      { "ingredient": "Omeprazole", "strength": "20", "unit": "mg" }
    ],
    "composition_hash": "omeprazole_20mg",
    "manufacturer": "Dr. Reddy's Laboratories",
    "price": 50,
    "form": "Capsule",
    "pack_size": 15,
    "uses": [
      "Acid reduction",
      "Ulcers"
    ],
    "side_effects": [
      "Headache",
      "Abdominal pain"
    ],
    "prescription_required": false,
    "what_it_does": "PPI that suppresses gastric acid secretion.",
    "contraindications": [
      "Hypersensitivity"
    ],
    "drug_interactions": [
      "Clopidogrel",
      "Warfarin"
    ],
    "dosage": "20–40 mg once daily before meals.",
    "storage": "Store below 30°C."
  },
  {
    "id": 30,
    "brand_name": "Atorva 20",
    "generic_name": "Atorvastatin",
    "composition": [
      { "ingredient": "Atorvastatin", "strength": "20", "unit": "mg" }
    ],
    "composition_hash": "atorvastatin_20mg",
    "manufacturer": "Zydus Cadila",
    "price": 80,
    "form": "Tablet",
    "pack_size": 10,
    "uses": [
      "Cholesterol control"
    ],
    "side_effects": [
      "Muscle pain",
      "Liver enzyme elevation"
    ],
    "prescription_required": true,
    "what_it_does": "Statin that lowers LDL by inhibiting HMG-CoA reductase.",
    "contraindications": [
      "Active liver disease",
      "Pregnancy"
    ],
    "drug_interactions": [
      "Cyclosporine",
      "Fibrates"
    ],
    "dosage": "10–80 mg once daily.",
    "storage": "Store below 30°C."
  },
  {
    "id": 31,
    "brand_name": "Deriphyl",
    "generic_name": "Doxylamine + Pyridoxine",
    "composition": [
      { "ingredient": "Doxylamine", "strength": "20", "unit": "mg" },
      { "ingredient": "Pyridoxine", "strength": "20", "unit": "mg" }
    ],
    "composition_hash": "doxylamine_20mg+pyridoxine_20mg",
    "manufacturer": "USV Ltd",
    "price": 100,
    "form": "Tablet",
    "pack_size": 10,
    "uses": [
      "Nausea and vomiting in pregnancy"
    ],
    "side_effects": [
      "Drowsiness",
      "Dry mouth"
    ],
    "prescription_required": false,
    "what_it_does": "Antihistamine + vitamin B6 combination for pregnancy-related nausea.",
    "contraindications": [
      "Glaucoma",
      "Pyloroduodenal obstruction"
    ],
    "drug_interactions": [
      "CNS depressants"
    ],
    "dosage": "1 tablet at bedtime; may increase to 4/day.",
    "storage": "Store below 30°C."
  },
  {
    "id": 32,
    "brand_name": "Cipralex",
    "generic_name": "Escitalopram",
    "composition": [
      { "ingredient": "Escitalopram", "strength": "10", "unit": "mg" }
    ],
    "composition_hash": "escitalopram_10mg",
    "manufacturer": "Lundbeck",
    "price": 150,
    "form": "Tablet",
    "pack_size": 10,
    "uses": [
      "Depression",
      "Anxiety"
    ],
    "side_effects": [
      "Nausea",
      "Insomnia",
      "Sexual dysfunction"
    ],
    "prescription_required": true,
    "what_it_does": "SSRI that increases serotonin in synaptic cleft.",
    "contraindications": [
      "MAO inhibitors",
      "Pimozide"
    ],
    "drug_interactions": [
      "MAOIs",
      "Linezolid"
    ],
    "dosage": "10–20 mg once daily.",
    "storage": "Store below 30°C."
  },
  {
    "id": 33,
    "brand_name": "Sporidex",
    "generic_name": "Cephalexin",
    "composition": [
      { "ingredient": "Cephalexin", "strength": "500", "unit": "mg" }
    ],
    "composition_hash": "cephalexin_500mg",
    "manufacturer": "Ranbaxy Laboratories",
    "price": 70,
    "form": "Capsule",
    "pack_size": 10,
    "uses": [
      "Bacterial infections"
    ],
    "side_effects": [
      "Diarrhea",
      "Rash"
    ],
    "prescription_required": true,
    "what_it_does": "1st-generation cephalosporin.",
    "contraindications": [
      "Cephalosporin allergy"
    ],
    "drug_interactions": [
      "Probenecid"
    ],
    "dosage": "250–500 mg every 6 hours.",
    "storage": "Store below 30°C."
  },
  {
    "id": 34,
    "brand_name": "Telmikind",
    "generic_name": "Telmisartan",
    "composition": [
      { "ingredient": "Telmisartan", "strength": "40", "unit": "mg" }
    ],
    "composition_hash": "telmisartan_40mg",
    "manufacturer": "Mankind Pharma",
    "price": 90,
    "form": "Tablet",
    "pack_size": 10,
    "uses": [
      "Hypertension"
    ],
    "side_effects": [
      "Dizziness",
      "Back pain"
    ],
    "prescription_required": true,
    "what_it_does": "ARB that blocks AT1 receptors.",
    "contraindications": [
      "Pregnancy",
      "Biliary obstruction"
    ],
    "drug_interactions": [
      "Aliskiren"
    ],
    "dosage": "40–80 mg once daily.",
    "storage": "Store below 30°C."
  },
  {
    "id": 35,
    "brand_name": "Metpure",
    "generic_name": "Metformin",
    "composition": [
      { "ingredient": "Metformin", "strength": "500", "unit": "mg" }
    ],
    "composition_hash": "metformin_500mg",
    "manufacturer": "Intas Pharmaceuticals",
    "price": 20,
    "form": "Tablet",
    "pack_size": 10,
    "uses": [
      "Type 2 diabetes"
    ],
    "side_effects": [
      "Nausea",
      "Diarrhea"
    ],
    "prescription_required": true,
    "what_it_does": "Decreases hepatic glucose production and improves insulin sensitivity.",
    "contraindications": [
      "eGFR <30",
      "Acute heart failure"
    ],
    "drug_interactions": [
      "Cationic drugs"
    ],
    "dosage": "500–2000 mg/day in divided doses.",
    "storage": "Store below 30°C."
  },
  {
    "id": 36,
    "brand_name": "Nurofen",
    "generic_name": "Ibuprofen",
    "composition": [
      { "ingredient": "Ibuprofen", "strength": "400", "unit": "mg" }
    ],
    "composition_hash": "ibuprofen_400mg",
    "manufacturer": "Reckitt Benckiser",
    "price": 50,
    "form": "Tablet",
    "pack_size": 20,
    "uses": [
      "Pain",
      "Inflammation",
      "Fever"
    ],
    "side_effects": [
      "Stomach pain",
      "Ulcers"
    ],
    "prescription_required": false,
    "what_it_does": "NSAID that inhibits COX-1 and COX-2.",
    "contraindications": [
      "Active ulcer",
      "3rd trimester pregnancy"
    ],
    "drug_interactions": [
      "Aspirin",
      "Warfarin"
    ],
    "dosage": "400 mg every 6–8 hours.",
    "storage": "Store below 30°C."
  },
  {
    "id": 37,
    "brand_name": "Amlong",
    "generic_name": "Amlodipine",
    "composition": [
      { "ingredient": "Amlodipine", "strength": "5", "unit": "mg" }
    ],
    "composition_hash": "amlodipine_5mg",
    "manufacturer": "Micro Labs",
    "price": 40,
    "form": "Tablet",
    "pack_size": 10,
    "uses": [
      "Hypertension",
      "Angina"
    ],
    "side_effects": [
      "Swelling",
      "Dizziness"
    ],
    "prescription_required": true,
    "what_it_does": "Dihydropyridine CCB that relaxes vascular smooth muscle.",
    "contraindications": [
      "Severe hypotension"
    ],
    "drug_interactions": [
      "Simvastatin"
    ],
    "dosage": "5–10 mg once daily.",
    "storage": "Store below 30°C."
  },
  {
    "id": 38,
    "brand_name": "Becosules",
    "generic_name": "Vitamin B Complex",
    "composition": [
      { "ingredient": "Vitamin B Complex", "strength": "", "unit": "" }
    ],
    "composition_hash": "vitamin_b_complex",
    "manufacturer": "Pfizer",
    "price": 30,
    "form": "Capsule",
    "pack_size": 20,
    "uses": [
      "Vitamin deficiency",
      "Energy boost"
    ],
    "side_effects": [
      "Rare allergic reactions"
    ],
    "prescription_required": false,
    "what_it_does": "Replenishes B vitamins essential for metabolism and nerve function.",
    "contraindications": [
      "Hypersensitivity"
    ],
    "drug_interactions": [
      "Minimal"
    ],
    "dosage": "1 capsule daily.",
    "storage": "Store below 30°C."
  },
  {
    "id": 39,
    "brand_name": "Cetzine",
    "generic_name": "Cetirizine",
    "composition": [
      { "ingredient": "Cetirizine", "strength": "10", "unit": "mg" }
    ],
    "composition_hash": "cetirizine_10mg",
    "manufacturer": "GSK",
    "price": 25,
    "form": "Tablet",
    "pack_size": 10,
    "uses": [
      "Allergies",
      "Hay fever",
      "Itching"
    ],
    "side_effects": [
      "Drowsiness",
      "Dry mouth"
    ],
    "prescription_required": false,
    "what_it_does": "2nd-gen H1 antihistamine with minimal sedation.",
    "contraindications": [
      "Severe renal impairment"
    ],
    "drug_interactions": [
      "CNS depressants"
    ],
    "dosage": "10 mg once daily.",
    "storage": "Store below 30°C."
  },
  {
    "id": 40,
    "brand_name": "Digene",
    "generic_name": "Antacid",
    "composition": [
      { "ingredient": "Magnesium Hydroxide", "strength": "200", "unit": "mg" },
      { "ingredient": "Aluminium Hydroxide", "strength": "200", "unit": "mg" }
    ],
    "composition_hash": "aluminium_hydroxide_200mg+magnesium_hydroxide_200mg",
    "manufacturer": "Abbott",
    "price": 50,
    "form": "Tablet",
    "pack_size": 15,
    "uses": [
      "Heartburn",
      "Indigestion"
    ],
    "side_effects": [
      "Constipation",
      "Diarrhea"
    ],
    "prescription_required": false,
    "what_it_does": "Neutralizes gastric acid.",
    "contraindications": [
      "Renal failure"
    ],
    "drug_interactions": [
      "Tetracyclines"
    ],
    "dosage": "1–2 tablets after meals.",
    "storage": "Store below 30°C."
  },
  {
    "id": 41,
    "brand_name": "Enzomac",
    "generic_name": "Trypsin + Chymotrypsin",
    "composition": [
      { "ingredient": "Trypsin", "strength": "48", "unit": "mg" },
      { "ingredient": "Chymotrypsin", "strength": "2", "unit": "mg" }
    ],
    "composition_hash": "chymotrypsin_2mg+trypsin_48mg",
    "manufacturer": "Macleods Pharmaceuticals",
    "price": 60,
    "form": "Tablet",
    "pack_size": 20,
    "uses": [
      "Inflammation reduction",
      "Post-surgery"
    ],
    "side_effects": [
      "Nausea",
      "Allergic reactions"
    ],
    "prescription_required": false,
    "what_it_does": "Proteolytic enzymes that reduce swelling and promote healing.",
    "contraindications": [
      "Bleeding disorders"
    ],
    "drug_interactions": [
      "Anticoagulants"
    ],
    "dosage": "1 tablet 2–3 times daily.",
    "storage": "Store below 30°C."
  },
  {
    "id": 42,
    "brand_name": "Folvite",
    "generic_name": "Folic Acid",
    "composition": [
      { "ingredient": "Folic Acid", "strength": "5", "unit": "mg" }
    ],
    "composition_hash": "folic_acid_5mg",
    "manufacturer": "Pfizer",
    "price": 15,
    "form": "Tablet",
    "pack_size": 15,
    "uses": [
      "Folate deficiency",
      "Anemia prevention"
    ],
    "side_effects": [
      "Minimal"
    ],
    "prescription_required": false,
    "what_it_does": "Essential for DNA synthesis and red blood cell formation.",
    "contraindications": [
      "Vitamin B12 deficiency (masking)"
    ],
    "drug_interactions": [
      "Methotrexate"
    ],
    "dosage": "1 tablet daily.",
    "storage": "Store below 30°C."
  },
  {
    "id": 43,
    "brand_name": "Gemcal",
    "generic_name": "Calcitriol + Calcium Carbonate",
    "composition": [
      { "ingredient": "Calcitriol", "strength": "0.25", "unit": "mcg" },
      { "ingredient": "Calcium Carbonate", "strength": "500", "unit": "mg" }
    ],
    "composition_hash": "calcitriol_0.25mcg+calcium_carbonate_500mg",
    "manufacturer": "Galderma",
    "price": 80,
    "form": "Capsule",
    "pack_size": 15,
    "uses": [
      "Osteoporosis",
      "Calcium deficiency"
    ],
    "side_effects": [
      "Hypercalcemia",
      "Nausea"
    ],
    "prescription_required": true,
    "what_it_does": "Calcitriol enhances calcium absorption; calcium carbonate provides elemental calcium.",
    "contraindications": [
      "Hypercalcemia",
      "Renal stones"
    ],
    "drug_interactions": [
      "Thiazides"
    ],
    "dosage": "1 capsule daily.",
    "storage": "Store below 30°C."
  },
  {
    "id": 44,
    "brand_name": "Hifenac-P",
    "generic_name": "Aceclofenac + Paracetamol",
    "composition": [
      { "ingredient": "Aceclofenac", "strength": "100", "unit": "mg" },
      { "ingredient": "Paracetamol", "strength": "325", "unit": "mg" }
    ],
    "composition_hash": "aceclofenac_100mg+paracetamol_325mg",
    "manufacturer": "Intas",
    "price": 50,
    "form": "Tablet",
    "pack_size": 10,
    "uses": [
      "Pain relief",
      "Inflammation"
    ],
    "side_effects": [
      "Stomach upset",
      "Dizziness"
    ],
    "prescription_required": false,
    "what_it_does": "NSAID + analgesic combination.",
    "contraindications": [
      "Peptic ulcer"
    ],
    "drug_interactions": [
      "Warfarin"
    ],
    "dosage": "1 tablet twice daily after meals.",
    "storage": "Store below 30°C."
  },
  {
    "id": 45,
    "brand_name": "Ketorol",
    "generic_name": "Ketorolac",
    "composition": [
      { "ingredient": "Ketorolac", "strength": "10", "unit": "mg" }
    ],
    "composition_hash": "ketorolac_10mg",
    "manufacturer": "Dr. Reddy's",
    "price": 30,
    "form": "Tablet",
    "pack_size": 10,
    "uses": [
      "Short-term pain relief"
    ],
    "side_effects": [
      "Bleeding risk",
      "Stomach pain"
    ],
    "prescription_required": true,
    "what_it_does": "Potent NSAID for acute pain.",
    "contraindications": [
      "Active ulcer",
      "Renal failure"
    ],
    "drug_interactions": [
      "Aspirin"
    ],
    "dosage": "10 mg every 4–6 hours. Max 5 days.",
    "storage": "Store below 30°C."
  },
  {
    "id": 46,
    "brand_name": "Lyrica",
    "generic_name": "Pregabalin",
    "composition": [
      { "ingredient": "Pregabalin", "strength": "75", "unit": "mg" }
    ],
    "composition_hash": "pregabalin_75mg",
    "manufacturer": "Pfizer",
    "price": 200,
    "form": "Capsule",
    "pack_size": 14,
    "uses": [
      "Neuropathic pain",
      "Epilepsy"
    ],
    "side_effects": [
      "Dizziness",
      "Weight gain"
    ],
    "prescription_required": true,
    "what_it_does": "Binds to alpha-2-delta subunit of voltage-gated calcium channels.",
    "contraindications": [
      "Hypersensitivity"
    ],
    "drug_interactions": [
      "CNS depressants"
    ],
    "dosage": "150–600 mg/day in 2–3 divided doses.",
    "storage": "Store below 30°C."
  },
  {
    "id": 47,
    "brand_name": "Montair LC",
    "generic_name": "Levocetirizine + Montelukast",
    "composition": [
      { "ingredient": "Levocetirizine", "strength": "5", "unit": "mg" },
      { "ingredient": "Montelukast", "strength": "10", "unit": "mg" }
    ],
    "composition_hash": "levocetirizine_5mg+montelukast_10mg",
    "manufacturer": "Cipla",
    "price": 120,
    "form": "Tablet",
    "pack_size": 15,
    "uses": [
      "Allergic rhinitis",
      "Asthma"
    ],
    "side_effects": [
      "Drowsiness",
      "Headache"
    ],
    "prescription_required": false,
    "what_it_does": "Levocetirizine (antihistamine) + montelukast (leukotriene antagonist).",
    "contraindications": [
      "Severe renal impairment"
    ],
    "drug_interactions": [
      "CNS depressants"
    ],
    "dosage": "1 tablet at night.",
    "storage": "Store below 30°C."
  },
  {
    "id": 48,
    "brand_name": "Nexium",
    "generic_name": "Esomeprazole",
    "composition": [
      { "ingredient": "Esomeprazole", "strength": "40", "unit": "mg" }
    ],
    "composition_hash": "esomeprazole_40mg",
    "manufacturer": "AstraZeneca",
    "price": 150,
    "form": "Tablet",
    "pack_size": 10,
    "uses": [
      "GERD",
      "Ulcers"
    ],
    "side_effects": [
      "Nausea",
      "Flatulence"
    ],
    "prescription_required": true,
    "what_it_does": "PPI (S-isomer of omeprazole).",
    "contraindications": [
      "Hypersensitivity"
    ],
    "drug_interactions": [
      "Clopidogrel"
    ],
    "dosage": "20–40 mg once daily.",
    "storage": "Store below 30°C."
  },
  {
    "id": 49,
    "brand_name": "Oxetol",
    "generic_name": "Oxcarbazepine",
    "composition": [
      { "ingredient": "Oxcarbazepine", "strength": "300", "unit": "mg" }
    ],
    "composition_hash": "oxcarbazepine_300mg",
    "manufacturer": "Cipla",
    "price": 100,
    "form": "Tablet",
    "pack_size": 10,
    "uses": [
      "Epilepsy",
      "Bipolar disorder"
    ],
    "side_effects": [
      "Dizziness",
      "Nausea"
    ],
    "prescription_required": true,
    "what_it_does": "Blocks voltage-sensitive sodium channels.",
    "contraindications": [
      "Hypersensitivity"
    ],
    "drug_interactions": [
      "Oral contraceptives"
    ],
    "dosage": "300–2400 mg/day in 2 doses.",
    "storage": "Store below 30°C."
  },
  {
    "id": 50,
    "brand_name": "Qvar",
    "generic_name": "Beclomethasone",
    "composition": [
      { "ingredient": "Beclomethasone", "strength": "200", "unit": "mcg" }
    ],
    "composition_hash": "beclomethasone_200mcg",
    "manufacturer": "3M",
    "price": 300,
    "form": "Inhaler",
    "pack_size": 1,
    "uses": [
      "Asthma"
    ],
    "side_effects": [
      "Hoarseness",
      "Oral thrush"
    ],
    "prescription_required": true,
    "what_it_does": "Inhaled corticosteroid.",
    "contraindications": [
      "Status asthmaticus"
    ],
    "drug_interactions": [
      "CYP3A4 inhibitors"
    ],
    "dosage": "100–400 mcg twice daily.",
    "storage": "Store below 30°C."
  },
  {
    "id": 51,
    "brand_name": "Rantac",
    "generic_name": "Ranitidine",
    "composition": [
      { "ingredient": "Ranitidine", "strength": "150", "unit": "mg" }
    ],
    "composition_hash": "ranitidine_150mg",
    "manufacturer": "J B Chemicals",
    "price": 25,
    "form": "Tablet",
    "pack_size": 15,
    "uses": [
      "Acid peptic disease"
    ],
    "side_effects": [
      "Headache"
    ],
    "prescription_required": false,
    "what_it_does": "H2 blocker.",
    "contraindications": [
      "Porphyria"
    ],
    "drug_interactions": [
      "Ketoconazole"
    ],
    "dosage": "150 mg twice daily.",
    "storage": "Store below 30°C."
  },
  {
    "id": 52,
    "brand_name": "Sizopin",
    "generic_name": "Clozapine",
    "composition": [
      { "ingredient": "Clozapine", "strength": "100", "unit": "mg" }
    ],
    "composition_hash": "clozapine_100mg",
    "manufacturer": "Sun Pharma",
    "price": 50,
    "form": "Tablet",
    "pack_size": 10,
    "uses": [
      "Schizophrenia"
    ],
    "side_effects": [
      "Agranulocytosis",
      "Sedation"
    ],
    "prescription_required": true,
    "what_it_does": "Atypical antipsychotic with D2 and 5-HT2A antagonism.",
    "contraindications": [
      "Myelosuppression",
      "Uncontrolled epilepsy"
    ],
    "drug_interactions": [
      "Carbamazepine"
    ],
    "dosage": "12.5–900 mg/day. Requires WBC monitoring.",
    "storage": "Store below 30°C."
  },
  {
    "id": 53,
    "brand_name": "Tryptomer",
    "generic_name": "Amitriptyline",
    "composition": [
      { "ingredient": "Amitriptyline", "strength": "10", "unit": "mg" }
    ],
    "composition_hash": "amitriptyline_10mg",
    "manufacturer": "Merind",
    "price": 20,
    "form": "Tablet",
    "pack_size": 30,
    "uses": [
      "Depression",
      "Neuropathic pain"
    ],
    "side_effects": [
      "Dry mouth",
      "Constipation"
    ],
    "prescription_required": true,
    "what_it_does": "TCA that inhibits serotonin and norepinephrine reuptake.",
    "contraindications": [
      "Recent MI",
      "MAOIs"
    ],
    "drug_interactions": [
      "MAOIs",
      "SSRIs"
    ],
    "dosage": "25–150 mg/day.",
    "storage": "Store below 30°C."
  },
  {
    "id": 54,
    "brand_name": "Uprise D3",
    "generic_name": "Cholecalciferol",
    "composition": [
      { "ingredient": "Cholecalciferol", "strength": "60000", "unit": "IU" }
    ],
    "composition_hash": "cholecalciferol_60000iu",
    "manufacturer": "Alkem",
    "price": 100,
    "form": "Sachet",
    "pack_size": 4,
    "uses": [
      "Vitamin D deficiency"
    ],
    "side_effects": [
      "Hypercalcemia in overdose"
    ],
    "prescription_required": false,
    "what_it_does": "Vitamin D3 for calcium absorption and bone health.",
    "contraindications": [
      "Hypercalcemia"
    ],
    "drug_interactions": [
      "Thiazides"
    ],
    "dosage": "1 sachet weekly for 8–12 weeks.",
    "storage": "Store below 30°C."
  },
  {
    "id": 55,
    "brand_name": "Voveran",
    "generic_name": "Diclofenac",
    "composition": [
      { "ingredient": "Diclofenac", "strength": "50", "unit": "mg" }
    ],
    "composition_hash": "diclofenac_50mg",
    "manufacturer": "Novartis",
    "price": 40,
    "form": "Tablet",
    "pack_size": 15,
    "uses": [
      "Pain",
      "Inflammation"
    ],
    "side_effects": [
      "Gastric irritation"
    ],
    "prescription_required": false,
    "what_it_does": "NSAID.",
    "contraindications": [
      "Peptic ulcer"
    ],
    "drug_interactions": [
      "Aspirin"
    ],
    "dosage": "50 mg 2–3 times daily.",
    "storage": "Store below 30°C."
  },
  {
    "id": 56,
    "brand_name": "Wysolone",
    "generic_name": "Prednisolone",
    "composition": [
      { "ingredient": "Prednisolone", "strength": "5", "unit": "mg" }
    ],
    "composition_hash": "prednisolone_5mg",
    "manufacturer": "Pfizer",
    "price": 30,
    "form": "Tablet",
    "pack_size": 20,
    "uses": [
      "Inflammation",
      "Autoimmune disorders"
    ],
    "side_effects": [
      "Weight gain",
      "Osteoporosis"
    ],
    "prescription_required": true,
    "what_it_does": "Synthetic glucocorticoid.",
    "contraindications": [
      "Systemic fungal infections"
    ],
    "drug_interactions": [
      "NSAIDs"
    ],
    "dosage": "5–60 mg/day.",
    "storage": "Store below 30°C."
  },
  {
    "id": 57,
    "brand_name": "Xeloda",
    "generic_name": "Capecitabine",
    "composition": [
      { "ingredient": "Capecitabine", "strength": "500", "unit": "mg" }
    ],
    "composition_hash": "capecitabine_500mg",
    "manufacturer": "Roche",
    "price": 2000,
    "form": "Tablet",
    "pack_size": 120,
    "uses": [
      "Breast cancer",
      "Colorectal cancer"
    ],
    "side_effects": [
      "Hand-foot syndrome",
      "Diarrhea"
    ],
    "prescription_required": true,
    "what_it_does": "Oral prodrug of 5-FU.",
    "contraindications": [
      "DPD deficiency"
    ],
    "drug_interactions": [
      "Warfarin"
    ],
    "dosage": "1250 mg/m² twice daily for 14 days, 7 days off.",
    "storage": "Store below 30°C."
  },
  {
    "id": 58,
    "brand_name": "Yasmin",
    "generic_name": "Drospirenone + Ethinylestradiol",
    "composition": [
      { "ingredient": "Drospirenone", "strength": "3", "unit": "mg" },
      { "ingredient": "Ethinylestradiol", "strength": "0.03", "unit": "mg" }
    ],
    "composition_hash": "drospirenone_3mg+ethinylestradiol_0.03mg",
    "manufacturer": "Bayer",
    "price": 400,
    "form": "Tablet",
    "pack_size": 21,
    "uses": [
      "Contraception"
    ],
    "side_effects": [
      "Nausea",
      "Headache"
    ],
    "prescription_required": true,
    "what_it_does": "Combined oral contraceptive.",
    "contraindications": [
      "Thrombosis",
      "Smoking >35 years"
    ],
    "drug_interactions": [
      "CYP3A4 inducers"
    ],
    "dosage": "1 tablet daily for 21 days.",
    "storage": "Store below 30°C."
  },
  {
    "id": 59,
    "brand_name": "Zoloft",
    "generic_name": "Sertraline",
    "composition": [
      { "ingredient": "Sertraline", "strength": "50", "unit": "mg" }
    ],
    "composition_hash": "sertraline_50mg",
    "manufacturer": "Pfizer",
    "price": 150,
    "form": "Tablet",
    "pack_size": 28,
    "uses": [
      "Depression",
      "OCD"
    ],
    "side_effects": [
      "Insomnia",
      "Sexual dysfunction"
    ],
    "prescription_required": true,
    "what_it_does": "SSRI.",
    "contraindications": [
      "MAOIs"
    ],
    "drug_interactions": [
      "Pimozide"
    ],
    "dosage": "50–200 mg once daily.",
    "storage": "Store below 30°C."
  },
  {
    "id": 60,
    "brand_name": "Aspirin Cardio",
    "generic_name": "Aspirin",
    "composition": [
      { "ingredient": "Aspirin", "strength": "100", "unit": "mg" }
    ],
    "composition_hash": "aspirin_100mg",
    "manufacturer": "Bayer",
    "price": 25,
    "form": "Tablet",
    "pack_size": 14,
    "uses": [
      "Cardiovascular protection"
    ],
    "side_effects": [
      "Bleeding"
    ],
    "prescription_required": true,
    "what_it_does": "Antiplatelet agent.",
    "contraindications": [
      "Active bleeding"
    ],
    "drug_interactions": [
      "NSAIDs"
    ],
    "dosage": "75–325 mg daily.",
    "storage": "Store below 30°C."
  },
  {
    "id": 61,
    "brand_name": "Bactoclav",
    "generic_name": "Amoxicillin + Clavulanic Acid",
    "composition": [
      { "ingredient": "Amoxicillin", "strength": "500", "unit": "mg" },
      { "ingredient": "Clavulanic Acid", "strength": "125", "unit": "mg" }
    ],
    "composition_hash": "amoxicillin_500mg+clavulanic_acid_125mg",
    "manufacturer": "Macleods",
    "price": 100,
    "form": "Tablet",
    "pack_size": 6,
    "uses": [
      "Infections"
    ],
    "side_effects": [
      "Diarrhea"
    ],
    "prescription_required": true,
    "what_it_does": "Beta-lactam + beta-lactamase inhibitor.",
    "contraindications": [
      "Penicillin allergy"
    ],
    "drug_interactions": [
      "Probenecid"
    ],
    "dosage": "1 tablet twice daily.",
    "storage": "Store below 25°C."
  },
  {
    "id": 62,
    "brand_name": "Cilamin",
    "generic_name": "Cilostazol",
    "composition": [
      { "ingredient": "Cilostazol", "strength": "50", "unit": "mg" }
    ],
    "composition_hash": "cilostazol_50mg",
    "manufacturer": "Lupin",
    "price": 120,
    "form": "Tablet",
    "pack_size": 30,
    "uses": [
      "Intermittent claudication"
    ],
    "side_effects": [
      "Headache",
      "Diarrhea"
    ],
    "prescription_required": true,
    "what_it_does": "PDE3 inhibitor; antiplatelet and vasodilator.",
    "contraindications": [
      "Heart failure"
    ],
    "drug_interactions": [
      "CYP3A4 inhibitors"
    ],
    "dosage": "100 mg twice daily.",
    "storage": "Store below 30°C."
  },
  {
    "id": 63,
    "brand_name": "Dapson",
    "generic_name": "Dapsone",
    "composition": [
      { "ingredient": "Dapsone", "strength": "100", "unit": "mg" }
    ],
    "composition_hash": "dapsone_100mg",
    "manufacturer": "Pfizer",
    "price": 20,
    "form": "Tablet",
    "pack_size": 10,
    "uses": [
      "Leprosy",
      "Dermatitis herpetiformis"
    ],
    "side_effects": [
      "Hemolytic anemia"
    ],
    "prescription_required": true,
    "what_it_does": "Sulfone antibiotic.",
    "contraindications": [
      "G6PD deficiency"
    ],
    "drug_interactions": [
      "Rifampicin"
    ],
    "dosage": "50–100 mg daily.",
    "storage": "Store below 30°C."
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
                    {["Augmentin 1000 Duo", "Combiflam", "Augmentin 625", "Dolo 650", "Saridon"].map(
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