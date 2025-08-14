export type Dialogue = {
  character: string
  text: string
  type: string
  isNarration?: boolean
}

export type Panel = {
  label?: string
  desc?: string
  fx?: string
  caption?: string
  endCaption?: string
  dialogue?: Dialogue[]
}

export type Page = {
  name?: string
  layout?: string | string[]
  panels: Panel[]
}

export type Chapter = {
  title?: string
  synopsis?: string
  credits?: string | string[]
  pages: Page[]
}