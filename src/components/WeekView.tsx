import { useReportStore, getWeekStart } from '../stores/useReportStore'
import { SECTIONS } from '../types'
import type { SectionId } from '../types'
import { ItemCard } from './ItemCard'

const sectionColors: Record<SectionId, string> = {
  client_progress: 'border-l-blue-400',
  communications: 'border-l-purple-400',
  custody: 'border-l-orange-400',
  platform: 'border-l-green-400',
  department: 'border-l-rose-400',
  next_week: 'border-l-cyan-400',
}

export function WeekView() {
  const currentWeek = useReportStore((s) => s.currentWeek)
  const setCurrentWeek = useReportStore((s) => s.setCurrentWeek)
  const weeks = useReportStore((s) => s.weeks)
  const weekData = weeks[currentWeek]
  const entries = weekData?.entries || []
  const weekList = Object.keys(weeks).sort().reverse()

  const thisWeek = getWeekStart()
  const isCurrentWeek = currentWeek === thisWeek

  const goToPrevWeek = () => {
    const d = new Date(currentWeek)
    d.setDate(d.getDate() - 7)
    setCurrentWeek(d.toISOString().slice(0, 10))
  }

  const goToNextWeek = () => {
    const d = new Date(currentWeek)
    d.setDate(d.getDate() + 7)
    setCurrentWeek(d.toISOString().slice(0, 10))
  }

  const weekEnd = new Date(currentWeek)
  weekEnd.setDate(weekEnd.getDate() + 6)
  const weekLabel = `${currentWeek.slice(5).replace('-', '/')} - ${weekEnd.toISOString().slice(5, 10).replace('-', '/')}`

  return (
    <div className="pb-44">
      {/* Week navigator */}
      <div className="flex items-center justify-between px-4 py-3 bg-white sticky top-12 z-10 border-b border-gray-100">
        <button onClick={goToPrevWeek} className="p-2 text-gray-500 active:text-blue-500 text-sm">
          ← 上周
        </button>
        <div className="text-center">
          <div className="text-sm font-semibold text-gray-800">{weekLabel}</div>
          {isCurrentWeek && <div className="text-xs text-blue-500">本周</div>}
          {weekData?.exported && <div className="text-xs text-green-500">已导出</div>}
        </div>
        <button onClick={goToNextWeek} className="p-2 text-gray-500 active:text-blue-500 text-sm">
          下周 →
        </button>
      </div>

      {/* History quick jump */}
      {weekList.length > 1 && (
        <div className="px-4 py-2 flex gap-2 overflow-x-auto">
          {weekList.slice(0, 8).map((w) => (
            <button
              key={w}
              onClick={() => setCurrentWeek(w)}
              className={`shrink-0 px-2.5 py-1 rounded-full text-xs ${
                w === currentWeek ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {w.slice(5).replace('-', '/')}
            </button>
          ))}
        </div>
      )}

      {/* Sections */}
      <div className="px-3 py-3 space-y-4">
        {SECTIONS.map((section) => {
          const sectionEntries = entries.filter((e) => e.sectionId === section.id)
          if (sectionEntries.length === 0) return null

          return (
            <div key={section.id} className={`border-l-4 ${sectionColors[section.id]} bg-white rounded-lg p-3 shadow-sm`}>
              <h3 className="text-sm font-bold text-gray-800 mb-2">
                {section.prefix}、{section.label}
              </h3>

              {section.subCategories ? (
                <div className="space-y-3">
                  {section.subCategories.map((sub) => {
                    const subEntries = sectionEntries
                      .filter((e) => e.subCategoryId === sub.id)
                      .sort((a, b) => a.order - b.order)
                    if (subEntries.length === 0) return null
                    return (
                      <div key={sub.id}>
                        <h4 className="text-xs font-semibold text-gray-500 mb-1.5">{sub.label}</h4>
                        <div className="space-y-1.5">
                          {subEntries.map((item) => (
                            <ItemCard key={item.id} item={item} />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {sectionEntries.sort((a, b) => a.order - b.order).map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {entries.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <p className="text-sm">本周暂无记录</p>
            <p className="text-xs mt-1">点击底部「展开更多选项」选择模块后添加内容</p>
          </div>
        )}
      </div>
    </div>
  )
}
