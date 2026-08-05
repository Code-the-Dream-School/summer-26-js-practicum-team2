import { Link } from 'react-router'

const sections = [
  {
    title: '1. Information We Collect',
    body: [
      'Sprout is a financial-literacy learning application operated by Counting Cents & Making Sense. This Privacy Policy explains what information we collect, how we use it, how we protect it, and the choices available to users and parents or legal guardians.',
      'Account information may include an email address, display name or username, password or authentication credentials, age or age range, learning goals, experience level, and other profile information you choose to share.',
      'We may also collect learning and progress information, including lessons started or completed, quiz answers and scores, progress, points or experience earned, streaks, badges, achievements, selected learning goals, and recommended or unlocked lessons.',
      'Our app and hosting providers may automatically receive limited technical information such as IP address, browser or device type, operating system, date and time of access, and error or security logs. We do not use this information for targeted advertising.',
    ],
  },
  {
    title: '2. Financial Information',
    body: [
      'Sprout is an educational application. We do not ask users to provide bank account numbers, credit-card numbers, income information, Social Security numbers, investment-account information, or other personal financial records.',
      'Users should not enter real financial-account information into lesson answers, quizzes, usernames, profile fields, or other parts of the application.',
    ],
  },
  {
    title: '3. How We Use Information',
    body: [
      'We use collected information to create and manage accounts, save lesson and quiz progress, personalize learning paths, award points and achievements, recommend lessons, provide educational feedback, maintain and improve the app, protect security, respond to user questions, and meet legal obligations.',
      'We do not use personal information to provide individualized financial, investment, tax, credit, or legal advice.',
    ],
  },
  {
    title: '4. Children’s Privacy',
    body: [
      'Sprout is designed for users of different ages, including children.',
      'Before collecting personal information from a child under 13, we will request parental or guardian consent when required by law. Parents or guardians may review, correct, or delete their child’s information, withdraw consent, or refuse further collection or use.',
      'If we learn that we collected personal information from a child under 13 without appropriate parental consent, we will delete or restrict that information as required.',
    ],
  },
  {
    title: '5. How We Share Information',
    body: [
      'We do not sell or rent personal information. We may share limited information with service providers that help us host the app, store data, authenticate users, send email, provide analytics, and monitor errors. Each provider receives only the information reasonably needed to perform its service on our behalf.',
      'We may also disclose information when reasonably necessary to comply with law, protect safety and rights, investigate fraud or misuse, or enforce our rules and agreements.',
    ],
  },
  {
    title: '6. Advertising and Data Sales',
    body: [
      'Sprout does not sell personal information. We do not use personal information collected from children for targeted advertising, behavioral advertising, or profiling for advertising purposes.',
      'Unless this policy is updated, the application does not display third-party targeted advertisements.',
    ],
  },
  {
    title: '7. Data Retention',
    body: [
      'We retain personal information only as long as reasonably necessary to provide features, maintain accounts and progress, meet legal obligations, resolve disputes, and protect the app from misuse or security threats.',
      'When information is no longer reasonably necessary, we will delete it, anonymize it, or securely restrict its use. Users and parents may request account deletion by contacting us at the email listed below.',
    ],
  },
  {
    title: '8. Data Security',
    body: [
      'We use reasonable administrative, technical, and organizational safeguards designed to protect personal information. These may include encrypted connections, secure authentication, restricted database access, password hashing, updates, access logging, and backups.',
      'No internet service or storage system can guarantee complete security. Users should use a strong password and should not share account credentials.',
    ],
  },
  {
    title: '9. User Choices and Rights',
    body: [
      'Depending on location, users or their parents may have the right to access personal information, correct inaccurate information, request deletion, withdraw consent, object to or restrict certain uses, request a copy of their information, and close an account.',
      'Requests may be sent to the contact email below. We may need to verify identity or authority before completing a request.',
    ],
  },
  {
    title: '10. Educational Content Disclaimer',
    body: [
      'The application’s lessons, quizzes, examples, and recommendations are provided for general educational purposes. The app does not provide personalized financial, legal, tax, investment, or credit advice. Users should consult an appropriate qualified professional before making significant financial decisions.',
    ],
  },
  {
    title: '11. Third-Party Links',
    body: [
      'The application may contain links to educational resources or third-party websites. We do not control the privacy, security, or content practices of third-party services. Users and parents should review those policies before providing personal information.',
    ],
  },
  {
    title: '12. Changes to This Privacy Policy',
    body: [
      'We may update this Privacy Policy as the application changes. When material changes are made, we will update the “Last Updated” date and provide additional notice when appropriate. When required, we will obtain new parental consent before making material changes to how a child’s personal information is collected, used, or disclosed.',
    ],
  },
  {
    title: '13. Contact Us',
    body: [
      'Questions, concerns, parental requests, or privacy-rights requests may be directed to the application operator at the email address below. Parents or guardians should include enough information for us to identify the appropriate child account, but they should not email passwords, Social Security numbers, financial-account numbers, or other highly sensitive information.',
    ],
  },
]

function PrivacyPage() {
  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Legal</p>
        <h1 className="text-h2 font-bold text-heading">Privacy Policy</h1>
        <p className="text-small leading-7 text-neutral-700">
          Sprout is a financial-literacy learning application operated by Counting Cents & Making
          Sense. This policy explains how we collect, use, share, and protect information.
        </p>
      </header>

      <div className="rounded-2xl border border-neutral-200 bg-surface-raised p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Last updated</p>
        <p className="mt-2 text-sm text-neutral-700">July 20, 2026</p>
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
          Application: Sprout
          <br />
          Operator: Counting Cents & Making Sense
          <br />
          Email: privacy@sprout.example
          <br />
          Mailing Address: 123 Learning Lane, Suite 400, Springfield, IL 62704
        </p>
      </div>

      <Link
        to="/terms"
        className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
      >
        Read the Terms of Service
      </Link>
    </section>
  )
}

export default PrivacyPage
