import { DeserializedHTTP } from "./utils";
import { Header, ResponseData } from "@/app/http/page";

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

interface HttpRequest {
  _url: string;
  _method: string;
  _headers: Record<string, string>;
  _query: Record<string, string>;
  _env_variables: Record<string, string>;
  _json: string;
  _xml: string;
  _text: string;

  getUrl(): string;
  getMethod(): string;
  setHeader(key: string, value: string): void;
  setHeaders(obj: Record<string, string>): void;
  getHeaders(): Record<string, string>;
  setQuery(obj: Record<string, string>): void;
  getQuery(): Record<string, string>;
  setJson(data: Record<string, any> | string): void;
  getJson(): Record<string, any> | string;
  setText(data: string): void;
  getText(): string;
  setXml(data: string): void;
  getXml(): string;
  getBody(): "xml" | "json" | "text" | null;
  getBodyData(): any;
  getVar(key: string): string;
  setVar(key: string, value: string): void;
}

interface HttpResponse {
  _env_variables: Record<string, string>;
  _headers: Record<string, string>;
  _json: Record<string, any>;
  _text: string;
  _xml: string;
  _text_response: string;
  _status: number;
  _elapsed_time: number;
  _content_size: number;
  _content_type: "json" | "xml" | "text";

  getVar(key: string): string;
  setVar(key: string, value: string): void;
  getHeader(key: string): string;
  getHeaders(): Record<string, string>;
  getJson(): Record<string, any>;
  getText(): string;
  getXml(): string;
  getStatus(): number;
  getElapsedTime(): number;
  getContentSize(): number;
}

interface RequestScriptConfig {
  url: string;
  method: string;
  headers?: Array<{ key: string; value: string; enabled: boolean }>;
  query?: Array<{ key: string; value: any; enabled: boolean }>;
  body?: "json" | "xml" | "text";
  json?: Record<string, any> | string;
  xml?: string;
  text?: string;
  environments?: Record<string, string>;
}

interface ResponseScriptConfig {
  headers: Header[];
  text_response: string;
  status: number;
  elapsed_time: number;
  content_size: number;
  environments?: Record<string, string>;
}

export class RequestScript implements HttpRequest {
  _url: string;
  _method: string;
  _headers: Record<string, string>;
  _query: Record<string, string>;
  _env_variables: Record<string, string>;
  _json: string;
  _xml: string;
  _text: string;
  private _body_type: "json" | "xml" | "text" | null;
  private _json_data: Record<string, any> | string | null;
  private _xml_data: string | null;
  private _text_data: string | null;

  constructor(config: RequestScriptConfig) {
    this._url = config.url || "";
    this._method = config.method || "GET";
    this._env_variables = config.environments || {};
    this._body_type = config.body || null;
    this._json_data = config.json || null;
    this._xml_data = config.xml || null;
    this._text_data = config.text || null;

    // Convert headers array to object, stripping ~ prefix for disabled headers
    this._headers = {};
    if (config.headers) {
      config.headers.forEach(header => {
        if (header.enabled && !header.key.startsWith("~")) {
          this._headers[header.key] = header.value;
        }
      });
    }

    // Convert query array to object, stripping ~ prefix for disabled query params
    this._query = {};
    if (config.query) {
      config.query.forEach(queryParam => {
        if (queryParam.enabled && !queryParam.key.startsWith("~")) {
          this._query[queryParam.key] = queryParam.value;
        }
      });
    }

    // Set string representations for compatibility
    this._json = this._json_data ? JSON.stringify(this._json_data) : "";
    this._xml = this._xml_data || "";
    this._text = this._text_data || "";
  }

  getUrl(): string {
    return this._url;
  }

  getMethod(): string {
    return this._method;
  }

  setHeader(key: string, value: string): void {
    this._headers[key] = value;
  }

  setHeaders(obj: Record<string, string>): void {
    this._headers = { ...obj };
  }

  getHeaders(): Record<string, string> {
    const headers = { ...this._headers };
    
    // Set Content-Type based on body type if not already set
    if (!headers["Content-Type"] && !headers["content-type"]) {
      const bodyType = this.getBody();
      if (bodyType === "json") {
        headers["Content-Type"] = "application/json";
      } else if (bodyType === "xml") {
        headers["Content-Type"] = "text/xml";
      } else if (bodyType === "text") {
        headers["Content-Type"] = "text/plain";
      }
    }
    
    return headers;
  }

  setQuery(obj: Record<string, string>): void {
    this._query = { ...obj };
  }

  getQuery(): Record<string, string> {
    return { ...this._query };
  }

  setJson(data: Record<string, any> | string): void {
    this._json_data = data;
    this._json = typeof data === "string" ? data : JSON.stringify(data);
  }

  getJson(): Record<string, any> | string {
    return this._json_data || {};
  }

  setText(data: string): void {
    this._text_data = data;
    this._text = data;
  }

  getText(): string {
    return this._text_data || "";
  }

  setXml(data: string): void {
    this._xml_data = data;
    this._xml = data;
  }

  getXml(): string {
    return this._xml_data || "";
  }

  getBody(): "xml" | "json" | "text" | null {
    // If body type is explicitly set, use it
    if (this._body_type) {
      return this._body_type;
    }

    // Otherwise, determine based on available data
    if (this._json_data !== null) return "json";
    if (this._xml_data !== null) return "xml";
    if (this._text_data !== null) return "text";
    
    return null;
  }

  getBodyData(): any {
    const bodyType = this.getBody();
    
    if (bodyType === "json") {
      return this._json_data;
    } else if (bodyType === "xml") {
      return this._xml_data;
    } else if (bodyType === "text") {
      return this._text_data;
    }
    
    return null;
  }

  getVar(key: string): string {
    return this._env_variables[key] || "";
  }

  setVar(key: string, value: string): void {
    this._env_variables[key] = value;
  }
}

export class ResponseScript implements HttpResponse {
  _env_variables: Record<string, string>;
  _headers: Record<string, string>;
  _json: Record<string, any>;
  _text: string;
  _xml: string;
  _text_response: string;
  _status: number;
  _elapsed_time: number;
  _content_size: number;
  _content_type: "json" | "xml" | "text";

  constructor(config: ResponseScriptConfig) {
    this._env_variables = config.environments || {};
    this._text_response = config.text_response || "";
    this._status = config.status || 0;
    this._elapsed_time = config.elapsed_time || 0;
    this._content_size = config.content_size || 0;

    // Convert headers array to object
    this._headers = {};
    if (config.headers) {
      config.headers.forEach(header => {
        this._headers[header.key.toLowerCase()] = header.value;
      });
    }

    // Determine content type from headers
    const contentType = this._headers["content-type"] || "";
    if (contentType.includes("application/json")) {
      this._content_type = "json";
    } else if (contentType.includes("xml")) {
      this._content_type = "xml";
    } else {
      this._content_type = "text";
    }

    // Parse response based on content type
    this._json = {};
    this._text = this._text_response;
    this._xml = this._text_response;

    if (this._content_type === "json") {
      try {
        this._json = JSON.parse(this._text_response);
      } catch (error) {
        // If parsing fails, keep as empty object
        this._json = {};
      }
    }
  }

  getVar(key: string): string {
    return this._env_variables[key] || "";
  }

  setVar(key: string, value: string): void {
    this._env_variables[key] = value;
  }

  getHeader(key: string): string {
    return this._headers[key.toLowerCase()] || "";
  }

  getHeaders(): Record<string, string> {
    return { ...this._headers };
  }

  getJson(): Record<string, any> {
    return this._json;
  }

  getText(): string {
    return this._text;
  }

  getXml(): string {
    return this._xml;
  }

  getStatus(): number {
    return this._status;
  }

  getElapsedTime(): number {
    return this._elapsed_time;
  }

  getContentSize(): number {
    return this._content_size;
  }
}