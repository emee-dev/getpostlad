import { Collection, Item, ItemGroup } from 'postman-collection';
import { FileNode, DeserializedHTTP, serializeHttpFn } from './utils';

export type FormatOptions = {
  useTabs?: boolean;
  tabWidth?: number;
  lineEnding?: "\n" | "\r\n";
};

/**
 * Converts a Postman collection JSON to a FileNode tree structure
 * @param col - Postman collection JSON object (v2.1 format)
 * @returns Array of FileNode representing the collection structure
 */
export function postmanJSONImporter(col: any): FileNode[] {
  try {
    // Create a Collection instance from the JSON
    const collection = new Collection(col);
    
    // Process the collection items
    const fileNodes: FileNode[] = [];
    
    // Process each item in the collection
    collection.items.each((item: Item | ItemGroup) => {
      const node = processItem(item, '');
      if (node) {
        fileNodes.push(node);
      }
    });
    
    return fileNodes;
  } catch (error) {
    console.error('Error parsing Postman collection:', error);
    return [];
  }
}

/**
 * Processes a single item (request or folder) from the collection
 * @param item - Postman Item or ItemGroup
 * @param parentPath - Path of the parent directory
 * @returns FileNode or null
 */
function processItem(item: Item | ItemGroup, parentPath: string): FileNode | null {
  const itemName = item.name || 'Untitled';
  const currentPath = parentPath ? `${parentPath}/${itemName}` : itemName;
  
  // Check if this is a folder (ItemGroup)
  if ('items' in item && item.items) {
    // This is a folder
    const children: FileNode[] = [];
    
    item.items.each((childItem: Item | ItemGroup) => {
      const childNode = processItem(childItem, currentPath);
      if (childNode) {
        children.push(childNode);
      }
    });
    
    return {
      name: itemName,
      type: 'directory',
      children,
      path: currentPath
    };
  } else {
    // This is a request item
    const request = (item as Item).request;
    
    if (!request) {
      return null;
    }
    
    // Convert Postman request to DeserializedHTTP format
    const deserializedHTTP = convertPostmanRequest(request, itemName);
    
    // Generate the file content using serializeHttpFn
    const content = serializeHttpFn(deserializedHTTP, {
      useTabs: false,
      tabWidth: 2,
      lineEnding: '\n'
    });
    
    return {
      name: `${itemName}.js`,
      type: 'file',
      content,
      path: `${currentPath}.js`
    };
  }
}

/**
 * Converts a Postman request to DeserializedHTTP format
 * @param request - Postman request object
 * @param name - Name of the request
 * @returns DeserializedHTTP object
 */
function convertPostmanRequest(request: any, name: string): DeserializedHTTP {
  // Extract URL
  const url = request.url ? (typeof request.url === 'string' ? request.url : request.url.raw || '') : '';
  
  // Extract method
  const method = request.method ? request.method.toLowerCase() : 'get';
  
  // Extract headers
  const headers: Array<{ key: string; value: string; enabled: boolean }> = [];
  
  if (request.header && Array.isArray(request.header)) {
    request.header.forEach((header: any) => {
      headers.push({
        key: header.key || '',
        value: header.value || '',
        enabled: header.disabled !== true
      });
    });
  }
  
  // Build the base DeserializedHTTP object
  const deserializedHTTP: DeserializedHTTP = {
    url,
    name,
    method,
    headers
  };
  
  // Extract body if present
  if (request.body) {
    const body = request.body;
    
    if (body.mode === 'raw') {
      // Raw body - determine content type
      const contentType = headers.find(h => 
        h.key.toLowerCase() === 'content-type'
      )?.value.toLowerCase() || '';
      
      if (contentType.includes('application/json')) {
        try {
          // Try to parse as JSON
          const jsonData = JSON.parse(body.raw);
          deserializedHTTP.json = jsonData;
          deserializedHTTP.body = 'json';
        } catch {
          // If parsing fails, treat as text
          deserializedHTTP.text = body.raw;
          deserializedHTTP.body = 'text';
        }
      } else if (contentType.includes('application/xml') || contentType.includes('text/xml')) {
        deserializedHTTP.xml = body.raw;
        deserializedHTTP.body = 'xml';
      } else {
        deserializedHTTP.text = body.raw;
        deserializedHTTP.body = 'text';
      }
    } else if (body.mode === 'formdata') {
      // Form data - convert to JSON object
      const formData: Record<string, string> = {};
      
      if (body.formdata && Array.isArray(body.formdata)) {
        body.formdata.forEach((item: any) => {
          if (item.key && item.value) {
            formData[item.key] = item.value;
          }
        });
      }
      
      deserializedHTTP.json = formData;
      deserializedHTTP.body = 'json';
    } else if (body.mode === 'urlencoded') {
      // URL encoded - convert to JSON object
      const urlEncodedData: Record<string, string> = {};
      
      if (body.urlencoded && Array.isArray(body.urlencoded)) {
        body.urlencoded.forEach((item: any) => {
          if (item.key && item.value) {
            urlEncodedData[item.key] = item.value;
          }
        });
      }
      
      deserializedHTTP.json = urlEncodedData;
      deserializedHTTP.body = 'json';
    }
  }
  
  return deserializedHTTP;
}