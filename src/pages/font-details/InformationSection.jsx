import React, { useState } from 'react';
import { ArrowRight } from '@phosphor-icons/react';
import './information-section.css';

const getFontMetadata = (font) => {
  const fontName = font?.name || 'Founders Grotesk';

  // 1. Credits & Awards Data
  let design = font?.designer ? [font.designer] : ["Mathieu Desjardins"];
  let engineering = ["Mathieu Desjardins", "Valerio Monopoli"];
  let awards = [
    { title: "Hiiibrand International Brand & Communication Design Awards", year: 2020 }
  ];

  if (fontName.includes("Montreal")) {
    design = ["Mathieu Desjardins"];
    engineering = ["Mathieu Desjardins", "Sebastien Tremblay"];
    awards = [
      { title: "Typehelp Top Release", year: 2019 },
      { title: "Montreal Design Craft Awards, Winner", year: 2020 }
    ];
  } else if (fontName.includes("Fragment")) {
    design = ["Mathieu Desjardins"];
    engineering = ["Mathieu Desjardins"];
    awards = [
      { title: "AGDA Design Award, Finalist", year: 2021 }
    ];
  } else if (fontName.includes("Right")) {
    design = font?.designer ? [font.designer] : ["Alexander Slobzheninov"];
    engineering = ["Alexander Slobzheninov", "Noe Blanco"];
    awards = [
      { title: "Best Awards, Design Craft, Finalist", year: 2020 },
      { title: "Type Directors Club Certificate", year: 2021 }
    ];
  } else if (fontName.includes("Mori")) {
    design = ["Caio Kondo"];
    engineering = ["Caio Kondo", "Valerio Monopoli"];
    awards = [
      { title: "Tokyo TDC Annual Awards", year: 2022 }
    ];
  } else if (fontName.includes("Pangram")) {
    design = ["Mathieu Desjardins"];
    engineering = ["Mathieu Desjardins", "Ben Kiel"];
    awards = [
      { title: "Communication Arts Design Award", year: 2018 }
    ];
  } else if (fontName.includes("Formula")) {
    design = ["Mathieu Desjardins"];
    engineering = ["Mathieu Desjardins", "Hugo Jourdan"];
    awards = [
      { title: "Brand New Award, Winner", year: 2018 }
    ];
  } else if (fontName.includes("Editorial")) {
    design = ["Mathieu Desjardins"];
    engineering = ["Mathieu Desjardins", "Francesca Bolognini"];
    awards = [
      { title: "Hiiibrand Bronze Award", year: 2019 },
      { title: "Club des Directeurs Artistiques 3rd Prize", year: 2020 }
    ];
  } else if (fontName.includes("Telegraph") || fontName.includes("Telegraf")) {
    design = ["Nick Losacco"];
    engineering = ["Nick Losacco", "Valerio Monopoli"];
    awards = [
      { title: "Type Directors Club Certificate", year: 2020 }
    ];
  }

  // 2. Technical Details Data
  const subFamilies = [
    fontName,
    `${fontName} Condensed`,
    `${fontName} X-Condensed`,
    `${fontName} Text`,
    `${fontName} Mono`
  ];

  const releaseDates = subFamilies.map((name, idx) => ({
    name,
    year: parseInt(font?.releaseYear?.replace(/\D/g, '')) ? parseInt(font.releaseYear.replace(/\D/g, '')) + idx : 2020 + idx
  }));

  const currentVersions = subFamilies.map((name, idx) => ({
    name,
    version: idx === 4 ? "2.005" : "2.004"
  }));

  const classifications = subFamilies.map((name, idx) => ({
    name,
    value: idx === 4 ? `Modern: Lineal/${font?.category || 'Grotesque'} Monospaced` : `Modern: Lineal/${font?.category || 'Grotesque'}`
  }));

  const creditsRows = [
    ...(font?.foundry ? [{ label: "Foundry", value: font.foundry }] : []),
    ...design.map((name, idx) => ({ label: idx === 0 ? "Design" : "", value: name })),
    ...engineering.map((name, idx) => ({ label: idx === 0 ? "Engineering" : "", value: name })),
    ...awards.map((award, idx) => ({ label: idx === 0 ? "Awards" : "", value: award.title, meta: award.year.toString() }))
  ];

  const technicalRows = [
    ...releaseDates.map((rd, idx) => ({ label: idx === 0 ? "Release dates" : "", value: rd.name, meta: rd.year.toString() })),
    ...currentVersions.map((cv, idx) => ({ label: idx === 0 ? "Current versions" : "", value: cv.name, meta: cv.version })),
    ...classifications.map((cl, idx) => ({ label: idx === 0 ? "Classifications" : "", value: cl.name, meta: cl.value })),
    ...(font?.variableAxes ? [{ label: "Variable axes", value: font.variableAxes }] : []),
    {
      label: "Font formats",
      isMultiColumn: font?.formats ? false : true,
      value: font?.formats || undefined,
      columns: font?.formats ? undefined : [
        { label: "OTF", desc: "Desktop" },
        { label: "WOFF2", desc: "Web" },
        { label: "TTF", desc: "App" }
      ]
    },
    {
      label: "Average glyph count",
      isMultiColumn: true,
      columns: [
        { label: fontName.includes("Pangram") ? "980" : "469", desc: "per Roman style" },
        { label: fontName.includes("Formula") ? "0" : fontName.includes("Pangram") ? "980" : "198", desc: "per Italic style" },
        { label: fontName.includes("Pangram") ? "27,440" : "16,680", desc: "total" }
      ]
    },
    { label: "Font styles", value: font?.stylesList?.length?.toString() || "35" },
    { label: "Hinting", value: "Manual VTT hinting" },
    { label: "Kerning", value: "Manual kerning", meta: "78,945 total pairs" }
  ];

  return { creditsRows, technicalRows };
};

const InformationSection = ({ font }) => {
  const fontName = font?.name || 'Founders Grotesk';

  // Accordion states
  const [openSections, setOpenSections] = useState({
    credits: false,
    technical: false,
    language: false
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleDownloadTestFonts = () => {
    alert(`Downloading test fonts for ${fontName}...`);
  };

  const editorialParagraph = `${fontName} is a contemporary amalgamation of classic grotesks. Millar & Richard's early 20th century Grotesque series provided rudimentary geometry, serpentine curves, and the narrow but welcome aperture of certain forms. Further details were inspired by H. W. Caslon's Doric series from the same era. These details are coupled with tight spacing strategies from Helvetica's Halbfett (Medium) headline-sized metal cuts from the late 1950s. ${fontName} is not intended as strict revival, it resolves the best details from the last century into a large family designed for modern typography.`;

  const { creditsRows, technicalRows } = getFontMetadata(font);

  const languageRows = [
    { label: "Coverage", value: font?.languageSupport || 'European & Western languages' },
    { label: "Character sets", value: "Latin Extended, Western European, Central European, standard diacritics" }
  ];

  const renderAccordionTable = (rows) => {
    return (
      <div className="accordion-panel-wrapper">
        <table className="accordion-table">
          <tbody>
            {rows.map((row, index) => {
              if (row.isMultiColumn) {
                return (
                  <tr key={index} className="accordion-table-row">
                    <td className="table-label">{row.label}</td>
                    <td className="table-value" colSpan={2}>
                      <div className="table-multicol">
                        {row.columns.map((col, cIdx) => (
                          <div key={cIdx} className="table-multicol-item">
                            <span className="table-multicol-value">{col.label}</span>{' '}
                            <span className="table-multicol-desc">{col.desc}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={index} className="accordion-table-row">
                  <td className="table-label">{row.label}</td>
                  <td className="table-value">{row.value}</td>
                  <td className="table-meta">{row.meta || ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <section className="info-section" id="information">
      <div className="info-container">
        {/* Do not remove "Information" heading */}
        <h2 className="info-title">Information</h2>

        <div className="info-layout">
          {/* Full-width Content Block */}
          <div className="info-content-left">
            <p className="info-description-text">
              {editorialParagraph}
            </p>

            <div className="info-accordion-container">
              {/* Credits & Awards */}
              <div className="info-accordion-item">
                <button className="info-accordion-header" onClick={() => toggleSection('credits')}>
                  <svg
                    className={`info-accordion-icon ${openSections.credits ? 'is-open' : ''}`}
                    width="8" height="8" viewBox="0 0 8 8" fill="none"
                  >
                    <path d="M2 1.5L6 4L2 6.5V1.5Z" fill="currentColor" />
                  </svg>
                  <span className="info-accordion-title">Credits &amp; awards</span>
                </button>
                <div className={`info-accordion-content ${openSections.credits ? 'is-open' : ''}`}>
                  {renderAccordionTable(creditsRows)}
                </div>
              </div>

              {/* Technical Details */}
              <div className="info-accordion-item">
                <button className="info-accordion-header" onClick={() => toggleSection('technical')}>
                  <svg
                    className={`info-accordion-icon ${openSections.technical ? 'is-open' : ''}`}
                    width="8" height="8" viewBox="0 0 8 8" fill="none"
                  >
                    <path d="M2 1.5L6 4L2 6.5V1.5Z" fill="currentColor" />
                  </svg>
                  <span className="info-accordion-title">Technical details</span>
                </button>
                <div className={`info-accordion-content ${openSections.technical ? 'is-open' : ''}`}>
                  {renderAccordionTable(technicalRows)}
                </div>
              </div>

              {/* Language Support */}
              <div className="info-accordion-item">
                <button className="info-accordion-header" onClick={() => toggleSection('language')}>
                  <svg
                    className={`info-accordion-icon ${openSections.language ? 'is-open' : ''}`}
                    width="8" height="8" viewBox="0 0 8 8" fill="none"
                  >
                    <path d="M2 1.5L6 4L2 6.5V1.5Z" fill="currentColor" />
                  </svg>
                  <span className="info-accordion-title">Language support</span>
                </button>
                <div className={`info-accordion-content ${openSections.language ? 'is-open' : ''}`}>
                  {renderAccordionTable(languageRows)}
                </div>
              </div>
            </div>

            <button className="info-download-test-btn" onClick={handleDownloadTestFonts}>
              <span>Download Fonts</span>
              <ArrowRight className="info-download-icon" size={20} weight="bold" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InformationSection;
