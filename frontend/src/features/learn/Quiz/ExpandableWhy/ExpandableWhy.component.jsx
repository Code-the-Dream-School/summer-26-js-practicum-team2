import { useState } from "react";
import Button from "../../../../shared/Button/Button.component";
export default function ExpandableWhy({ explanation = "" }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const words = explanation.trim().split(/\s+/).filter(Boolean);
  const shouldCollapse = words.length > 30;
  const previewText = words.slice(0, 30).join(" ");
  const displayedText = !shouldCollapse || isExpanded ? explanation : `${previewText}...`;

  return (
    <div className="text-foreground">
      <p>Explanation: {displayedText}</p>
      {shouldCollapse ? (
        <div className="absolute end-10 mt-2.5">
          <Button onClick={() => setIsExpanded((current) => !current)} variant="secondary">
            {isExpanded ? "Show less" : "Show more"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
