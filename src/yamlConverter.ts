import * as yaml from "js-yaml"
import { Chapter, Page, Panel } from "./types"

export const yamlToChapter = (yamlString: string): Chapter => {
  try {
    const data = yaml.load(yamlString) as any
    
    if (!data || typeof data !== "object") {
      throw new Error("Invalid YAML: not a valid object")
    }
    
    const chapter: Chapter = {
      pages: []
    }
    
    // Only add title if it exists
    if (data.title && typeof data.title === "string") {
      chapter.title = data.title
    }
    
    if (data.synopsis) {
      chapter.synopsis = data.synopsis
    }
    
    if (data.credits) {
      chapter.credits = data.credits
    }
    
    if (data.pages && Array.isArray(data.pages)) {
      chapter.pages = data.pages.map((pageData: any) => {
        const page: Page = {
          panels: []
        }
        
        if (pageData.name) {
          page.name = pageData.name
        }
        
        if (pageData.panels && Array.isArray(pageData.panels)) {
          page.panels = pageData.panels.map((panelData: any) => {
            const panel: Panel = {
              dialogue: []
            }
            
            if (panelData.name) {
              panel.name = panelData.name
            }
            
            if (panelData.desc) {
              panel.desc = panelData.desc
            }
            
            if (panelData.fx) {
              panel.fx = panelData.fx
            }
            
            if (panelData.caption) {
              panel.caption = panelData.caption
            }
            
            if (panelData.endCaption) {
              panel.endCaption = panelData.endCaption
            }
            
            if (panelData.dialogue && Array.isArray(panelData.dialogue)) {
              panel.dialogue = panelData.dialogue
                .filter((dialogueData: any) => {
                  return dialogueData != null && 
                         typeof dialogueData === "object" && 
                         Object.keys(dialogueData).length > 0
                })
                .map((dialogueData: any) => {
                  const key = Object.keys(dialogueData)[0]
                  const text = dialogueData[key]
                  
                  if (key.startsWith("/")) {
                    const type = key.slice(1)
                    return {
                      character: "",
                      text,
                      type: type || "narration",
                      isNarration: true
                    }
                  } else {
                    const [character, typeStr] = key.split("/")
                    const type = typeStr || "speech"
                    return {
                      character: character || "Character",
                      text,
                      type
                    }
                  }
                })
            }
            
            return panel
          })
        }
        
        return page
      })
    }
    
    return chapter
  } catch (error) {
    throw error
  }
}

export const validateYaml = (yamlString: string): { valid: boolean; error?: string } => {
  try {
    yaml.load(yamlString)
    return { valid: true }
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : "Invalid YAML syntax"
    }
  }
}