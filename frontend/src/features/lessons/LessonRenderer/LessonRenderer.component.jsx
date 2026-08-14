import Paragraph from "./Paragraph";
import CharacterIntro from "./CharacterIntro";
import Formula from "./Formula";
import Callout from "./Callout";
import UnorderedList from "./UnorderedList";
import KnowledgeCheck from "./KnowledgeCheck";
import Table from "./Table";
import BudgetSummary from "./BudgetSummary";

function LessonRenderer({ content, module }) {
  if (!content) {
    return <div>No content found</div>;
  }

  switch (content.type) {
    case "paragraph":
      return <Paragraph content={content} />;

    case "characterIntro":
      return <CharacterIntro content={content} module={module} />;

    case "formula":
      return <Formula content={content} />;

    case "callout":
      return <Callout content={content} />;

    case "unorderedList":
      return <UnorderedList content={content} />;

    case "knowledgeCheck":
      return (
        <div>
          <KnowledgeCheck content={content} />
        </div>
      );

    case "table": {
      return <Table content={content} module={module} />;
    }

    case "budget-summary":
      return <BudgetSummary content={content} module={module} />;

    default:
      return null;
  }
}

export default LessonRenderer;
