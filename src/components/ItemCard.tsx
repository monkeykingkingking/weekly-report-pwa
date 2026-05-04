import { useState } from 'react'
import { useReportStore } from '../stores/useReportStore'
import type { ReportEntry } from '../types'

export function ItemCard({ item }: { item: ReportEntry }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(item.content)
  const removeEntry = useReportStore((s) => s.removeEntry)
  const updateEntry = useReportStore((s) => s.updateEntry)
  const reorderEntry = useReportStore((s) => s.reorderEntry)

  const handleSave = () => {
    const trimmed = text.trim()
    if (trimmed) updateEntry(item.id, { content: trimmed })
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="bg-white rounded-lg p-2 border border-blue-300">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleSave}
          autoFocus
          rows={3}
          className="w-full text-sm px-2 py-1 border border-gray-200 rounded focus:outline-none resize-none"
        />
      </div>
    )
  }

  return (
    <div className="flex items-start gap-1 bg-white rounded-lg p-2 border border-gray-100 shadow-sm">
      <div className="flex-1 min-w-0">
        {item.title && (
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-xs font-semibold text-gray-700">{item.title}</span>
            {item.tag && <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">{item.tag}</span>}
          </div>
        )}
        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">{item.content}</p>
      </div>
      <div className="flex flex-col gap-0.5 shrink-0">
        <button onClick={() => reorderEntry(item.id, 'up')} className="text-xs text-gray-400 px-1">↑</button>
        <button onClick={() => reorderEntry(item.id, 'down')} className="text-xs text-gray-400 px-1">↓</button>
        <button onClick={() => { setText(item.content); setEditing(true) }} className="text-xs text-blue-500 px-1">编辑</button>
        <button onClick={() => removeEntry(item.id)} className="text-xs text-red-400 px-1">删</button>
      </div>
    </div>
  )
}
