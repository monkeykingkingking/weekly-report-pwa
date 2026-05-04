import { useState } from 'react'
import { useReportStore } from '../stores/useReportStore'
import { SECTIONS } from '../types'
import type { SectionId } from '../types'

export function InputPanel() {
  const [activeSection, setActiveSection] = useState<SectionId>('client_progress')
  const [subCategoryId, setSubCategoryId] = useState<string>('')
  const [title, setTitle] = useState('')
  const [tag, setTag] = useState('')
  const [content, setContent] = useState('')
  const [expanded, setExpanded] = useState(false)
  const addEntry = useReportStore((s) => s.addEntry)

  const section = SECTIONS.find((s) => s.id === activeSection)!
  const needsTitle = activeSection === 'client_progress' || activeSection === 'communications'
  const hasSubCategories = !!section.subCategories

  const handleSubmit = () => {
    const trimmed = content.trim()
    if (!trimmed) return
    addEntry({
      sectionId: activeSection,
      subCategoryId: hasSubCategories ? subCategoryId || section.subCategories![0].id : undefined,
      title: needsTitle ? title.trim() || undefined : undefined,
      tag: needsTitle ? tag.trim() || undefined : undefined,
      content: trimmed,
    })
    setContent('')
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30">
      <div className="px-3 pt-2 pb-[env(safe-area-inset-bottom)]">
        {/* Toggle expand */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-xs text-gray-400 py-1"
        >
          {expanded ? '收起 ▼' : '展开更多选项 ▲'}
        </button>

        {expanded && (
          <div className="space-y-2 mb-2">
            {/* Section selector */}
            <div className="flex gap-1 flex-wrap">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setActiveSection(s.id); setSubCategoryId('') }}
                  className={`px-2 py-1 rounded text-xs ${
                    activeSection === s.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {s.prefix}、{s.label.slice(0, 4)}
                </button>
              ))}
            </div>

            {/* Sub-category selector */}
            {hasSubCategories && (
              <div className="flex gap-1 flex-wrap">
                {section.subCategories!.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSubCategoryId(sub.id)}
                    className={`px-2 py-1 rounded text-xs ${
                      (subCategoryId || section.subCategories![0].id) === sub.id
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-50 text-gray-500 border border-gray-200'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}

            {/* Title & Tag for client/communications */}
            {needsTitle && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="客户/部门名称"
                  className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-400"
                />
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="标签（如：平台下单）"
                  className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-400"
                />
              </div>
            )}
          </div>
        )}

        {/* Content input */}
        <div className="flex gap-2">
          <div className="flex-1 flex flex-col gap-1">
            {!expanded && (
              <div className="text-xs text-gray-400">
                {section.prefix}、{section.label}
                {hasSubCategories && subCategoryId && ` → ${section.subCategories!.find(s => s.id === subCategoryId)?.label || section.subCategories![0].label}`}
              </div>
            )}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
              placeholder="输入内容...（Shift+Enter 换行）"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="self-end px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-40 active:bg-blue-600"
          >
            添加
          </button>
        </div>
      </div>
    </div>
  )
}
