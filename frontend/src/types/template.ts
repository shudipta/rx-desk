export interface FavoriteMedicine {
  id: number
  name: string
}

export interface FavoriteTest {
  id: number
  name: string
}

export interface AdviceTemplate {
  id: number
  title: string
  content: string
}

export interface FollowupTemplate {
  id: number
  title: string
  value: string
}

/** cc = chief complaint, ph = past history, oe = on examination, dx = diagnosis */
export type ClinicalSection = 'cc' | 'ph' | 'oe' | 'dx'

/** A one-click quick pick. Text ending in ":" (e.g. "BP:") is a prefix the doctor completes. */
export interface ClinicalTemplate {
  id: number
  section: ClinicalSection
  text: string
}
