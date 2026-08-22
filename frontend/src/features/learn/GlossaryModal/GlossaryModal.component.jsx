//import React hooks from "react" to manage search text and keyboard listeners and import generic Modal container
//import { useState, useEffect, useCallback } from "react";
import { useState } from "react";
import Modal from "../../../shared/Modal/Modal.component.jsx";

//import generic modal component that is in shared directory of frontend
export default function GlossaryModal({ isOpen, onClose, glossary = [], worksCited = [] }) {
  //separate tab for works cited and tab for glossary
  const [activeTab, setActiveTab] = useState("glossary");
  const [searchTerm, setSearchTerm] = useState("");
  //Esc key listener to close modal
  //const handleClose = useCallback(() => {
  const handleClose = () => {
    setSearchTerm("");
    // go back to initial default state of glossary tab showing
    setActiveTab("glossary");
    onClose();
  };

  //, [onClose]);
  //Esc key will be handled by shared Modal design
  /*useEffect(() => {
    const handleKeyDown = (esc) => {
      if (esc.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null; */
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
      <div
        className="flex max-h-[65vh] flex-col gap-4 overflow-hidden"
        role="dialog"
        aria-label="Module Glossary and Works Cited"
        aria-modal="true"
      >
        {/* Navigate to the active tab */}
        <div className="flex gap-2 border-b border-neutral-200 pb-2">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "glossary"}
            onClick={() => setActiveTab("glossary")}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${
              activeTab === "glossary"
                ? "border border-focus bg-surface-raised text-heading shadow-sm"
                : "border border-neutral-200 bg-transparent text-neutral-500 hover:border-neutral-300 hover:text-heading"
            }`}
          >
            Glossary
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "worksCited"}
            onClick={() => setActiveTab("worksCited")}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${
              activeTab === "worksCited"
                ? "border border-focus bg-surface-raised text-heading shadow-sm"
                : "border border-neutral-200 bg-transparent text-neutral-500 hover:border-neutral-300 hover:text-heading"
            }`}
          >
            Works Cited
          </button>
        </div>
        {/* Tab 1: Glossary View */}
        {activeTab === "glossary" && (
          <>
            {/*Search bar for glossary term */}
            {hasGlossaryInfo && (
              <div className="pb-1">
                <input
                  type="text"
                  placeholder="Search terms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-surface-raised p-3 text-sm text-heading placeholder-neutral-500 focus:outline-none focus:rounded-xl focus:ring-2 focus:ring-focus"
                />
              </div>
            )}
            <div
              tabIndex={0}
              role="region"
              aria-label="Glossary terms list with definitions"
              className="flex-1 overflow-y-auto pr-1 space-y-4 focus:outline-none focus:ring-1 focus:ring-focus focus:ring-offset-2 rounded-lg"
            >
              {sortLetters.length > 0 ? (
                sortLetters.map((letter) => (
                  <div key={letter} className="space-y-2">
                    <h3 className="sticky top-0 bg-surface-raised border-b border-neutral-200 py-1 font-bold text-lg text-heading">
                      {letter}
                    </h3>
                    <div className="space-y-3 pt-1">
                      {groupTerms[letter].map((item, index) => (
                        <div
                          key={`${letter}-${item.term || index}`}
                          className="rounded-lg bg-surface-inset p-3"
                        >
                          <p className="font-semibold text-sm text-heading">{item.term}</p>
                          <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
                            {item.definition}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <p className="font-semibold text-sm text-heading">
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
        {/* Tab 2: Works Cited View */}
        {activeTab === "worksCited" && (
          <div
            tabIndex={0}
            role="region"
            aria-label="Works cited sources list"
            className="flex-1 overflow-y-auto pr-1 space-y-3 focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 rounded-md"
          >
            {hasWorksCitedInfo ? (
              worksCited.map((source, index) => (
                <div key={source.id || index} className="rounded-lg bg-surface-inset p-3">
                  <p className="font-semibold text-sm text-heading">{source.title}</p>
                  {source.author && (
                    <p className="mt-0.5 text-xs text-neutral-500">Author: {source.author}</p>
                  )}
                  {source.citation && (
                    <p className="mt-1 text-xs text-neutral-600 leading-relaxed italic">
                      {source.citation}
                    </p>
                  )}
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-sm font-medium text-focuse hover: underline"
                    >
                      View Source
                    </a>
                  )}
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <p className="font-semibold text-sm text-heading">No resources available</p>
                <p className="mt-1 text-xs text-neutral-500">
                  There are no works cited listed for this module
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/*/*Search bar for glossary term 
        {hasGlossaryInfo && (
          <div className="pb-1">
            <input
              type="text"
              placeholder="Search terms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-surface-raised p-3 text-sm text-heading placeholder-neutral-500 focus:outline-none focus:rounded-xl focus:ring-2 focus:ring-focus"
            />
          </div>
        )}
        {/* More keyboard controlling of sections to scroll, tabIndex={0} allow browswer to use up/down/pageup/pagedown/space keys to scroll  
        <div
          tabIndex={0}
          role="region"
          aria-label="Glossary terms list with definitions"
          className="flex-1 overflow-y-auto pr-1 space-y-4 focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 rounded-md"
        >
          {sortLetters.length > 0 ? (
            sortLetters.map((letter) => (
              <div key={letter} className="space-y-2">
                <h3 className="sticky top-0 bg-surface-raised border-b border-neutral-200 py-1 font-bold text-lg text-heading">
                  {letter}
                </h3>
                <div className="space-y-3 pt-1">
                  {groupTerms[letter].map((item, index) => (
                    <div
                      key={`${letter}-${item.term || index}`}
                      className="rounded-lg bg-surface-inset p-3"
                    >
                      <p className="font-semibold text-sm text-heading">{item.term}</p>
                      <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
                        {item.definition}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <p className="font-semibold text-sm text-heading">
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
      </div> */}
    </Modal>
  );
}
