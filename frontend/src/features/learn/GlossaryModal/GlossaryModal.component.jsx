//import React hooks from "react" to manage search text and keyboard listeners and import generic Modal container
import { useState, useEffect, useCallback } from "react";
import Modal from "../../../shared/Modal/Modal.component.jsx";

//import generic modal component that is in shared directory of frontend
export default function GlossaryModal({ isOpen, onClose, glossary = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  //Esc key listener to close modal
  const handleClose = useCallback(() => {
    setSearchTerm("");
    onClose();
  }, [onClose]);

  useEffect(() => {
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

  if (!isOpen) return null;
  //Determine if glossary data exists

  const hasGlossaryInfo = Array.isArray(glossary) && glossary.length > 0;
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Glossary">
      <div
        className="flex max-h-[65vh] flex-col gap-4 overflow-hidden"
        role="dialog"
        aria-label="Module Glossary"
        aria-modal="true"
      >
        {/*Search bar for glossary term */}
        {hasGlossaryInfo && (
          <div className="pb-1">
            <input
              type="text"
              placeholder="Search terms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-surface-raised p-3 text-sm text-heading placeholder-neutral-500 focus:outline-none focus:rounded-xl focus:ring-2 focus:ring"
            />
          </div>
        )}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {sortLetters.length > 0 ? (
            sortLetters.map((letter) => (
              <div key={letter} className="space-y-2">
                <h3 className="sticky top-0 bg-surface-raised border-b border-neutral-200 py-1 font-bold text-lg text-heading">
                  {letter}
                </h3>
                <div className="space-y-3 pt-1">
                  {groupTerms[letter].map((item) => (
                    <div key={item.term} className="rounded-lg bg-surface-inset p-3">
                      <p className="font-semibold text-sm text-heading"> {item.term}</p>
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
      </div>
    </Modal>
  );
}
