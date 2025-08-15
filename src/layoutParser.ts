export interface PanelPosition {
  panelNumber: number
  panelId?: string
  cells: Array<{x: number, y: number}>
  boundingBox: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface ParsedLayout {
  grid: string[][]
  panels: PanelPosition[]
  gridWidth: number
  gridHeight: number
}

export function parseLayout(layoutInput: string | string[]): ParsedLayout {
  // Convert to array of lines if string
  const lines = Array.isArray(layoutInput) 
    ? layoutInput 
    : layoutInput.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    return { grid: [], panels: [], gridWidth: 0, gridHeight: 0 };
  }
  
  // Parse as a simple character grid
  const grid: string[][] = [];
  for (const line of lines) {
    // Split each line into individual characters
    // Keep all characters including spaces, but convert '.' to empty space
    const chars = line.split('').map(char => {
      if (char === '.') {
        return ' '; // Treat period as empty space for planning
      }
      return char;
    });
    if (chars.length > 0) {
      grid.push(chars);
    }
  }
  
  if (grid.length === 0) {
    return { grid: [], panels: [], gridWidth: 0, gridHeight: 0 };
  }
  
  const gridHeight = grid.length;
  const gridWidth = Math.max(...grid.map(row => row.length));
  
  // Normalize grid to ensure all rows have the same width
  const normalizedGrid: string[][] = [];
  for (let y = 0; y < gridHeight; y++) {
    const row: string[] = [];
    for (let x = 0; x < gridWidth; x++) {
      row.push(grid[y] && grid[y][x] ? grid[y][x] : '');
    }
    normalizedGrid.push(row);
  }
  
  // Find all cells for each panel
  const panelCells = new Map<string, Array<{x: number, y: number}>>();
  
  for (let y = 0; y < normalizedGrid.length; y++) {
    for (let x = 0; x < normalizedGrid[y].length; x++) {
      const cell = normalizedGrid[y][x];
      // Skip empty cells (spaces, empty strings, dashes already converted to spaces)
      if (cell && cell.trim() !== '') {
        if (!panelCells.has(cell)) {
          panelCells.set(cell, []);
        }
        panelCells.get(cell)!.push({x, y});
      }
    }
  }
  
  // Calculate bounding boxes for each panel
  const panelPositions: PanelPosition[] = [];
  for (const [panelId, cells] of panelCells.entries()) {
    if (cells.length === 0) continue;
    
    const minX = Math.min(...cells.map(c => c.x));
    const maxX = Math.max(...cells.map(c => c.x));
    const minY = Math.min(...cells.map(c => c.y));
    const maxY = Math.max(...cells.map(c => c.y));
    
    // Convert panelId to number for sorting
    let panelNumber: number;
    if (!isNaN(parseInt(panelId))) {
      panelNumber = parseInt(panelId);
    } else {
      // Convert letter to number (A=10, B=11, etc.)
      panelNumber = panelId.charCodeAt(0) - 55; // A=65, so A=10
    }
    
    panelPositions.push({
      panelNumber: panelNumber,
      panelId: panelId, // Keep original ID for display
      cells: cells,
      boundingBox: {
        x: minX,
        y: minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1
      }
    });
  }
  
  const panels = panelPositions.sort((a, b) => a.panelNumber - b.panelNumber);
  
  return {
    grid: normalizedGrid,
    panels,
    gridWidth: gridWidth,
    gridHeight: gridHeight
  };
}

export function renderLayoutToSVG(
  layout: ParsedLayout, 
  width: number = 400, 
  height: number = 600,
  options: { showNumbers?: boolean; showGrid?: boolean } = {}
): string {
  const { panels, gridWidth, gridHeight } = layout;
  const { showNumbers = true, showGrid = false } = options;
  
  if (panels.length === 0) {
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#f0f0f0" stroke="#333" stroke-width="2"/>
      <text x="${width/2}" y="${height/2}" text-anchor="middle" font-family="Arial" font-size="14" fill="#666">No layout defined</text>
    </svg>`;
  }
  
  const padding = 10;
  const innerWidth = width - (padding * 2);
  const innerHeight = height - (padding * 2);
  const cellWidth = innerWidth / gridWidth;
  const cellHeight = innerHeight / gridHeight;
  
  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
  
  // Background
  svg += `<rect width="${width}" height="${height}" fill="white"/>`;
  
  // Draw grid if requested
  if (showGrid) {
    svg += `<g stroke="#e0e0e0" stroke-width="0.5">`;
    for (let i = 0; i <= gridWidth; i++) {
      const x = padding + (i * cellWidth);
      svg += `<line x1="${x}" y1="${padding}" x2="${x}" y2="${height - padding}"/>`;
    }
    for (let i = 0; i <= gridHeight; i++) {
      const y = padding + (i * cellHeight);
      svg += `<line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}"/>`;
    }
    svg += `</g>`;
  }
  
  // Color palette for panels
  const colors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', 
    '#dda0dd', '#98d8c8', '#f7dc6f', '#bb8fce', '#85c1e9',
    '#f8c471', '#82e0aa', '#f1948a', '#85c1e9', '#d7bde2'
  ];
  
  // Function to calculate luminance and determine best contrast color
  function getBestContrastColor(hexColor: string): string {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Calculate relative luminance using W3C formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black for light backgrounds, white for dark backgrounds
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }
  
  // Function to convert panel number to label (1-9, then A-Z)
  function getPanelLabel(panelNumber: number): string {
    if (panelNumber <= 9) {
      return panelNumber.toString();
    } else {
      // Convert to letters: 10=A, 11=B, etc.
      return String.fromCharCode(65 + (panelNumber - 10));
    }
  }
  
  // Draw panels
  for (const panel of panels) {
    // Get color for this panel (cycle through colors)
    const color = colors[(panel.panelNumber - 1) % colors.length];
    
    // Draw each cell as a simple rectangle with the panel color
    for (const cell of panel.cells) {
      const x = padding + (cell.x * cellWidth);
      const y = padding + (cell.y * cellHeight);
      const w = cellWidth;
      const h = cellHeight;
      
      svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}"/>`;
    }
    
    // Panel number (place at actual geometric center of the shape)
    if (showNumbers) {
      // Calculate the centroid (geometric center) of all cells
      const sumX = panel.cells.reduce((sum, cell) => sum + cell.x, 0);
      const sumY = panel.cells.reduce((sum, cell) => sum + cell.y, 0);
      const centroidX = sumX / panel.cells.length;
      const centroidY = sumY / panel.cells.length;
      
      // Convert to pixel coordinates (center of the centroid cell)
      const centerX = padding + (centroidX + 0.5) * cellWidth;
      const centerY = padding + (centroidY + 0.5) * cellHeight;
      
      const bbox = panel.boundingBox;
      const fontSize = Math.min(24, Math.min(bbox.width * cellWidth, bbox.height * cellHeight) / 3);
      
      // Get the best contrasting text color and use original panel ID for display
      const textColor = getBestContrastColor(color);
      const panelLabel = panel.panelId || getPanelLabel(panel.panelNumber);
      
      svg += `<text x="${centerX}" y="${centerY}" 
        text-anchor="middle" dominant-baseline="middle" 
        font-family="Arial" font-size="${fontSize}" font-weight="bold" fill="${textColor}">
        ${panelLabel}
      </text>`;
    }
  }
  
  // Outer border
  svg += `<rect x="${padding}" y="${padding}" width="${innerWidth}" height="${innerHeight}" 
    fill="none" stroke="#333" stroke-width="3"/>`;
  
  svg += `</svg>`;
  
  return svg;
}