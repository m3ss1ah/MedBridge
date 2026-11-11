/**
 * Plain-language glossary of terms that appear on lab reports and in MedBridge's
 * explanations. Written by the project team in our own words, consistent with the
 * knowledge base (backend/knowledge_base). Used for:
 *   - hover/focus tooltips on medical words in summaries and explanations
 *   - the searchable Glossary tab
 *
 * `aliases` are other spellings or abbreviations that should show the same tooltip.
 * Single letters and very common words are deliberately left out to avoid noise.
 */

export const GLOSSARY = [
  // ---- General ----
  {
    term: 'Reference range',
    aliases: ['reference ranges', 'normal range'],
    category: 'General',
    definition:
      'The span of results a lab usually sees in healthy people. Each lab sets its own, so always compare with the range printed on your report.',
  },
  {
    term: 'Fasting',
    aliases: ['fasted'],
    category: 'General',
    definition:
      'Not eating or drinking anything except water for a set time, usually 8 to 12 hours, before a test.',
  },
  {
    term: 'Plasma',
    aliases: [],
    category: 'General',
    definition:
      'The yellowish liquid part of blood that carries cells, nutrients and waste around the body.',
  },
  {
    term: 'Serum',
    aliases: [],
    category: 'General',
    definition:
      'The liquid left after blood has clotted. Many chemistry tests are measured in serum.',
  },
  {
    term: 'g/dL',
    aliases: [],
    category: 'Units',
    definition: 'Grams per decilitre: the weight of a substance in one tenth of a litre of blood.',
  },
  {
    term: 'mg/dL',
    aliases: [],
    category: 'Units',
    definition:
      'Milligrams per decilitre: a smaller unit of weight per tenth of a litre, used for cholesterol, sugar and creatinine.',
  },
  {
    term: 'mmol/L',
    aliases: [],
    category: 'Units',
    definition:
      'Millimoles per litre: counts molecules instead of weighing them. Common for sodium, potassium and, in many countries, sugar.',
  },
  {
    term: 'Inflammation',
    aliases: ['inflammatory'],
    category: 'General',
    definition:
      "The body's response to injury or infection, which can change some blood results for a while.",
  },
  {
    term: 'Dehydration',
    aliases: ['dehydrated'],
    category: 'General',
    definition:
      'Having less water in the body than it needs. It can make some blood values look higher than usual.',
  },
  {
    term: 'Enzyme',
    aliases: ['enzymes'],
    category: 'General',
    definition:
      'A protein that speeds up chemical reactions in the body. Some enzymes leak into the blood when organs are irritated.',
  },
  {
    term: 'Hormone',
    aliases: ['hormones'],
    category: 'General',
    definition:
      'A chemical messenger made by a gland that tells other parts of the body what to do.',
  },

  // ---- Blood count ----
  {
    term: 'CBC',
    aliases: ['complete blood count', 'full blood count', 'hemogram', 'haemogram'],
    category: 'Blood count',
    definition:
      'Complete blood count: a common test that counts and measures red cells, white cells and platelets.',
  },
  {
    term: 'Haemoglobin',
    aliases: ['hemoglobin', 'Hb', 'Hgb'],
    category: 'Blood count',
    definition:
      'The iron-containing protein inside red blood cells that carries oxygen from the lungs to the rest of the body.',
  },
  {
    term: 'Hematocrit',
    aliases: ['haematocrit', 'HCT', 'PCV', 'packed cell volume'],
    category: 'Blood count',
    definition: 'The share of your blood made up of red blood cells, shown as a percentage.',
  },
  {
    term: 'Red blood cells',
    aliases: ['red blood cell', 'RBC', 'red cells', 'erythrocytes'],
    category: 'Blood count',
    definition: 'Cells that carry oxygen around the body using the haemoglobin inside them.',
  },
  {
    term: 'MCV',
    aliases: ['mean corpuscular volume'],
    category: 'Blood count',
    definition: 'The average size of your red blood cells.',
  },
  {
    term: 'MCH',
    aliases: ['mean corpuscular haemoglobin', 'mean corpuscular hemoglobin'],
    category: 'Blood count',
    definition: 'The average amount of haemoglobin inside each red blood cell.',
  },
  {
    term: 'MCHC',
    aliases: [],
    category: 'Blood count',
    definition: 'How concentrated the haemoglobin is inside your red blood cells.',
  },
  {
    term: 'RDW',
    aliases: ['red cell distribution width'],
    category: 'Blood count',
    definition:
      'How much your red blood cells vary in size. A higher number means a wider mix of sizes.',
  },
  {
    term: 'White blood cells',
    aliases: ['white blood cell', 'WBC', 'leukocytes', 'leucocytes', 'TLC'],
    category: 'Blood count',
    definition: "Cells of the immune system, the body's defence against infections.",
  },
  {
    term: 'Neutrophils',
    aliases: ['neutrophil'],
    category: 'Blood count',
    definition:
      'The most common white blood cells, often first to respond to bacterial infections.',
  },
  {
    term: 'Lymphocytes',
    aliases: ['lymphocyte'],
    category: 'Blood count',
    definition: 'White blood cells that make antibodies and help fight viruses.',
  },
  {
    term: 'Monocytes',
    aliases: ['monocyte'],
    category: 'Blood count',
    definition: 'White blood cells that help clear away germs and damaged cells.',
  },
  {
    term: 'Eosinophils',
    aliases: ['eosinophil'],
    category: 'Blood count',
    definition: 'White blood cells involved in allergies and in fighting some parasites.',
  },
  {
    term: 'Basophils',
    aliases: ['basophil'],
    category: 'Blood count',
    definition: 'The least common white blood cells, which play a part in allergic reactions.',
  },
  {
    term: 'Platelets',
    aliases: ['platelet', 'PLT', 'thrombocytes'],
    category: 'Blood count',
    definition: 'Tiny cell fragments that clump together to help blood clot and stop bleeding.',
  },
  {
    term: 'Anaemia',
    aliases: ['anemia'],
    category: 'Blood count',
    definition:
      'Having fewer red blood cells or less haemoglobin than usual, so less oxygen reaches the body. It has many possible causes.',
  },
  {
    term: 'Bone marrow',
    aliases: [],
    category: 'Blood count',
    definition: 'The soft tissue inside bones where blood cells are made.',
  },

  // ---- Lipids ----
  {
    term: 'Lipid profile',
    aliases: ['lipid panel', 'lipids'],
    category: 'Cholesterol',
    definition:
      'A blood test that measures fats in the blood: total cholesterol, LDL, HDL and triglycerides.',
  },
  {
    term: 'Cholesterol',
    aliases: ['total cholesterol'],
    category: 'Cholesterol',
    definition:
      'A waxy, fat-like substance the body needs to build cells and make hormones. Too much can build up in arteries.',
  },
  {
    term: 'LDL',
    aliases: ['LDL cholesterol', 'low-density lipoprotein', 'bad cholesterol'],
    category: 'Cholesterol',
    definition:
      'Low-density lipoprotein, often called "bad" cholesterol, because too much can build up in artery walls.',
  },
  {
    term: 'HDL',
    aliases: ['HDL cholesterol', 'high-density lipoprotein', 'good cholesterol'],
    category: 'Cholesterol',
    definition:
      'High-density lipoprotein, often called "good" cholesterol, because it carries extra cholesterol back to the liver.',
  },
  {
    term: 'Triglycerides',
    aliases: ['triglyceride', 'TG'],
    category: 'Cholesterol',
    definition:
      'The most common type of fat in the body, used to store energy. Levels rise after meals.',
  },
  {
    term: 'VLDL',
    aliases: ['very-low-density lipoprotein'],
    category: 'Cholesterol',
    definition:
      'Very-low-density lipoprotein, which mainly carries triglycerides. Usually estimated from the triglyceride result.',
  },
  {
    term: 'Non-HDL cholesterol',
    aliases: ['non-HDL'],
    category: 'Cholesterol',
    definition:
      'Total cholesterol minus HDL: all the types of cholesterol that can build up in arteries.',
  },
  {
    term: 'Artery',
    aliases: ['arteries'],
    category: 'Cholesterol',
    definition: 'A blood vessel that carries oxygen-rich blood from the heart to the body.',
  },

  // ---- Blood sugar ----
  {
    term: 'Glucose',
    aliases: ['blood sugar', 'blood glucose'],
    category: 'Blood sugar',
    definition: "Sugar in the blood, the body's main source of energy.",
  },
  {
    term: 'HbA1c',
    aliases: ['A1c', 'glycated haemoglobin', 'glycated hemoglobin'],
    category: 'Blood sugar',
    definition: 'A test showing your average blood sugar over the past two to three months.',
  },
  {
    term: 'Prediabetes',
    aliases: ['pre-diabetes'],
    category: 'Blood sugar',
    definition:
      'Blood sugar that is higher than usual but not in the diabetes range. Doctors often keep an eye on it.',
  },
  {
    term: 'Insulin',
    aliases: [],
    category: 'Blood sugar',
    definition: 'A hormone made by the pancreas that helps move sugar from the blood into cells.',
  },

  // ---- Kidney and electrolytes ----
  {
    term: 'Creatinine',
    aliases: [],
    category: 'Kidney',
    definition:
      'A waste product from muscles that healthy kidneys filter out. Higher levels can mean the kidneys are filtering less.',
  },
  {
    term: 'eGFR',
    aliases: ['GFR', 'glomerular filtration rate'],
    category: 'Kidney',
    definition:
      'An estimate of how well your kidneys filter blood, calculated from creatinine, age and sex. Higher is better.',
  },
  {
    term: 'Urea',
    aliases: ['BUN', 'blood urea nitrogen'],
    category: 'Kidney',
    definition: 'A waste product made when the body breaks down protein, removed by the kidneys.',
  },
  {
    term: 'Electrolytes',
    aliases: ['electrolyte'],
    category: 'Kidney',
    definition:
      'Minerals in the blood, such as sodium and potassium, that control fluid balance and keep nerves and muscles working.',
  },
  {
    term: 'Sodium',
    aliases: [],
    category: 'Kidney',
    definition: 'An electrolyte that mainly controls the balance of water in and around cells.',
  },
  {
    term: 'Potassium',
    aliases: [],
    category: 'Kidney',
    definition:
      'An electrolyte that is vital for nerve signals and a steady heartbeat. Labs flag very high or low values.',
  },

  // ---- Liver ----
  {
    term: 'Liver function tests',
    aliases: ['LFT', 'liver panel'],
    category: 'Liver',
    definition: 'A group of blood tests that give information about how the liver is working.',
  },
  {
    term: 'ALT',
    aliases: ['SGPT'],
    category: 'Liver',
    definition:
      'An enzyme found mostly in the liver. It leaks into the blood when liver cells are irritated.',
  },
  {
    term: 'AST',
    aliases: ['SGOT'],
    category: 'Liver',
    definition: 'An enzyme found in the liver, heart and muscles.',
  },
  {
    term: 'ALP',
    aliases: ['alkaline phosphatase'],
    category: 'Liver',
    definition: 'An enzyme linked to the bile ducts and bones.',
  },
  {
    term: 'Bilirubin',
    aliases: [],
    category: 'Liver',
    definition:
      'A yellow substance made when old red blood cells break down. The liver helps remove it.',
  },
  {
    term: 'Albumin',
    aliases: [],
    category: 'Liver',
    definition: 'The main protein made by the liver. It helps keep fluid in the blood vessels.',
  },

  // ---- Thyroid ----
  {
    term: 'Thyroid',
    aliases: ['thyroid gland'],
    category: 'Thyroid',
    definition:
      'A small gland in the neck that makes hormones controlling how the body uses energy.',
  },
  {
    term: 'TSH',
    aliases: ['thyroid stimulating hormone'],
    category: 'Thyroid',
    definition:
      'A hormone from the brain that tells the thyroid how much hormone to make. It moves in the opposite direction to thyroid hormones.',
  },
  {
    term: 'Free T4',
    aliases: ['T4', 'thyroxine', 'FT4'],
    category: 'Thyroid',
    definition: 'The main hormone made by the thyroid gland.',
  },
  {
    term: 'T3',
    aliases: ['free T3', 'triiodothyronine'],
    category: 'Thyroid',
    definition: 'The more active form of thyroid hormone.',
  },

  // ---- Vitamins and iron ----
  {
    term: 'Ferritin',
    aliases: [],
    category: 'Vitamins & iron',
    definition:
      "A protein that stores iron. Its level in the blood reflects the body's iron stores.",
  },
  {
    term: 'Iron',
    aliases: [],
    category: 'Vitamins & iron',
    definition: 'A mineral the body needs to make haemoglobin.',
  },
  {
    term: 'Vitamin D',
    aliases: [],
    category: 'Vitamins & iron',
    definition:
      'A vitamin the skin makes in sunlight. It helps the body absorb calcium for strong bones.',
  },
  {
    term: 'Vitamin B12',
    aliases: ['B12', 'cobalamin'],
    category: 'Vitamins & iron',
    definition:
      'A vitamin needed to make red blood cells and keep nerves healthy. It comes mainly from animal foods.',
  },
  {
    term: 'Folate',
    aliases: ['folic acid'],
    category: 'Vitamins & iron',
    definition: 'A B vitamin that works with B12 to make healthy red blood cells.',
  },
]

/** Find the glossary entry for a word or alias (case-insensitive). */
export function findEntry(word) {
  const w = word.toLowerCase()
  return GLOSSARY.find(
    (e) => e.term.toLowerCase() === w || e.aliases.some((a) => a.toLowerCase() === w),
  )
}

/**
 * One regex that matches any term or alias as a whole word. Longer phrases come
 * first so "LDL cholesterol" wins over "LDL", and "total cholesterol" over "cholesterol".
 */
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
const allWords = GLOSSARY.flatMap((e) => [e.term, ...e.aliases]).sort((a, b) => b.length - a.length)
export const TERM_REGEX = new RegExp(
  `(?<![\\w-])(${allWords.map(escape).join('|')})(?![\\w-])`,
  'gi',
)
