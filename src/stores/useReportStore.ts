import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ReportEntry, WeekData } from '../types'

function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().slice(0, 10)
}

interface ReportStore {
  weeks: Record<string, WeekData>
  currentWeek: string
  setCurrentWeek: (week: string) => void
  addEntry: (entry: Omit<ReportEntry, 'id' | 'order' | 'createdAt'>) => void
  removeEntry: (id: string) => void
  updateEntry: (id: string, updates: Partial<Pick<ReportEntry, 'title' | 'tag' | 'content'>>) => void
  reorderEntry: (id: string, direction: 'up' | 'down') => void
  markExported: () => void
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export const useReportStore = create<ReportStore>()(
  persist(
    (set, get) => ({
      weeks: {},
      currentWeek: getWeekStart(),

      setCurrentWeek: (week) => set({ currentWeek: week }),

      addEntry: (entry) => {
        const week = get().currentWeek
        const weeks = { ...get().weeks }
        if (!weeks[week]) {
          weeks[week] = { weekStart: week, entries: [], exported: false }
        }
        const existing = weeks[week].entries.filter(
          (e) => e.sectionId === entry.sectionId && e.subCategoryId === entry.subCategoryId
        )
        weeks[week] = {
          ...weeks[week],
          entries: [
            ...weeks[week].entries,
            {
              ...entry,
              id: genId(),
              order: existing.length,
              createdAt: new Date().toISOString(),
            },
          ],
        }
        set({ weeks })
      },

      removeEntry: (id) => {
        const week = get().currentWeek
        const weeks = { ...get().weeks }
        if (!weeks[week]) return
        weeks[week] = {
          ...weeks[week],
          entries: weeks[week].entries.filter((e) => e.id !== id),
        }
        set({ weeks })
      },

      updateEntry: (id, updates) => {
        const week = get().currentWeek
        const weeks = { ...get().weeks }
        if (!weeks[week]) return
        weeks[week] = {
          ...weeks[week],
          entries: weeks[week].entries.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        }
        set({ weeks })
      },

      reorderEntry: (id, direction) => {
        const week = get().currentWeek
        const weeks = { ...get().weeks }
        if (!weeks[week]) return
        const entries = [...weeks[week].entries]
        const idx = entries.findIndex((e) => e.id === id)
        if (idx < 0) return
        const entry = entries[idx]
        const siblings = entries
          .filter((e) => e.sectionId === entry.sectionId && e.subCategoryId === entry.subCategoryId)
          .sort((a, b) => a.order - b.order)
        const sibIdx = siblings.findIndex((e) => e.id === id)
        const swapIdx = direction === 'up' ? sibIdx - 1 : sibIdx + 1
        if (swapIdx < 0 || swapIdx >= siblings.length) return
        const swapEntry = siblings[swapIdx]
        weeks[week] = {
          ...weeks[week],
          entries: entries.map((e) => {
            if (e.id === id) return { ...e, order: swapEntry.order }
            if (e.id === swapEntry.id) return { ...e, order: entry.order }
            return e
          }),
        }
        set({ weeks })
      },

      markExported: () => {
        const week = get().currentWeek
        const weeks = { ...get().weeks }
        if (!weeks[week]) return
        weeks[week] = { ...weeks[week], exported: true }
        set({ weeks })
      },
    }),
    { name: 'weekly-report-storage' }
  )
)

export { getWeekStart }
