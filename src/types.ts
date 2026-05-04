export type SectionId =
  | 'client_progress'
  | 'communications'
  | 'custody'
  | 'platform'
  | 'department'
  | 'next_week'

export interface Section {
  id: SectionId
  label: string
  prefix: string
  subCategories?: SubCategory[]
}

export interface SubCategory {
  id: string
  label: string
}

export const SECTIONS: Section[] = [
  {
    id: 'client_progress',
    label: '本周主要客户进度',
    prefix: '一',
  },
  {
    id: 'communications',
    label: '本周内部及外部基金公司沟通',
    prefix: '二',
  },
  {
    id: 'custody',
    label: '托管交易分离',
    prefix: '三',
  },
  {
    id: 'platform',
    label: '平台建设进展',
    prefix: '四',
    subCategories: [
      { id: 'launched', label: '已上线/本周完成' },
      { id: 'developing', label: '开发/测试中' },
      { id: 'q2_plan', label: 'Q2重点功能规划' },
      { id: 'other', label: '其他' },
    ],
  },
  {
    id: 'department',
    label: '部门事项',
    prefix: '五',
    subCategories: [
      { id: 'ro', label: 'RO申请' },
      { id: 'nbi', label: 'NBI' },
      { id: 'npa', label: 'NPA' },
      { id: 'business', label: '部门业务' },
      { id: 'operation', label: '部门运营' },
      { id: 'pending', label: '待启动事项' },
    ],
  },
  {
    id: 'next_week',
    label: '下周工作计划',
    prefix: '六',
    subCategories: [
      { id: 'client_service', label: '客户服务' },
      { id: 'dept_matters', label: '部门事项' },
    ],
  },
]

export interface ReportEntry {
  id: string
  sectionId: SectionId
  subCategoryId?: string
  title?: string
  tag?: string
  content: string
  order: number
  createdAt: string
}

export interface WeekData {
  weekStart: string
  entries: ReportEntry[]
  exported: boolean
}
