import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type FileNode = {
  name: string;
  type: "file" | "directory";
  content?: string;
  children?: FileNode[];
  path: string;
};

export type FileSystemTree = {
  [name: string]: {
    file?: { contents: string };
    directory?: FileSystemTree;
  };
};

export type DeserializedHTTP = {
  url: string;
  name?: string;
  method: string;
  body?: Record<string, string> | string | unknown;
  headers: Array<{
    key: string;
    value: string;
    enabled: boolean;
  }>;
};

/**
 * Converts an array of FileNode objects to a FileSystemTree structure
 * @param tree - Array of FileNode objects representing the file tree
 * @returns FileSystemTree object with nested structure
 */
export function fromSidebarTree(tree: FileNode[]): FileSystemTree {
  const result: FileSystemTree = {};

  for (const node of tree) {
    if (node.type === "file") {
      result[node.name] = {
        file: {
          contents: node.content || ""
        }
      };
    } else if (node.type === "directory") {
      result[node.name] = {
        directory: node.children ? fromSidebarTree(node.children) : {}
      };
    }
  }

  return result;
}

/**
 * Deserializes JavaScript code containing HTTP function definitions
 * @param code - JavaScript code as a string containing HTTP method functions
 * @returns DeserializedHTTP object with parsed request configuration
 */
export function deserializeHttpFn(code: string): DeserializedHTTP {
  const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'CONNECT', 'TRACE'];
  
  try {
    // Create a safe execution context using Function constructor
    const func = new Function(`
      ${code}
      
      // Return an object containing all defined HTTP method functions
      const result = {};
      ${HTTP_METHODS.map(method => `
        if (typeof ${method} === 'function') {
          result.${method} = ${method};
        }
      `).join('')}
      
      return result;
    `);
    
    const httpFunctions = func();
    
    // Find the first available HTTP method function
    let selectedMethod: string | null = null;
    let httpConfig: any = null;
    
    for (const method of HTTP_METHODS) {
      if (httpFunctions[method]) {
        selectedMethod = method;
        httpConfig = httpFunctions[method]();
        break;
      }
    }
    
    if (!selectedMethod || !httpConfig) {
      throw new Error('No valid HTTP method function found');
    }
    
    // Transform headers object to array format
    const headers: Array<{ key: string; value: string; enabled: boolean }> = [];
    
    if (httpConfig.headers && typeof httpConfig.headers === 'object') {
      for (const [key, value] of Object.entries(httpConfig.headers)) {
        // Check if header is disabled (prefixed with ~)
        const isDisabled = key.startsWith('~');
        const cleanKey = isDisabled ? key.substring(1) : key;
        
        headers.push({
          key: cleanKey,
          value: String(value),
          enabled: !isDisabled
        });
      }
    }
    
    // Build the result object
    const result: DeserializedHTTP = {
      url: httpConfig.url || '',
      method: selectedMethod.toLowerCase(),
      headers
    };
    
    // Add optional fields if they exist
    if (httpConfig.name) {
      result.name = httpConfig.name;
    }
    
    if (httpConfig.body !== undefined) {
      result.body = httpConfig.body;
    }
    
    // Handle json field as body (common pattern)
    if (httpConfig.json !== undefined && result.body === undefined) {
      result.body = httpConfig.json;
    }
    
    return result;
    
  } catch (error) {
    console.error('Error deserializing HTTP function:', error);
    
    // Return a default structure on error
    return {
      url: '',
      method: 'get',
      headers: []
    };
  }
}

/**
 * Serializes a DeserializedHTTP object into JavaScript code
 * @param obj - DeserializedHTTP object containing request configuration
 * @returns JavaScript code string with HTTP method function
 */
export function serializeHttpFn(obj: DeserializedHTTP): string {
  try {
    // Convert method to uppercase for function name
    const methodName = obj.method.toUpperCase();
    
    // Transform headers array back to object format
    const headersObj: Record<string, string> = {};
    
    for (const header of obj.headers) {
      // Prefix disabled headers with ~
      const key = header.enabled ? header.key : `~${header.key}`;
      headersObj[key] = header.value;
    }
    
    // Build the return object
    const returnObj: any = {
      url: obj.url,
      headers: headersObj
    };
    
    // Add optional name field
    if (obj.name) {
      returnObj.name = obj.name;
    }
    
    // Add body/json field if it exists
    if (obj.body !== undefined) {
      // If body is an object, use 'json' field, otherwise use 'body'
      if (typeof obj.body === 'object' && obj.body !== null && !Array.isArray(obj.body)) {
        returnObj.json = obj.body;
      } else {
        returnObj.body = obj.body;
      }
    }
    
    // Generate the JavaScript code
    const code = `const ${methodName} = () => {
  return ${JSON.stringify(returnObj, null, 2).replace(/"/g, '"')};
};`;
    
    return code;
    
  } catch (error) {
    console.error('Error serializing HTTP function:', error);
    
    // Return a basic GET function on error
    return `const GET = () => {
  return {
    url: "",
    headers: {}
  };
};`;
  }
}