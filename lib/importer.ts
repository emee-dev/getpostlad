import { Collection, Item, ItemGroup } from "postman-collection";
import { FileNode, DeserializedHTTP, serializeHttpFn } from "./utils";

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
    collection.items.all()?.forEach((item: Item | ItemGroup) => {
      const node = processItem(item, "");
      if (node) {
        fileNodes.push(node);
      }
    });

    return fileNodes;
  } catch (error) {
    console.error("Error parsing Postman collection:", error);
    return [];
  }
}

/**
 * Processes a single item (request or folder) from the collection
 * @param item - Postman Item or ItemGroup
 * @param parentPath - Path of the parent directory
 * @returns FileNode or null
 */
function processItem(
  item: Item | ItemGroup,
  parentPath: string
): FileNode | null {
  const itemName = item.name || "Untitled";
  const currentPath = parentPath ? `/${parentPath}/${itemName}` : itemName;

  // Check if this is a folder (ItemGroup)
  if ("items" in item && item.items) {
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
      type: "directory",
      children,
      path: currentPath,
    };
  } else {
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
      lineEnding: "\n",
    });

    return {
      name: `${itemName}.js`,
      type: "file",
      content,
      path: `/${currentPath}.js`,
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
  const url = request?.url?.toString() || "";

  // Extract method
  const method = request?.method.toLowerCase() || "UNKNOWN";

  // Extract headers
  const headers: Array<{ key: string; value: string; enabled: boolean }> = [];

  request?.headers?.each((h) => {
    headers.push({
      key: h.key || "",
      value: h.value || "",
      enabled: h.disabled !== true,
    });
  });

  // Build the base DeserializedHTTP object
  const deserializedHTTP: DeserializedHTTP = {
    url,
    name,
    method,
    headers,
  };

  // Extract body if present
  if (request?.body && request.body.mode) {
    let body = request?.body;
    let mode = request.body.mode;

    const raw = body.raw || "";
    const lang = body.options?.raw?.language ?? "text";

    if (mode === "raw") {
      try {
        if (lang === "json") {
          deserializedHTTP.json = JSON.parse(raw);
          deserializedHTTP.body = "json";
        }
        if (lang === "xml") {
          deserializedHTTP.xml = raw;
          deserializedHTTP.body = "xml";
        }
        if (lang === "text") {
          deserializedHTTP.text = raw;
          deserializedHTTP.body = "text";
        }
      } catch {
        // fallback - ignore as it is not currently supported
      }
    }

    // Not currently supported
    if (mode === "urlencoded") {
      // deserializedHTTP.urlencoded = body.urlencoded?.toObject() ?? {};
      // deserializedHTTP.body = "urlencoded";
    } else if (mode === "formdata") {
      // deserializedHTTP.formdata = body.formdata?.toObject() ?? {};
      // deserializedHTTP.body = "formdata";
    }
  }

  return deserializedHTTP;
}