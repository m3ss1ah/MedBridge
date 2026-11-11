import { fireEvent, render, screen } from '@testing-library/react'
import GlossaryText from '../components/GlossaryText.jsx'
import Glossary from '../components/Glossary.jsx'
import DonutChart from '../components/DonutChart.jsx'
import TestDrawer from '../components/TestDrawer.jsx'
import { buildVisitSummary } from '../utils/visitSummary.js'
import { askQuestionFor } from '../utils/chat.js'

const hb = {
  id: 't1',
  name: 'Haemoglobin',
  category: 'Red Blood Cells',
  value_raw: '10.8',
  value: 10.8,
  unit: 'g/dL',
  reference_range_raw: '12.0 - 15.5',
  ref_low: 12,
  ref_high: 15.5,
  lab_flag: 'L',
  status: 'low',
  explanation: {
    what_it_measures: 'Haemoglobin carries oxygen.',
    what_your_result_means: 'Below the range.',
    common_reasons: 'Many causes, such as low iron.',
    range_note: null,
  },
  related: {
    passages: [
      {
        id: 1,
        title: 'Haemoglobin (Hb)',
        section: 'What it measures',
        source_name: 'MedlinePlus',
        source_url: 'https://medlineplus.gov/x',
        snippet: 'Haemoglobin is a protein…',
        score: 0.7,
      },
    ],
    doctor_questions: ['Do I need iron studies?'],
  },
}

describe('GlossaryText', () => {
  it('underlines only the first mention of a term and links a tooltip', () => {
    render(<GlossaryText text="Your LDL is high. LDL is often called bad cholesterol." />)
    const words = screen.getAllByRole('button', { name: 'LDL' })
    expect(words).toHaveLength(1)
    const tip = document.getElementById(words[0].getAttribute('aria-describedby'))
    expect(tip).toHaveTextContent(/low-density lipoprotein/i)
  })
})

describe('Glossary', () => {
  it('filters by search and sends a question to the assistant', () => {
    const onAsk = vi.fn()
    render(<Glossary onAsk={onAsk} />)
    fireEvent.change(screen.getByLabelText('Search the glossary'), {
      target: { value: 'ferritin' },
    })
    expect(screen.getByText('1 terms')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Ask about Ferritin/ }))
    expect(onAsk).toHaveBeenCalledWith('What is Ferritin?')
  })
})

it('DonutChart describes results in range', () => {
  render(
    <DonutChart counts={{ total: 9, normal: 7, low: 0, high: 2, borderline: 0, unknown: 0 }} />,
  )
  expect(screen.getByRole('img')).toHaveAttribute(
    'aria-label',
    expect.stringContaining('7 of 9 results in range'),
  )
})

describe('TestDrawer', () => {
  it('shows related passages, adds questions and closes on Escape', () => {
    const onClose = vi.fn()
    const onAdd = vi.fn()
    const onAsk = vi.fn()
    render(
      <TestDrawer
        test={hb}
        onClose={onClose}
        onAsk={onAsk}
        onAddQuestion={onAdd}
        addedQuestions={new Set()}
      />,
    )
    expect(screen.getByRole('dialog', { name: 'Haemoglobin' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /MedlinePlus/ })).toHaveAttribute('target', '_blank')
    fireEvent.click(screen.getByRole('button', { name: /Add to my questions/ }))
    expect(onAdd).toHaveBeenCalledWith('Do I need iron studies?')
    fireEvent.click(screen.getByRole('button', { name: 'What does low Haemoglobin mean?' }))
    expect(onAsk).toHaveBeenCalledWith('What does low Haemoglobin mean?')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })
})

it('askQuestionFor phrases by status', () => {
  expect(askQuestionFor(hb)).toBe('What does low Haemoglobin mean?')
  expect(askQuestionFor({ ...hb, status: 'normal' })).toBe('What is Haemoglobin?')
})

it('buildVisitSummary lists results out of range first, with questions', () => {
  const report = {
    report_type: 'CBC',
    patient_context: { lab_name: 'Sample Lab', report_date: '2026-10-02' },
    summary: { overview: 'Overview text.' },
    tests: [{ ...hb, id: 't2', name: 'MCV', status: 'normal', value_raw: '85', unit: 'fL' }, hb],
    disclaimer: 'Educational only.',
  }
  const text = buildVisitSummary(report, ['Q one?'])
  expect(text.indexOf('Haemoglobin')).toBeLessThan(text.indexOf('MCV'))
  expect(text).toContain('1. Q one?')
  expect(text).toContain('Educational only.')
})
