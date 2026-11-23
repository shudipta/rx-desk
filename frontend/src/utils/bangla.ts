// Bangla helpers for what the patient reads. Dosage is stored with ASCII
// digits ("1+0+1") so it stays easy to parse; it is shown in Bangla digits.

export const bnFont = "'Noto Sans Bengali', 'Kohinoor Bangla', 'Bangla Sangam MN', 'Nirmala UI', 'Vrinda', sans-serif"

const BN_DIGITS = '০১২৩৪৫৬৭৮৯'

/** "1+0+1" → "১+০+১" */
export const toBnDigits = (s: string) => s.replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)])

const UNITS: Record<string, string> = {
  day: 'দিন',
  days: 'দিন',
  week: 'সপ্তাহ',
  weeks: 'সপ্তাহ',
  month: 'মাস',
  months: 'মাস',
  year: 'বছর',
  years: 'বছর',
}

/**
 * Duration for the printout. Older prescriptions saved English ("3 months",
 * "Ongoing"); those print in Bangla too. Anything else keeps its text, with
 * Bangla digits.
 */
export function bnDuration(s: string): string {
  const t = s.trim()
  if (/^(ongoing|continue)$/i.test(t)) return 'চলবে'
  const m = /^(\d+(?:\.\d+)?)\s*([a-z]+)$/i.exec(t)
  if (m && UNITS[m[2].toLowerCase()]) return `${toBnDigits(m[1])} ${UNITS[m[2].toLowerCase()]}`
  return toBnDigits(t)
}

/** Follow-up for the printout: "3 Months" (older English) → "৩ মাস পর"; Bangla text is kept. */
export function bnFollowup(s: string): string {
  const t = s.trim()
  const m = /^(\d+(?:\.\d+)?)\s*([a-z]+)$/i.exec(t)
  if (m && UNITS[m[2].toLowerCase()]) return `${bnDuration(t)} পর`
  return toBnDigits(t)
}
