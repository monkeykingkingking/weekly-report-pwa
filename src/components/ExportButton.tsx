import { useState } from 'react'
import { useReportStore } from '../stores/useReportStore'
import { generateDocx } from '../utils/generateDocx'

export function ExportButton() {
  const [showSettings, setShowSettings] = useState(false)
  const [projectName, setProjectName] = useState(() => {
    return localStorage.getItem('report-project-name') || 'EAM'
  })
  const currentWeek = useReportStore((s) => s.currentWeek)
  const weeks = useReportStore((s) => s.weeks)
  const markExported = useReportStore((s) => s.markExported)
  const weekData = weeks[currentWeek]
  const entries = weekData?.entries || []

  const handleExport = async () => {
    if (entries.length === 0) return
    await generateDocx({
      projectName,
      weekStart: currentWeek,
      entries,
    })
    markExported()
  }

  const saveProjectName = (name: string) => {
    setProjectName(name)
    localStorage.setItem('report-project-name', name)
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur border-b border-gray-100 z-20">
      <div className="flex items-center justify-between px-4 py-2.5">
        <h1 className="text-lg font-bold text-gray-800">周报助手</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-3 py-1.5 text-sm text-gray-500 rounded-lg active:bg-gray-100"
          >
            设置
          </button>
          <button
            onClick={handleExport}
            disabled={entries.length === 0}
            className="px-3 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-lg disabled:opacity-40 active:bg-blue-600"
          >
            导出 Word
          </button>
        </div>
      </div>
      {showSettings && (
        <div className="px-4 pb-3 border-t border-gray-100 pt-2">
          <label className="text-xs text-gray-500 block mb-1">项目名称</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => saveProjectName(e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
            placeholder="例如：EAM"
          />
        </div>
      )}
    </div>
  )
}
