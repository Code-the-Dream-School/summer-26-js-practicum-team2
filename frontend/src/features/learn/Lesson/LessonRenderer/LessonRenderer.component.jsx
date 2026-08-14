import Paragraph from "./Paragraph/Paragraph.component";
import CharacterIntro from "./CharacterIntro/CharacterIntro.component";
import Formula from "./Formula/Formula.component";
import Callout from "./Callout/Callout.component";
import UnorderedList from "./UnorderedList/UnorderedList.component";
import KnowledgeCheck from "./KnowledgeCheck/KnowledgeCheck.component";
import Table from "./Table/Table.component";
import BudgetSummary from "./BudgetSummary/BudgetSummary.component";

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
