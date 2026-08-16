import { useState } from "react";
import Button from "../../../../shared/Button/Button.component.jsx";
export default function ExpandableWhy({ explanation }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const words = explanation.split(" ");
  const wordsToShow = isExpanded ? words : words.slice(0, 29);

  return (
    <p className="text-foreground">
      Explanation:{" "}
      {isExpanded ? explanation : words.length > 29 ? wordsToShow.join(" ") + "..." : explanation}
      {words.length > 29 ? (
        <div className="absolute end-10 mt-2.5 ">
          <Button onClick={toggleExpanded} variant="secondary">
            {isExpanded ? "Show Less" : "Show More"}
          </Button>
        </div>
      ) : null}
    </p>
  );
}
