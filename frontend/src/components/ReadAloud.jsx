import { useEffect, useState } from 'react'
import { Volume2, Square } from 'lucide-react'

/**
 * Reads text out loud with the browser's built-in speech (Web Speech API).
 * Helpful for older relatives and for people who find reading hard (persona P3).
 * Hidden automatically in browsers without speech support.
 *
 * @param {{ text: string, lang?: string }} props  lang: 'en' or 'hi'
 */
export default function ReadAloud({ text, lang = 'en' }) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [speaking, setSpeaking] = useState(false)

  // Stop talking if the component goes away (e.g. switching tabs or reports).
  useEffect(() => () => supported && window.speechSynthesis.cancel(), [supported])

  if (!supported) return null

  function toggle() {
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
    utterance.rate = 0.95
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
    setSpeaking(true)
  }

  return (
    <button type="button" className="btn btn--secondary btn--small" onClick={toggle}>
      {speaking ? (
        <Square size={15} aria-hidden="true" />
      ) : (
        <Volume2 size={16} aria-hidden="true" />
      )}
      {speaking ? 'Stop reading' : 'Listen'}
    </button>
  )
}
