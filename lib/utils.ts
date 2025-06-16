import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toString } from "./scripting";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type FormatOptions = {
  useTabs?: boolean;
  tabWidth?: number;
  lineEnding?: "\n" | "\r\n";
};

export type FileNode = {
  name: string;
  type: "file" | "directory";
  content?: string;
  children?: FileNode[];
  path: string;
};

export type DeserializedHTTP = {
  url: string;
  name?: string;
  method: string;
  // default is json
  body?: "json" | "text" | "xml";
  json?: Record<string, string> | string;
  text?: string;
  xml?: string;
  pre_request?: string; // string when deserialized and an (() => void) when serialized
  post_response?: string; // string when deserialized and an (() => void) when serialized
  headers?: Array<{
    key: string;
    value: string;
    enabled: boolean;
  }>;
  query?: Array<{
    key: string;
    value: any;
    enabled: boolean;
  }>;
};

/**
 * Interpolates variable placeholders in a string with values from a variables object
 * @param src - Source string containing variable placeholders in the form {{ VARIABLE_NAME }}
 * @param vars - Object containing variable key-value pairs
 * @returns String with placeholders replaced by corresponding values, or left as-is if not found
 * 
 * @example
 * ```ts
 * const src = `{{baseUrl}}/transfers - This is a local server endpoint. Some url to our s3 bucket {{s3_bucket}}`;
 * const result = interpolateVariables(src, {
 *   baseUrl: "https://localhost:3000/api"
 * });
 * // Result: "https://localhost:3000/api/transfers - This is a local server endpoint. Some url to our s3 bucket {{s3_bucket}}"
 * ```
 */
export function interpolateVariables(src: string, vars: Record<string, string>): string {
  // Regex pattern that matches variable placeholders:
  // - Allows uppercase/lowercase letters, numbers, and underscores
  // - Allows optional whitespace around the variable name inside {{ and }}
  // - Disallows spaces inside the variable name itself
  const VARIABLE_PLACEHOLDER_REGEX = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;

  return src.replace(VARIABLE_PLACEHOLDER_REGEX, (match, variableName) => {
    // Check if the variable exists in the vars object
    if (variableName in vars) {
      return vars[variableName];
    }
    
    // If variable not found, return the original placeholder unchanged
    return match;
  });
}

/**
 * Normalizes a URL by separating the base URL from query parameters
 * @param url - Full URL string including query parameters
 * @returns Object with formattedUrl (base URL) and queryObj (parsed query parameters)
 */
export function normalizeUrl(url: string): { formattedUrl: string; queryObj: Record<string, any> } {
  try {
    // Handle empty or invalid URLs
    if (!url || typeof url !== 'string') {
      return {
        formattedUrl: '',
        queryObj: {}
      };
    }

    // Find the query string separator
    const queryIndex = url.indexOf('?');
    
    // If no query string, return the original URL with empty query object
    if (queryIndex === -1) {
      return {
        formattedUrl: url,
        queryObj: {}
      };
    }

    // Split URL into base and query parts
    const formattedUrl = url.substring(0, queryIndex);
    const queryString = url.substring(queryIndex + 1);

    // Parse query parameters
    const queryObj: Record<string, any> = {};

    if (queryString) {
      // Split by & to get individual parameters
      const params = queryString.split('&');

      for (const param of params) {
        // Split by = to get key and value
        const equalIndex = param.indexOf('=');
        
        if (equalIndex === -1) {
          // Parameter without value (e.g., ?flag)
          const key = decodeURIComponent(param);
          if (key) {
            queryObj[key] = '';
          }
        } else {
          // Parameter with value
          const key = decodeURIComponent(param.substring(0, equalIndex));
          const value = decodeURIComponent(param.substring(equalIndex + 1));
          
          if (key) {
            // Try to parse as number if it looks like one
            if (/^-?\d+$/.test(value)) {
              queryObj[key] = parseInt(value, 10);
            } else if (/^-?\d*\.\d+$/.test(value)) {
              queryObj[key] = parseFloat(value);
            } else {
              queryObj[key] = value;
            }
          }
        }
      }
    }

    return {
      formattedUrl,
      queryObj
    };
  } catch (error) {
    console.error('Error normalizing URL:', error);
    return {
      formattedUrl: url,
      queryObj: {}
    };
  }
}

/**
 * Deserializes JavaScript code containing HTTP function definitions
 * @param code - JavaScript code as a string containing HTTP method functions
 * @returns DeserializedHTTP object with parsed request configuration
 */
export function deserializeHttpFn(code: string): DeserializedHTTP {
  const HTTP_METHODS = [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
    "HEAD",
    "OPTIONS",
    "CONNECT",
    "TRACE",
  ];

  try {
    // Create a safe execution context using Function constructor
    const func = new Function(`
      ${code}
      
      // Return an object containing all defined HTTP method functions
      const result = {};
      ${HTTP_METHODS.map(
        (method) => `
        if (typeof ${method} === 'function') {
          result.${method} = ${method};
        }
      `
      ).join("")}
      
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
      throw new Error("No valid HTTP method function found");
    }

    // Transform headers object to array format
    const headers: Array<{ key: string; value: string; enabled: boolean }> = [];

    if (httpConfig.headers && typeof httpConfig.headers === "object") {
      for (const [key, value] of Object.entries(httpConfig.headers)) {
        // Check if header is disabled (prefixed with ~)
        const isDisabled = key.startsWith("~");
        const cleanKey = isDisabled ? key.substring(1) : key;

        headers.push({
          key: cleanKey,
          value: String(value),
          enabled: !isDisabled,
        });
      }
    }

    // Transform query object to array format
    const query: Array<{ key: string; value: any; enabled: boolean }> = [];

    if (httpConfig.query && typeof httpConfig.query === "object") {
      for (const [key, value] of Object.entries(httpConfig.query)) {
        // Check if query param is disabled (prefixed with ~)
        const isDisabled = key.startsWith("~");
        const cleanKey = isDisabled ? key.substring(1) : key;

        query.push({
          key: cleanKey,
          value: value,
          enabled: !isDisabled,
        });
      }
    }

    if (!httpConfig.url) {
      throw new Error("Url is a required property.");
    }

    // Build the result object
    const result: DeserializedHTTP = {
      url: httpConfig.url,
      method: selectedMethod.toLowerCase(),
      headers,
      query,
    };

    // Add optional fields if they exist
    if (httpConfig.name) {
      result.name = httpConfig.name;
    }

    // Add optional fields if they exist
    if (httpConfig.body !== undefined) {
      result.body = httpConfig.body;
    }

    // Handle text field as body
    if (httpConfig.text !== undefined) {
      result.text = httpConfig.text;
    }

    // Handle xml field as body
    if (httpConfig.xml !== undefined) {
      result.xml = httpConfig.xml;
    }

    // Handle json field as body (default field)
    if (httpConfig.json !== undefined) {
      result.json = httpConfig.json;
    }

    if (httpConfig.pre_request !== undefined) {
      result.pre_request = toString(httpConfig.pre_request) || undefined;
    }

    if (httpConfig.post_response !== undefined) {
      result.post_response = toString(httpConfig.post_response) || undefined;
    }

    return result;
  } catch (error) {
    console.error("Error deserializing HTTP function:", error);

    // Return a default structure on error
    return {
      url: "",
      method: "get",
      headers: [],
      query: [],
    };
  }
}

function deterministicSort(obj: any, keyOrder: string[] = []): string {
  const sortKeys = (input: any): any => {
    if (Array.isArray(input)) {
      return input.map(sortKeys);
    } else if (
      input &&
      typeof input === "object" &&
      input.constructor === Object
    ) {
      const keys =
        keyOrder.length > 0
          ? [
              ...keyOrder.filter((k) => k in input),
              ...Object.keys(input)
                .filter((k) => !keyOrder.includes(k))
                .sort(),
            ]
          : Object.keys(input).sort();

      const result: Record<string, any> = {};
      for (const key of keys) {
        result[key] = sortKeys(input[key]);
      }
      return result;
    }
    return input;
  };

  const sorted = sortKeys(obj);
  return sorted;
}

/**
 * Serializes a DeserializedHTTP object into JavaScript function code.
 * @param obj - DeserializedHTTP object containing request configuration.
 * @param options - Optional formatting settings (similar to Prettier).
 * @returns JavaScript code string with HTTP method function.
 */
export function serializeHttpFn(
  obj: DeserializedHTTP,
  options: FormatOptions = {}
): string {
  const { useTabs = false, tabWidth = 2, lineEnding = "\n" } = options;

  const indent = useTabs ? "\t" : " ".repeat(tabWidth);

  try {
    const methodName = obj.method.toUpperCase();

    // Use normalizeUrl to separate base URL from query parameters
    const { formattedUrl, queryObj } = normalizeUrl(obj.url);

    // Build headers object
    const headersObj: Record<string, string> = {};
    if (obj.headers) {
      for (const header of obj.headers) {
        const key = header.enabled ? header.key : `~${header.key}`;
        headersObj[key] = header.value;
      }
    }

    // Build query object - merge URL query params with obj.query (obj.query takes precedence)
    const mergedQueryObj: Record<string, any> = {};
    
    // First add query parameters from the URL
    Object.assign(mergedQueryObj, queryObj);
    
    // Then add/override with obj.query parameters
    if (obj.query) {
      for (const queryParam of obj.query) {
        const key = queryParam.enabled ? queryParam.key : `~${queryParam.key}`;
        mergedQueryObj[key] = queryParam.value;
      }
    }

    const returnObj: any = {
      url: formattedUrl, // Use the cleaned URL without query parameters
    };

    if (obj.name) {
      returnObj.name = obj.name;
    }

    if (obj.body !== undefined) {
      returnObj.body = obj.body;
    }

    if (obj.json !== undefined) {
      returnObj.json = obj.json;
    }

    if (obj.text !== undefined) {
      returnObj.text = obj.text;
    }

    if (obj.xml !== undefined) {
      returnObj.xml = obj.xml;
    }

    // Add merged query if not empty
    if (Object.keys(mergedQueryObj).length > 0) {
      returnObj.query = mergedQueryObj;
    }

    // Add headers if not empty
    if (Object.keys(headersObj).length > 0) {
      returnObj.headers = headersObj;
    }

    if (obj.pre_request !== undefined) {
      returnObj.pre_request = obj.pre_request;
    }

    if (obj.post_response !== undefined) {
      returnObj.post_response = obj.post_response;
    }

    // Desired key order (top-level only)
    const keyOrder = [
      "name",
      "url",
      "body",
      "json",
      "text",
      "xml",
      "query",
      "headers",
      "pre_request",
      "post_response",
    ];

    let sorted = deterministicSort(returnObj, keyOrder);

    // Convert to formatted string manually
    const entries = Object.entries(sorted).map(([key, value]) => {
      let formattedValue: string;

      if (key.includes("pre_request") || key.includes("post_response")) {
        const clean = value.replace(/\r\n/g, "\n");
        const lines = clean
          .split("\n")
          .map((line) => line)
          .join(lineEnding)
          .trim();

        formattedValue = lines;

        return `${indent}${JSON.stringify(key)}:  ${indent}${indent}${formattedValue}\n${indent}${indent}`;
      }

      if (
        typeof value === "string" &&
        /[\n\r]/.test(value) &&
        !key.includes("pre_request")
      ) {
        // Multiline string - use template literals
        const clean = value.replace(/\r\n/g, "\n"); // normalize line endings
        const lines = clean
          .split("\n")
          .map((line) => indent + indent + line)
          .join(lineEnding);

        formattedValue = `\`${lineEnding}${lines}${lineEnding + indent}\``;
      } else {
        formattedValue = JSON.stringify(value, null, tabWidth)
          .split("\n")
          .map((l) => indent + l)
          .join(lineEnding)
          .trim();
      }

      return `${indent}${JSON.stringify(key)}: ${formattedValue},`;
    });

    // Handle pre_request and post_response functions
    const formattedScripts = entries.map((item) => {
      const fnBody = item.split(":")[1];

      if (item.includes("pre_request")) {
        item = `${indent}"pre_request": () => {\n` + fnBody + "},";
      }

      if (item.includes("post_response")) {
        item = `${indent}"post_response": () => {\n` + fnBody + "},";
      }

      return item;
    });

    const lines = [
      `const ${methodName} = () => {`,
      `${indent}return {`,
      ...formattedScripts,
      `${indent}};`,
      `};`,
    ];

    return lines.join(lineEnding) + lineEnding;
  } catch (error) {
    console.error("Error serializing HTTP function:", error);
    return `ERROR`;
  }
}