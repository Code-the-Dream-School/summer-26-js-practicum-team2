import { useState } from "react";
import Modal from "../../../shared/Modal/Modal.component.jsx";
import Input from "../../../shared/Input/Input.component.jsx";

export default function GlossaryModal({ isOpen, onClose, glossary = [], worksCited = [] }) {
  //separate tab for works cited and tab for glossary
  const [activeTab, setActiveTab] = useState("glossary");
  const [searchTerm, setSearchTerm] = useState("");

  const handleClose = () => {
    setSearchTerm("");
    setActiveTab("glossary");
    onClose();
  };

  //Determine if glossary data exists
  const hasGlossaryInfo = Array.isArray(glossary) && glossary.length > 0;
  const hasWorksCitedInfo = Array.isArray(worksCited) && worksCited.length > 0;

  const filteredTerms = hasGlossaryInfo
    ? glossary.filter(
        (item) =>
          item.term?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.definition?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : [];

  const groupTerms = filteredTerms.reduce((acc, item) => {
    const firstLetter = item.term?.[0]?.toUpperCase() || "#";
    if (!acc[firstLetter]) acc[firstLetter] = [];
    acc[firstLetter].push(item);
    return acc;
  }, {});
  const sortLetters = Object.keys(groupTerms).sort();

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Glossary and References">
      <div className="flex max-h-[65vh] flex-col gap-4 overflow-hidden">
        <div
          role="group"
          aria-label="Glossary views"
          className="flex gap-2 border-b border-neutral-200 pb-2"
        >
          <button
            type="button"
            aria-pressed={activeTab === "glossary"}
            onClick={() => setActiveTab("glossary")}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
              activeTab === "glossary"
                ? "border border-focus bg-surface-raised text-heading shadow-sm"
                : "border border-neutral-200 bg-transparent text-neutral-500 hover:border-neutral-300 hover:text-heading"
            }`}
          >
            Glossary
          </button>
          <button
            type="button"
            aria-pressed={activeTab === "worksCited"}
            onClick={() => setActiveTab("worksCited")}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
              activeTab === "worksCited"
                ? "border border-focus bg-surface-raised text-heading shadow-sm"
                : "border border-neutral-200 bg-transparent text-neutral-500 hover:border-neutral-300 hover:text-heading"
            }`}
          >
            Works Cited
          </button>
        </div>

        {activeTab === "glossary" && (
          <>
            {hasGlossaryInfo && (
              <div className="pb-1">
                <Input
                  id="glossary-search"
                  label="Search glossary terms"
                  placeholder="Search terms..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="rounded-lg border-neutral-300 bg-surface-raised p-3 text-sm text-heading placeholder-neutral-500 focus:rounded-xl focus:ring-2 focus:ring-focus"
                />
              </div>
            )}
            <div
              tabIndex={0}
              role="region"
              aria-label="Glossary terms list with definitions"
              className="flex-1 space-y-4 overflow-y-auto rounded-lg pr-1 focus:outline-none focus:ring-1 focus:ring-focus focus:ring-offset-2"
            >
              {sortLetters.length > 0 ? (
                sortLetters.map((letter) => (
                  <div key={letter} className="space-y-2">
                    <h3 className="sticky top-0 border-b border-neutral-200 bg-surface-raised py-1 text-lg font-bold text-heading">
                      {letter}
                    </h3>
                    <div className="space-y-3 pt-1">
                      {groupTerms[letter].map((item) => (
                        <div
                          key={item.id ?? `${letter}-${item.term}-${item.definition}`}
                          className="rounded-lg bg-surface-inset p-3"
                        >
                          <p className="text-sm font-semibold text-heading">{item.term}</p>
                          <p className="mt-1 text-xs leading-relaxed text-neutral-600">
                            {item.definition}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <p className="text-sm font-semibold text-heading">
                    {!hasGlossaryInfo ? "No glossary terms available" : "No matching terms found"}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {!hasGlossaryInfo
                      ? "There are no glossary terms for this module"
                      : `No results for ${searchTerm}. Try searching for another term.`}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "worksCited" && (
          <div
            tabIndex={0}
            role="region"
            aria-label="Works cited sources list"
            className="flex-1 space-y-3 overflow-y-auto rounded-md pr-1 focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2"
          >
            {hasWorksCitedInfo ? (
              worksCited.map((source) => (
                <div
                  key={source.id ?? `${source.title}-${source.url}`}
                  className="rounded-lg bg-surface-inset p-3"
                >
                  <p className="text-sm font-semibold text-heading">{source.title}</p>
                  {source.author && (
                    <p className="mt-0.5 text-xs text-neutral-500">Author: {source.author}</p>
                  )}
                  {source.citation && (
                    <p className="mt-1 text-xs italic leading-relaxed text-neutral-600">
                      {source.citation}
                    </p>
                  )}
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-sm font-medium text-focus hover:underline"
                    >
                      View Source
                    </a>
                  )}
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <p className="text-sm font-semibold text-heading">No resources available</p>
                <p className="mt-1 text-xs text-neutral-500">
                  There are no works cited listed for this module
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
