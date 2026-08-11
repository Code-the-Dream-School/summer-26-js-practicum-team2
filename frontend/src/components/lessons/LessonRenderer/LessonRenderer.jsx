import Paragraph from './Paragraph'
import Formula from './Formula'
import Callout from './Callout'
import UnorderedList from './UnorderedList'
import Table from './Table'
import BudgetSummary from './BudgetSummary'

function LessonRenderer({ content, module }) {
  console.log('Renderer content:', content)

  if (!content) {
    return <div>No content found</div>
  }

  switch (content.type) {
    case 'paragraph':
      return <Paragraph content={content} />

    case 'characterIntro':
      return <p className="text-lg font-semibold leading-relaxed text-slate-800">{content.text}</p>

    case 'formula':
      return <Formula content={content} />

    case 'callout':
      return <Callout content={content} />

    case 'unorderedList':
      return <UnorderedList content={content} />

    case 'table': {
      return <Table content={content} module={module} />
    }

    case 'budget-summary':
      return <BudgetSummary content={content} module={module} />

    default:
      console.log(
        'Unsupported content type:',

        content,
      )

      return null
  }
}

export default LessonRenderer
