import { Link } from 'react-router'

const sections = [
  {
    title: '1. About the Application',
    body: [
      'These Terms of Service govern your access to and use of Sprout, a financial-literacy educational application operated by Counting Cents & Making Sense.',
      'Sprout is designed to help users learn about budgeting, saving, credit, debt, financial goals, and general financial stability through lessons, quizzes, progress tracking, points, streaks, badges, and other educational features.',
    ],
  },
  {
    title: '2. Educational Purposes Only',
    body: [
      'The information provided through Sprout is for general educational purposes only. Sprout does not provide personalized financial, investment, tax, legal, or credit advice.',
      'We are not a bank, credit union, financial adviser, investment adviser, lender, accountant, law firm, or credit-repair organization. Examples, quizzes, recommendations, and scenarios may be simplified for educational purposes. You should consult a qualified professional before making important financial, legal, tax, credit, or investment decisions.',
    ],
  },
  {
    title: '3. Eligibility and Use by Minors',
    body: [
      'If you are under the age of legal majority where you live, you may use Sprout only with the permission and supervision of a parent or legal guardian. If you are under 13 years old, a parent or guardian must approve your use of the app, and we must obtain any parental consent required by law before collecting personal information from you.',
      'Parents and legal guardians who permit a minor to use the application agree to these Terms on the minor’s behalf and are responsible for supervising the minor’s use of the app.',
    ],
  },
  {
    title: '4. User Accounts',
    body: [
      'When creating or using an account, you agree to provide accurate and current information, keep your login credentials private, use only an account you are authorized to use, notify us if your account has been compromised, and accept responsibility for activity performed through your account.',
      'You may not impersonate another person, create an account using another person’s email address without permission, or provide false information about your age or identity. We may suspend access when we reasonably believe an account has been compromised or used in violation of these Terms.',
    ],
  },
  {
    title: '5. Personal and Financial Information',
    body: [
      'The app does not require users to submit bank account numbers, credit-card numbers, Social Security numbers, income records, investment-account credentials, or other sensitive financial records.',
      'Do not enter real financial-account information into profile fields, usernames, quiz answers, lesson responses, support messages, or other application fields. If a lesson asks users to work with financial examples, use fictional or approximate information rather than real account numbers or credentials.',
    ],
  },
  {
    title: '6. Acceptable Use',
    body: [
      'You agree to use Sprout only for lawful and appropriate educational purposes. You may not attempt to access another user’s account, share or collect another user’s private information without permission, harass or impersonate others, upload malicious code, bypass security controls, interfere with availability, use automated tools to scrape or copy the app, reverse engineer the app except where permitted by law, or manipulate quiz results, points, streaks, badges, or progress records.',
      'We may investigate suspected misuse and restrict or terminate access when necessary to protect users or the application.',
    ],
  },
  {
    title: '7. Learning Progress and Rewards',
    body: [
      'Points, experience, streaks, badges, achievements, rankings, and similar features are provided only for educational motivation. These items have no cash value, cannot be exchanged for money, are not financial assets, are not transferable between users, and may be changed, corrected, reset, or removed.',
      'We may adjust progress or reward records to correct technical errors, prevent abuse, or maintain the integrity of the app.',
    ],
  },
  {
    title: '8. Ownership of the Application',
    body: [
      'Sprout, including its software, visual design, branding, lessons, quizzes, graphics, text, and other original content, is owned by Counting Cents & Making Sense or its licensors and is protected by applicable intellectual-property laws.',
      'Subject to these Terms, we grant you a limited, personal, nonexclusive, nontransferable, and revocable right to use the application for educational and noncommercial purposes.',
    ],
  },
  {
    title: '9. User-Provided Content',
    body: [
      'The application may allow you to submit limited information such as a display name, learning goals, support messages, or lesson responses. You retain ownership of content you lawfully submit, but you grant us permission to store, process, display, and use that content as reasonably necessary to operate the app, save progress, provide requested features, respond to support, and protect the app and its users.',
      'You may not submit content that violates another person’s rights, contains private information about another person, is abusive or unlawful, or contains malware or malicious instructions.',
    ],
  },
  {
    title: '10. Feedback',
    body: [
      'You may voluntarily provide suggestions or feedback about the app. By submitting feedback, you allow us to use it to develop and improve the app without owing compensation or creating an obligation to implement the suggestion.',
    ],
  },
  {
    title: '11. Third-Party Services and Links',
    body: [
      'The app may depend on third-party services for hosting, authentication, databases, email delivery, analytics, and error monitoring. The app may also include links to websites or resources that we do not control.',
      'We are not responsible for the availability, content, privacy practices, security, or policies of independent third-party services. Your use of those services may be governed by their own terms and privacy policies.',
    ],
  },
  {
    title: '12. Application Availability',
    body: [
      'We aim to provide a useful and reliable educational experience, but we do not guarantee that the application will always be available, uninterrupted, secure, or error-free. We may add or remove features, change lessons or quiz content, correct errors, perform maintenance, restrict access during security incidents, or suspend or discontinue part of the app.',
    ],
  },
  {
    title: '13. Account Suspension and Termination',
    body: [
      'You may stop using the app at any time. You may request deletion of your account by contacting the support or privacy email listed below. We may suspend or terminate an account if we reasonably believe the Terms have been violated, the account presents a security risk, the account is being used fraudulently, or continued access could harm another user.',
      'When an account is terminated, the user’s right to access the application ends. Information associated with the account will be handled according to our Privacy Policy and applicable legal requirements.',
    ],
  },
  {
    title: '14. Disclaimer of Warranties',
    body: [
      'To the greatest extent permitted by law, Sprout is provided on an “as is” and “as available” basis. We do not guarantee that every lesson or answer will be complete or error-free, the app will meet every educational need, using the app will produce a particular financial outcome, or the app will always operate without interruption.',
    ],
  },
  {
    title: '15. Limitation of Liability',
    body: [
      'To the greatest extent permitted by applicable law, Counting Cents & Making Sense and its contributors, mentors, contractors, and service providers will not be liable for indirect, incidental, special, consequential, or punitive damages arising from the use of or inability to use the application, including losses relating to decisions made based on educational content, lost progress, loss of data, service interruption, unauthorized account access, or reliance on incomplete or inaccurate information.',
    ],
  },
  {
    title: '16. Indemnification',
    body: [
      'To the extent permitted by law, you agree to be responsible for claims, damages, or expenses resulting from your unlawful use of the app, your material violation of these Terms, your infringement of another person’s rights, or content you submit through the application.',
    ],
  },
  {
    title: '17. Governing Law',
    body: [
      'These Terms are governed by the laws of Illinois, United States, without regard to conflict-of-law principles. Any dispute relating to these Terms or the app will be handled by the courts located in Sangamon County, Illinois, unless applicable consumer law requires a different location or procedure.',
    ],
  },
  {
    title: '18. Changes to These Terms',
    body: [
      'We may update these Terms when the application, our practices, or applicable requirements change. When changes are made, we will update the “Last Updated” date. For material changes, we may also provide notice within the app or through the email associated with an account. Continued use after updated Terms take effect means that you accept the revised Terms, except where applicable law requires a different form of consent.',
    ],
  },
]

function TermsPage() {
  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Legal</p>
        <h1 className="text-h2 font-bold text-heading">Terms of Service</h1>
        <p className="text-small leading-7 text-neutral-700">
          These Terms explain how you may use Sprout and the limits of the service. By creating an
          account or using the app, you agree to follow them.
        </p>
      </header>

      <div className="rounded-2xl border border-neutral-200 bg-surface-raised p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Effective date</p>
        <p className="mt-2 text-sm text-neutral-700">July 1, 2026</p>
        <p className="mt-2 text-sm text-neutral-700">Last updated: July 20, 2026</p>
      </div>

      {sections.map((section) => (
        <div
          key={section.title}
          className="rounded-2xl border border-neutral-200 bg-surface-app p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold text-heading">{section.title}</h2>
          <div className="mt-3 space-y-3 text-sm leading-7 text-neutral-700">
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      ))}

      <div className="rounded-2xl border border-neutral-200 bg-surface-raised p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-heading">Contact</h2>
        <p className="mt-3 text-sm leading-7 text-neutral-700">
          Support: support@sprout.example
          <br />
          Privacy: privacy@sprout.example
        </p>
      </div>

      <Link
        to="/privacy"
        className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
      >
        Read the Privacy Policy
      </Link>
    </section>
  )
}

export default TermsPage
