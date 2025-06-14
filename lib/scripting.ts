/**
 * Extracts the function body from a function reference
 * @param fnRef - Function reference to extract body from
 * @returns The function body as a string, or null if extraction fails
 */
export function toString(fnRef: Function): string | null {
  try {
    // Convert function to string
    const fnString = fnRef.toString();
    
    // Check for native code
    if (fnString.includes('[native code]')) {
      return null;
    }
    
    // Find the first opening brace
    const openBraceIndex = fnString.indexOf('{');
    
    // If no opening brace found, return null
    if (openBraceIndex === -1) {
      return null;
    }
    
    // Find the matching closing brace
    let braceCount = 0;
    let closeBraceIndex = -1;
    
    for (let i = openBraceIndex; i < fnString.length; i++) {
      if (fnString[i] === '{') {
        braceCount++;
      } else if (fnString[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          closeBraceIndex = i;
          break;
        }
      }
    }
    
    // If no matching closing brace found, return null
    if (closeBraceIndex === -1) {
      return null;
    }
    
    // Extract the content between braces
    const bodyContent = fnString.substring(openBraceIndex + 1, closeBraceIndex);
    
    // Trim whitespace and return
    return bodyContent.trim();
    
  } catch (error) {
    // If any error occurs during extraction, return null
    return null;
  }
}