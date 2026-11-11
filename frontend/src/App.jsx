import { useCallback, useMemo, useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import Header from './components/Header.jsx'
import DisclaimerBanner from './components/DisclaimerBanner.jsx'
import UploadPanel from './components/UploadPanel.jsx'
import LoadingState from './components/LoadingState.jsx'
import ErrorState from './components/ErrorState.jsx'
import ReportSummary from './components/ReportSummary.jsx'
import RedFlagAlert from './components/RedFlagAlert.jsx'
import TestExplanationCard from './components/TestExplanationCard.jsx'
import TestDrawer from './components/TestDrawer.jsx'
import DoctorQuestions from './components/DoctorQuestions.jsx'
import HealthDashboard from './components/HealthDashboard.jsx'
import KnowledgeAssistant from './components/KnowledgeAssistant.jsx'
import Glossary from './components/Glossary.jsx'
import Landing from './components/Landing.jsx'
import { analyzeReport } from './api/client.js'
import useAsync from './hooks/useAsync.js'
import { ANALYZE_STAGES, ERROR_MESSAGES, SAMPLE_REPORTS } from './utils/constants.js'
import { sortByConcern } from './utils/format.js'
import { TERM_REGEX, findEntry } from './utils/glossary.js'

/**
 * Root component. All state lives here and in memory only (never localStorage, for privacy):
 *  - reports:      analysed report per language, e.g. { en: {...}, hi: {...} } — a cache, so
 *                  switching language back and forth only calls the AI once per language
 *  - language:     which language's report is shown
 *  - drawerTestId: the test whose detail drawer is open
 *  - addedQuestions: doctor questions the person added from the drawer
 *  - pendingQuestion: a question to send to the Ask tab (from the drawer or glossary)
 */
export default function App() {
  const [showLanding, setShowLanding] = useState(true)
  const [activeTab, setActiveTab] = useState('report')
  const [reports, setReports] = useState({})
  const [language, setLanguage] = useState('en')
  const [translating, setTranslating] = useState(false)
  const [translateError, setTranslateError] = useState('')
  const [chatMessages, setChatMessages] = useState([])
  const [drawerTestId, setDrawerTestId] = useState(null)
  const [addedQuestions, setAddedQuestions] = useState([])
  const [pendingQuestion, setPendingQuestion] = useState(null)
  const analyze = useAsync(analyzeReport)
  // The last upload, so "Try again" and the language switch can resend it.
  const lastRequest = useRef(null)

  const report = reports[language] ?? reports.en ?? null

  const handleAnalyze = useCallback(
    async (file, readingLevel) => {
      lastRequest.current = { file, readingLevel }
      const result = await analyze.run(file, readingLevel, 'en')
      if (result) {
        setReports({ en: result })
        setLanguage('en')
        setAddedQuestions([])
        setTranslateError('')
      }
    },
    [analyze],
  )

  /** Switch the explanation language. Uses the cached result if we already have it. */
  async function changeLanguage(lang) {
    setTranslateError('')
    if (reports[lang] || !lastRequest.current) {
      setLanguage(lang)
      return
    }
    setTranslating(true)
    try {
      const { file, readingLevel } = lastRequest.current
      const result = await analyzeReport(file, readingLevel, lang)
      setReports((r) => ({ ...r, [lang]: result }))
      setLanguage(lang)
    } catch (err) {
      setTranslateError(ERROR_MESSAGES[err?.code] ?? err?.message ?? 'Translation failed.')
    } finally {
      setTranslating(false)
    }
  }

  function retry() {
    if (lastRequest.current)
      handleAnalyze(lastRequest.current.file, lastRequest.current.readingLevel)
  }

  function startOver() {
    analyze.reset()
    setReports({})
    setLanguage('en')
    setAddedQuestions([])
    setDrawerTestId(null)
    lastRequest.current = null
    setActiveTab('report')
  }

  function openApp(tab = 'report') {
    setActiveTab(tab)
    setShowLanding(false)
    window.scrollTo(0, 0)
  }

  function goHome() {
    setShowLanding(true)
    window.scrollTo(0, 0)
  }

  /** Send a question to the Ask tab and switch to it. */
  function askInChat(question) {
    setDrawerTestId(null)
    setPendingQuestion(question)
    setActiveTab('ask')
  }

  const addQuestion = (q) => setAddedQuestions((list) => (list.includes(q) ? list : [...list, q]))
  const removeQuestion = (q) => setAddedQuestions((list) => list.filter((x) => x !== q))
  const closeDrawer = useCallback(() => setDrawerTestId(null), [])
  const openDrawer = (test) => setDrawerTestId(test.id)

  const drawerTest = report?.tests.find((t) => t.id === drawerTestId) ?? null

  // Glossary terms that appear in the current report (for "Only terms in my report").
  const reportTerms = useMemo(() => {
    if (!report) return new Set()
    const text = report.tests.map((t) => t.name).join(' ') + ' ' + report.summary.overview
    const found = new Set()
    for (const m of text.matchAll(TERM_REGEX)) {
      const entry = findEntry(m[0])
      if (entry) found.add(entry.term)
    }
    return found
  }, [report])

  if (showLanding) return <Landing onOpen={openApp} />

  return (
    <div className="app">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasReport={report !== null}
        onHome={goHome}
      />
      <DisclaimerBanner />
      <main className="main">
        <section
          id="panel-report"
          role="tabpanel"
          aria-labelledby="tab-report"
          hidden={activeTab !== 'report'}
        >
          {report ? (
            <ReportView
              report={report}
              language={language}
              onLanguage={changeLanguage}
              translating={translating}
              translateError={translateError}
              onOpen={openDrawer}
              addedQuestions={addedQuestions}
              onRemoveQuestion={removeQuestion}
              onStartOver={startOver}
            />
          ) : analyze.loading ? (
            <div className="card">
              <LoadingState messages={ANALYZE_STAGES} />
            </div>
          ) : (
            <>
              {analyze.error && (
                <ErrorState error={analyze.error} onRetry={retry}>
                  {analyze.error.code === 'SCANNED_PDF_UNSUPPORTED' && (
                    <p className="small">
                      Tip: try one of the sample reports below, such as the{' '}
                      {SAMPLE_REPORTS[0].label.toLowerCase()} sample.
                    </p>
                  )}
                </ErrorState>
              )}
              <UploadPanel onAnalyze={handleAnalyze} disabled={analyze.loading} />
            </>
          )}
        </section>

        <section
          id="panel-dashboard"
          role="tabpanel"
          aria-labelledby="tab-dashboard"
          hidden={activeTab !== 'dashboard'}
        >
          {report && <HealthDashboard report={report} onOpen={openDrawer} />}
        </section>

        <section
          id="panel-ask"
          role="tabpanel"
          aria-labelledby="tab-ask"
          hidden={activeTab !== 'ask'}
        >
          <KnowledgeAssistant
            report={report}
            messages={chatMessages}
            setMessages={setChatMessages}
            pendingQuestion={pendingQuestion}
            onPendingHandled={() => setPendingQuestion(null)}
          />
        </section>

        <section
          id="panel-glossary"
          role="tabpanel"
          aria-labelledby="tab-glossary"
          hidden={activeTab !== 'glossary'}
        >
          <Glossary onAsk={askInChat} reportTerms={reportTerms} />
        </section>
      </main>

      {drawerTest && (
        <TestDrawer
          test={drawerTest}
          onClose={closeDrawer}
          onAsk={askInChat}
          onAddQuestion={addQuestion}
          addedQuestions={new Set([...report.doctor_questions, ...addedQuestions])}
        />
      )}
    </div>
  )
}

/** Everything shown on the Report tab once a report has been analysed. */
function ReportView({
  report,
  language,
  onLanguage,
  translating,
  translateError,
  onOpen,
  addedQuestions,
  onRemoveQuestion,
  onStartOver,
}) {
  const tests = sortByConcern(report.tests)
  return (
    <div className="stack">
      <RedFlagAlert flags={report.red_flags} />
      <ReportSummary
        report={report}
        language={language}
        onLanguage={onLanguage}
        translating={translating}
        translateError={translateError}
      />

      <section className="card no-print" aria-labelledby="tests-title">
        <h2 id="tests-title">Your results explained</h2>
        <p className="muted small">
          Results outside the lab&apos;s range are listed first. Select a result for the full
          explanation, related reading and questions for your doctor.
        </p>
        <div className="test-list" lang={report.language ?? 'en'}>
          {tests.map((t) => (
            <TestExplanationCard key={t.id} test={t} onOpen={onOpen} />
          ))}
        </div>
        {report.unparsed_lines.length > 0 && (
          <details className="unparsed">
            <summary>
              Some results couldn&apos;t be read automatically ({report.unparsed_lines.length})
            </summary>
            <ul>
              {report.unparsed_lines.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </details>
        )}
      </section>

      <DoctorQuestions report={report} added={addedQuestions} onRemove={onRemoveQuestion} />

      <p className="disclaimer-footer small print-keep">{report.disclaimer}</p>

      <div className="no-print">
        <button type="button" className="btn btn--secondary" onClick={onStartOver}>
          <RotateCcw size={16} aria-hidden="true" /> Analyze another report
        </button>
      </div>
    </div>
  )
}
