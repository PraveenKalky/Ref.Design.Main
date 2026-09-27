export const FONT_CATEGORY_COUNTS = {
  'Sans-Serif': '1842', 'Serif': '1203', 'Display': '874', 'Monospace': '312',
  'Handwritten': '547', 'Script': '693', 'Geometric': '428', 'Humanist': '376',
  'Slab Serif': '284', 'Condensed': '196', 'Variable': '318', 'Rounded': '241',
  'Wide': '167', 'Retro': '432', 'Futuristic': '289', 'Decorative': '514',
  'Transitional': '193', 'Bold & Heavy': '621', 'Thin & Light': '398'
};

export const initialFontsData = [
  { 
    id: 1, 
    name: "Neue Montreal", 
    description: "A classic neo-grotesk sans-serif by Mathieu Desjardins & Sebastien Tremblay. Inspired by Helvetica but refined with tighter spacing, Neue Montreal excels in display settings and modern branding — clean, versatile, and timeless.", 
    stylesInfo: "36 styles + Variable cut\nIncluding Italics & Text", 
    category: "Sans-Serif", 
    badge: "Update", 
    isVariable: true, 
    googleFont: "'Inter', sans-serif",
    weightsAndStyles: "5 weights / 10 styles",
    languageSupport: "European Language Support",
    releaseYear: "Release 2019",
    stylesList: [
      { name: "Thin", weight: 100, italic: false },
      { name: "Thin Italic", weight: 100, italic: true },
      { name: "Light", weight: 300, italic: false },
      { name: "Light Italic", weight: 300, italic: true },
      { name: "Regular", weight: 400, italic: false },
      { name: "Italic", weight: 400, italic: true },
      { name: "Medium", weight: 500, italic: false },
      { name: "Medium Italic", weight: 500, italic: true },
      { name: "SemiBold", weight: 600, italic: false },
      { name: "SemiBold Italic", weight: 600, italic: true },
      { name: "Bold", weight: 700, italic: false },
      { name: "Bold Italic", weight: 700, italic: true },
      { name: "Black", weight: 900, italic: false },
      { name: "Black Italic", weight: 900, italic: true }
    ]
  },
  { 
    id: 2, 
    name: "PP Fragment", 
    description: "A versatile typeface inspired by vintage lettering and 19th-century sign painting, blending retro elegance with contemporary typography. PP Fragment oscillates between refined and modern, making it ideal for editorial and branding.", 
    stylesInfo: "32 styles + Variable cut\nIncluding Italic & Bold", 
    category: "Serif", 
    badge: "New", 
    isVariable: true, 
    googleFont: "'Playfair Display', serif",
    weightsAndStyles: "4 weights / 32 styles",
    languageSupport: "Latin & Greek Support",
    releaseYear: "Release 2021",
    stylesList: [
      { name: "Glare Light", weight: 300, italic: false },
      { name: "Glare Regular", weight: 400, italic: false },
      { name: "Glare Bold", weight: 700, italic: false },
      { name: "Elegant Light", weight: 300, italic: true },
      { name: "Elegant Regular", weight: 400, italic: true },
      { name: "Elegant Bold", weight: 700, italic: true },
      { name: "Serif Regular", weight: 400, italic: false },
      { name: "Serif Italic", weight: 400, italic: true },
      { name: "Serif Bold", weight: 700, italic: false },
      { name: "Sans Regular", weight: 400, italic: false },
      { name: "Sans Bold", weight: 700, italic: false }
    ]
  },
  { 
    id: 3, 
    name: "Right Grotesk", 
    description: "Designed by Alexander Slobzheninov, Right Grotesk balances neutrality with distinct personality. Featuring subtle ink traps and unusual reversed terminals, it spans 7 weights × 7 widths — from Compact to Wide — for maximum versatility.", 
    stylesInfo: "130 styles + Variable cut\nCompact to Wide", 
    category: "Sans-Serif", 
    isVariable: true, 
    googleFont: "'Space Grotesk', sans-serif",
    weightsAndStyles: "7 weights / 130 styles",
    languageSupport: "Cyrillic & Latin Support",
    releaseYear: "Release 2020",
    stylesList: [
      { name: "Compact Fine", weight: 200, italic: false },
      { name: "Compact Regular", weight: 400, italic: false },
      { name: "Compact Bold", weight: 700, italic: false },
      { name: "Compact Black", weight: 900, italic: false },
      { name: "Normal Regular", weight: 400, italic: false },
      { name: "Normal Italic", weight: 400, italic: true },
      { name: "Normal Bold", weight: 700, italic: false },
      { name: "Wide Regular", weight: 400, italic: false },
      { name: "Wide Bold", weight: 700, italic: false },
      { name: "Wide Black", weight: 900, italic: false }
    ],
    designer: "Alexander Slobzheninov",
    foundry: "Pangram Pangram",
    variableAxes: "Weight (100-900), Width (25-151), Slant (-10-0)",
    formats: ".otf, .woff, .woff2, Variable TTF",
    displayVsText: {
      display: { styles: 98, description: "Tight spacing, high contrast, perfect for large headlines and posters." },
      text: { styles: 32, description: "Looser spacing, wider proportions, optimized for reading paragraphs at small sizes." }
    }
  },
  { 
    id: 4, 
    name: "Mori", 
    description: "A geometric sans-serif inspired by contemporary Japanese design. PP Mori is clean, crisp, and neutral — a go-to choice for editorial layouts, branding systems, and graphic design projects that demand quiet sophistication.", 
    stylesInfo: "16 styles\nIncluding Italics", 
    category: "Sans-Serif", 
    googleFont: "'Gothic A1', sans-serif",
    weightsAndStyles: "8 weights / 16 styles",
    languageSupport: "Japanese & Latin Support",
    releaseYear: "Release 2022",
    stylesList: [
      { name: "ExtraLight", weight: 200, italic: false },
      { name: "Light", weight: 300, italic: false },
      { name: "Book", weight: 350, italic: false },
      { name: "Regular", weight: 400, italic: false },
      { name: "Italic", weight: 400, italic: true },
      { name: "Medium", weight: 500, italic: false },
      { name: "SemiBold", weight: 600, italic: false },
      { name: "Bold", weight: 700, italic: false },
      { name: "ExtraBold", weight: 800, italic: false }
    ]
  },
  { 
    id: 5, 
    name: "Pangram Sans", 
    description: "A comprehensive geometric sans-serif workhorse with over 2,800 glyphs. Built for flexibility across every weight, Pangram Sans includes a Rounded version for a more playful aesthetic — covering every design need.", 
    stylesInfo: "28 styles + Variable cut\nIncluding Rounded", 
    category: "Geometric", 
    isVariable: true, 
    googleFont: "'Plus Jakarta Sans', sans-serif",
    weightsAndStyles: "7 weights / 28 styles",
    languageSupport: "Global Language Support",
    releaseYear: "Release 2017",
    stylesList: [
      { name: "Thin", weight: 100, italic: false },
      { name: "Light", weight: 300, italic: false },
      { name: "Regular", weight: 400, italic: false },
      { name: "Medium", weight: 500, italic: false },
      { name: "Bold", weight: 700, italic: false },
      { name: "Black", weight: 900, italic: false },
      { name: "Rounded Regular", weight: 400, italic: false },
      { name: "Rounded Bold", weight: 700, italic: false }
    ]
  },
  { 
    id: 6, 
    name: "Formula", 
    description: "A bold, flexible grotesk by Mathieu Desjardins & Hugo Jourdan. Designed to be functional and performant across print and digital, PP Formula features a wide range of weights and widths for maximum impact.", 
    stylesInfo: "20 styles\nIncluding Condensed", 
    category: "Display", 
    googleFont: "'Bebas Neue', sans-serif",
    weightsAndStyles: "10 weights / 20 styles",
    languageSupport: "Extended Latin Support",
    releaseYear: "Release 2018",
    stylesList: [
      { name: "Condensed Light", weight: 300, italic: false },
      { name: "Condensed Regular", weight: 400, italic: false },
      { name: "Condensed Bold", weight: 700, italic: false },
      { name: "Regular", weight: 400, italic: false },
      { name: "Bold", weight: 700, italic: false },
      { name: "Black", weight: 900, italic: false },
      { name: "Expanded Regular", weight: 400, italic: false },
      { name: "Expanded Bold", weight: 700, italic: false }
    ]
  },
  { 
    id: 7, 
    name: "Editorial New", 
    description: "A precise, high-contrast narrow serif by Mathieu Desjardins & Francesca Bolognini. Drawing from 80s and 90s editorial typography, PP Editorial New is made for fashion headlines, long-form content, and sophisticated display.", 
    stylesInfo: "16 styles + Variable cut\nIncluding Italics", 
    category: "Serif", 
    badge: "Update", 
    isVariable: true, 
    googleFont: "'Newsreader', serif",
    weightsAndStyles: "8 weights / 16 styles",
    languageSupport: "European Language Support",
    releaseYear: "Release 2019",
    stylesList: [
      { name: "Ultralight", weight: 200, italic: false },
      { name: "Ultralight Italic", weight: 200, italic: true },
      { name: "Light", weight: 300, italic: false },
      { name: "Light Italic", weight: 300, italic: true },
      { name: "Regular", weight: 400, italic: false },
      { name: "Italic", weight: 400, italic: true },
      { name: "Medium", weight: 500, italic: false },
      { name: "Medium Italic", weight: 500, italic: true },
      { name: "Bold", weight: 700, italic: false },
      { name: "Bold Italic", weight: 700, italic: true }
    ]
  },
  { 
    id: 8, 
    name: "Telegraph", 
    description: "A sturdy sans-serif by Nick Losacco, inspired by mid-twentieth-century neo-grotesques. PP Telegraf is balanced, functional, and slightly geometric — widely used in branding and digital design for its clean readability.", 
    stylesInfo: "16 styles\nIncluding Italics", 
    category: "Sans-Serif", 
    googleFont: "'Work Sans', sans-serif",
    weightsAndStyles: "8 weights / 16 styles",
    languageSupport: "Western European Support",
    releaseYear: "Release 2020",
    stylesList: [
      { name: "Light", weight: 300, italic: false },
      { name: "Regular", weight: 400, italic: false },
      { name: "Italic", weight: 400, italic: true },
      { name: "Medium", weight: 500, italic: false },
      { name: "Bold", weight: 700, italic: false },
      { name: "Black", weight: 900, italic: false }
    ]
  }
];
