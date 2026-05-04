import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  convertInchesToTwip,
} from 'docx'
import { saveAs } from 'file-saver'
import { SECTIONS } from '../types'
import type { ReportEntry, SectionId } from '../types'

interface ExportOptions {
  projectName: string
  weekStart: string
  entries: ReportEntry[]
}

function formatDate(weekStart: string): string {
  const d = new Date(weekStart)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 4)
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${weekEnd.getDate()} 日`
}

function getEntriesForSection(entries: ReportEntry[], sectionId: SectionId, subCategoryId?: string) {
  return entries
    .filter((e) => e.sectionId === sectionId && (!subCategoryId || e.subCategoryId === subCategoryId))
    .sort((a, b) => a.order - b.order)
}

export async function generateDocx({ projectName, weekStart, entries }: ExportOptions) {
  const paragraphs: Paragraph[] = []

  // Title
  paragraphs.push(
    new Paragraph({
      children: [new TextRun({ text: `${projectName} 项目周报`, bold: true, size: 44, font: 'Microsoft YaHei' })],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.LEFT,
      spacing: { after: 100 },
    })
  )

  // Date
  paragraphs.push(
    new Paragraph({
      children: [new TextRun({ text: `报告日期：${formatDate(weekStart)}`, size: 22, color: '666666', font: 'Microsoft YaHei' })],
      spacing: { after: 300 },
    })
  )

  // Process each section
  for (const section of SECTIONS) {
    const sectionEntries = entries.filter((e) => e.sectionId === section.id)
    if (sectionEntries.length === 0) continue

    // Section heading with bottom border
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: `${section.prefix}、${section.label}`, bold: true, size: 32, color: '1F4E79', font: 'Microsoft YaHei' })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '4472C4' } },
      })
    )

    if (section.subCategories) {
      // Sections with sub-categories
      for (const sub of section.subCategories) {
        const subEntries = getEntriesForSection(entries, section.id, sub.id)
        if (subEntries.length === 0) continue

        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: sub.label, bold: true, size: 26, color: '1F4E79', font: 'Microsoft YaHei' })],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          })
        )

        for (const entry of subEntries) {
          paragraphs.push(
            new Paragraph({
              bullet: { level: 0 },
              children: [new TextRun({ text: entry.content, size: 22, font: 'Microsoft YaHei' })],
              spacing: { after: 60 },
              indent: { left: convertInchesToTwip(0.3) },
            })
          )
        }
      }
    } else if (section.id === 'client_progress' || section.id === 'communications') {
      // Group by title
      const grouped = new Map<string, ReportEntry[]>()
      for (const entry of sectionEntries.sort((a, b) => a.order - b.order)) {
        const key = entry.title || '其他'
        if (!grouped.has(key)) grouped.set(key, [])
        grouped.get(key)!.push(entry)
      }

      let idx = 0
      for (const [title, items] of grouped) {
        idx++
        const firstItem = items[0]
        const tagText = firstItem.tag ? `—${firstItem.tag}` : ''
        const numLabel = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'][idx - 1] || String(idx)

        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: `（${numLabel}）${title}${tagText}`, bold: true, size: 26, font: 'Microsoft YaHei' })],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          })
        )

        for (const entry of items) {
          const lines = entry.content.split('\n')
          for (const line of lines) {
            if (!line.trim()) continue
            paragraphs.push(
              new Paragraph({
                children: [new TextRun({ text: line.trim(), size: 22, font: 'Microsoft YaHei' })],
                spacing: { after: 60 },
                indent: { firstLine: convertInchesToTwip(0.3) },
              })
            )
          }
        }
      }
    } else {
      // Simple section (like custody)
      for (const entry of sectionEntries.sort((a, b) => a.order - b.order)) {
        const lines = entry.content.split('\n')
        for (const line of lines) {
          if (!line.trim()) continue
          paragraphs.push(
            new Paragraph({
              children: [new TextRun({ text: line.trim(), size: 22, font: 'Microsoft YaHei' })],
              spacing: { after: 60 },
              indent: { firstLine: convertInchesToTwip(0.3) },
            })
          )
        }
      }
    }
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left: convertInchesToTwip(1.2),
            right: convertInchesToTwip(1.2),
          },
        },
      },
      children: paragraphs,
    }],
  })

  const blob = await Packer.toBlob(doc)
  const dateStr = weekStart.replace(/-/g, '').slice(4)
  const fileName = `${projectName} 项目周报${dateStr}.docx`
  saveAs(blob, fileName)
}
