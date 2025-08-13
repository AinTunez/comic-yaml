import { Chapter, Page, Panel, Dialogue } from "./types"

export const renderDescription = (description: string): string => {
  return `*${(description || "").replace(/\s+/g, " ").trim()}*`
}

export const renderDialogue = (dialogue: Dialogue): string => {
  const text = (dialogue.text || "").replace(/\s+/g, " ").trim()
  const character = dialogue.character || "Character"
  const type = dialogue.type || "speech"
  
  // Handle narration (either by isNarration flag or type)
  if (dialogue.isNarration || type === "narration") {
    return `*${text}*`
  }
  
  // Handle sound effects
  if (type === "sound_effect") {
    return `**${text}**`
  }
  
  // Handle normal speech
  if (type === "speech") {
    return `**${character.toUpperCase()}:** ${text}`
  }
  
  // Handle special speech types (whisper, thought, etc.)
  return `**${character.toUpperCase()}:** (${type}) ${text}`
}

export const renderPanel = (panel: Panel, panelIndex?: number): string => {
  if (!panel || typeof panel !== "object") {
    return "### Error: Invalid panel data"
  }
  
  const panelNumber = panelIndex !== undefined ? panelIndex + 1 : 1
  const title = panel.name 
    ? `(Panel ${panelNumber}) ${panel.name}`
    : `(Panel ${panelNumber})`
  const parts: string[] = [`### ${title}`]
  
  if (panel.desc) {
    parts.push(renderDescription(panel.desc))
  }
  
  if (panel.fx) {
    parts.push(`**FX:** ${String(panel.fx || "").replace(/\s+/g, " ").trim()}`)
  }
  
  const blockquoteContent: string[] = []
  
  if (panel.caption) {
    const caption = `CAPTION: ${String(panel.caption || "").replace(/\s+/g, " ").trim()}`
    blockquoteContent.push(`*${caption}*`)
  }
  
  if (panel.dialogue && Array.isArray(panel.dialogue) && panel.dialogue.length > 0) {
    const dialogueLines = panel.dialogue.map(renderDialogue)
    blockquoteContent.push(...dialogueLines)
  }
  
  if (panel.endCaption) {
    const endCaption = `END CAPTION: ${String(panel.endCaption || "").replace(/\s+/g, " ").trim()}`
    blockquoteContent.push(`*${endCaption}*`)
  }
  
  if (blockquoteContent.length > 0) {
    const dialogueBlock = `> ${blockquoteContent.join("\n> ")}`
    parts.push(dialogueBlock)
  }
  
  return parts.join("\n\n")
}

export const renderPage = (page: Page, pageIndex?: number): string => {
  if (!page || !Array.isArray(page.panels)) {
    return "## Error: Invalid page data"
  }
  
  const pageNumber = pageIndex !== undefined ? pageIndex + 1 : 1
  const title = page.name 
    ? `(Page ${pageNumber}) ${page.name}`
    : `(Page ${pageNumber})`
  const parts: string[] = [`## ${title}`]
  
  if (page.panels.length > 0) {
    parts.push(...page.panels.map((panel, index) => renderPanel(panel, index)))
  }
  
  return parts.join("\n\n")
}

export const renderChapter = (chapter: Chapter): string => {
  if (!chapter || typeof chapter !== "object") {
    return "# Error: Invalid chapter data"
  }
  
  const parts: string[] = []
  
  // Only add title if it exists
  if (chapter.title && typeof chapter.title === "string") {
    parts.push(`# ${chapter.title}`)
  }
  
  if (chapter.synopsis) {
    parts.push(`**Synopsis:** ${chapter.synopsis}`)
  }
  
  if (chapter.credits) {
    if (Array.isArray(chapter.credits)) {
      const creditsList = chapter.credits.filter(credit => credit != null).map(credit => `- ${String(credit).trim()}`).join("\n")
      parts.push(`**Credits:**\n${creditsList}`)
    } else {
      const creditsList = String(chapter.credits).split(",").map(credit => `- ${credit.trim()}`).join("\n")
      parts.push(`**Credits:**\n${creditsList}`)
    }
  }
  
  if (chapter.pages.length > 0) {
    parts.push(...chapter.pages.map((page, index) => renderPage(page, index)))
  }
  
  return parts.join("\n\n")
}