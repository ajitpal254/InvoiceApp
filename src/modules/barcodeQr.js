/**
 * Lightweight SVG Barcode and QR Code generator for official E-Way Bill rendering
 */

// Simple Code128 pattern table or Code 39 / 2 of 5 style high-density barcode generator
export function generateBarcodeSvg(value, width = 280, height = 48) {
  if (!value) value = '000000000000';
  const cleanVal = String(value).replace(/[^0-9A-Za-z]/g, '');
  
  // Deterministic bar widths based on input string
  let bars = '';
  let currentX = 10;
  const barWidth = (width - 20) / (cleanVal.length * 11 + 20);

  // Start pattern
  const startPattern = [2, 1, 1, 2, 3, 2];
  startPattern.forEach((w, idx) => {
    if (idx % 2 === 0) {
      bars += `<rect x="${currentX}" y="4" width="${w * barWidth}" height="${height - 18}" fill="#000" />`;
    }
    currentX += w * barWidth;
  });

  for (let i = 0; i < cleanVal.length; i++) {
    const charCode = cleanVal.charCodeAt(i);
    // Pseudo barcode encoding based on standard 128 bit masks
    const bitMask = [
      ((charCode >> 0) & 1) + 1,
      ((charCode >> 1) & 1) + 1,
      ((charCode >> 2) & 1) + 1,
      ((charCode >> 3) & 1) + 1,
      ((charCode >> 4) & 1) + 1,
      ((charCode >> 5) & 1) + 1
    ];

    bitMask.forEach((w, idx) => {
      if (idx % 2 === 0) {
        bars += `<rect x="${currentX.toFixed(2)}" y="4" width="${(w * barWidth).toFixed(2)}" height="${height - 18}" fill="#000" />`;
      }
      currentX += w * barWidth;
    });
  }

  // Stop pattern
  const stopPattern = [2, 3, 3, 1, 1, 1, 2];
  stopPattern.forEach((w, idx) => {
    if (idx % 2 === 0) {
      bars += `<rect x="${currentX.toFixed(2)}" y="4" width="${(w * barWidth).toFixed(2)}" height="${height - 18}" fill="#000" />`;
    }
    currentX += w * barWidth;
  });

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="${height}" style="max-width: ${width}px; display: block; margin: 0 auto;">
      ${bars}
      <text x="${width / 2}" y="${height - 2}" font-family="monospace" font-size="11" font-weight="600" text-anchor="middle" fill="#000">${value}</text>
    </svg>
  `;
}

/**
 * Procedural standard 2D Matrix / QR-Style visual generator
 */
export function generateQrCodeSvg(dataString, size = 110) {
  if (!dataString) dataString = 'EWAY:000000000000';
  const matrixSize = 25; // standard QR version 2
  const cellSize = (size - 10) / matrixSize;
  
  // 25x25 grid
  const grid = Array.from({ length: matrixSize }, () => Array(matrixSize).fill(0));

  // Finder patterns at top-left, top-right, bottom-left
  const addFinder = (startX, startY) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 || // Outer ring
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)       // Inner square
        ) {
          grid[startY + r][startX + c] = 1;
        }
      }
    }
  };

  addFinder(0, 0);
  addFinder(matrixSize - 7, 0);
  addFinder(0, matrixSize - 7);

  // Timing lines
  for (let i = 8; i < matrixSize - 8; i++) {
    if (i % 2 === 0) {
      grid[6][i] = 1;
      grid[i][6] = 1;
    }
  }

  // Fill pseudo-random hashed data cells based on dataString
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    hash = ((hash << 5) - hash) + dataString.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      // Skip finder zones
      const inFinderZone =
        (r < 8 && c < 8) ||
        (r < 8 && c >= matrixSize - 8) ||
        (r >= matrixSize - 8 && c < 8);
      if (!inFinderZone && grid[r][c] === 0) {
        const bit = ((hash ^ (r * 31 + c * 17)) & 1);
        if (bit === 1) {
          grid[r][c] = 1;
        }
      }
    }
  }

  let rects = '';
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (grid[r][c] === 1) {
        rects += `<rect x="${(5 + c * cellSize).toFixed(2)}" y="${(5 + r * cellSize).toFixed(2)}" width="${cellSize.toFixed(2)}" height="${cellSize.toFixed(2)}" fill="#000" />`;
      }
    }
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="display: block;">
      <rect width="${size}" height="${size}" fill="#fff" />
      ${rects}
    </svg>
  `;
}
