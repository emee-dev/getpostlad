export const basicTemplate = `const GET = () => {
  return {
    name: "Basic GET Request",
    url: "https://jsonplaceholder.typicode.com/posts/1",
    headers: {
      'Content-Type': 'application/json',
    },
  };
};`;

export const requestBodyTemplate = `const POST = () => {
  return {
    name: "POST with JSON Body",
    url: "https://jsonplaceholder.typicode.com/posts",
    headers: {
      'Content-Type': 'application/json',
    },
    json: {
      title: 'My New Post',
      body: 'This is the content of my post',
      userId: 1,
    },
  };
};

// Alternative: Using text body
const POST_TEXT = () => {
  return {
    name: "POST with Text Body",
    url: "https://httpbin.org/post",
    headers: {
      'Content-Type': 'text/plain',
    },
    text: "This is plain text content",
  };
};

// Alternative: Using XML body
const POST_XML = () => {
  return {
    name: "POST with XML Body",
    url: "https://httpbin.org/post",
    headers: {
      'Content-Type': 'application/xml',
    },
    xml: \`<?xml version="1.0" encoding="UTF-8"?>
<user>
  <name>John Doe</name>
  <email>john@example.com</email>
</user>\`,
  };
};`;

export const variablesTemplate = `const GET = () => {
  return {
    name: "Using Environment Variables",
    url: "{{BASE_URL}}/users/{{USER_ID}}",
    headers: {
      'Authorization': 'Bearer {{API_TOKEN}}',
      'Content-Type': 'application/json',
    },
    query: {
      include: "profile,settings",
      format: "{{RESPONSE_FORMAT}}",
    },
  };
};

// Variables are defined in your environment settings
// Example variables:
// BASE_URL = https://api.example.com
// USER_ID = 123
// API_TOKEN = your-secret-token
// RESPONSE_FORMAT = json`;

export const scriptingTemplate = `const POST = () => {
  return {
    name: "Request with Pre/Post Scripts",
    url: "https://jsonplaceholder.typicode.com/posts",
    headers: {
      'Content-Type': 'application/json',
    },
    json: {
      title: 'Test Post',
      body: 'Test content',
      userId: 1,
    },
    
    // Pre-request script - runs before sending the request
    pre_request: () => {
      // Set dynamic headers
      req.setHeader('X-Request-ID', crypto.randomUUID());
      req.setHeader('X-Timestamp', new Date().toISOString());
      
      // Modify request data
      const currentData = req.getJson();
      currentData.timestamp = Date.now();
      req.setJson(currentData);
      
      // Set environment variables
      req.setVar('LAST_REQUEST_TIME', new Date().toISOString());
      
      console.log('Pre-request script executed');
    },
    
    // Post-response script - runs after receiving the response
    post_response: () => {
      // Test response status
      describe('Response Tests', () => {
        it('should return 201 status', () => {
          expect(res.getStatus()).to.equal(201);
        });
        
        it('should have correct content type', () => {
          expect(res.getHeader('content-type')).to.include('application/json');
        });
        
        it('should return created post', () => {
          const data = res.getJson();
          expect(data).to.have.property('id');
          expect(data.title).to.equal('Test Post');
        });
      });
      
      // Save response data to environment
      const responseData = res.getJson();
      res.setVar('CREATED_POST_ID', responseData.id.toString());
      
      console.log('Post-response script executed');
    },
  };
};`;

export const fullDocsTemplate = `// 🐼 Panda HTTP Client - Complete Documentation & Examples

// ═══════════════════════════════════════════════════════════════════
// 📖 BASIC REQUEST STRUCTURE
// ═══════════════════════════════════════════════════════════════════

const GET = () => {
  return {
    name: "Request Name (optional)",
    url: "https://api.example.com/endpoint",
    
    // Optional: Specify request body type
    body: "json", // "json" | "text" | "xml"
    
    // Request body options (choose one):
    json: { key: "value" },           // For JSON data
    text: "Plain text content",       // For text data
    xml: "<root><item>value</item></root>", // For XML data
    
    // Headers (optional)
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer token',
      // Disable headers with ~ prefix
      '~X-Debug': 'disabled-header',
    },
    
    // Query parameters (optional)
    query: {
      page: 1,
      limit: 10,
      // Disable params with ~ prefix
      '~debug': 'disabled-param',
    },
    
    // Pre-request script (optional)
    pre_request: () => {
      // Runs before sending the request
      // Access request object via 'req'
    },
    
    // Post-response script (optional)
    post_response: () => {
      // Runs after receiving response
      // Access response object via 'res'
    },
  };
};

// ═══════════════════════════════════════════════════════════════════
// 🌍 ENVIRONMENT VARIABLES
// ═══════════════════════════════════════════════════════════════════

const GET_WITH_VARIABLES = () => {
  return {
    name: "Using Variables",
    url: "{{BASE_URL}}/users/{{USER_ID}}",
    headers: {
      'Authorization': 'Bearer {{API_TOKEN}}',
    },
    query: {
      format: "{{RESPONSE_FORMAT}}",
    },
  };
};

// Variables are managed in Environment settings:
// BASE_URL = https://api.example.com
// USER_ID = 123
// API_TOKEN = your-secret-token
// RESPONSE_FORMAT = json

// ═══════════════════════════════════════════════════════════════════
// 📝 REQUEST SCRIPTING API
// ═══════════════════════════════════════════════════════════════════

const REQUEST_SCRIPTING_EXAMPLE = () => {
  return {
    name: "Request Scripting Demo",
    url: "https://httpbin.org/post",
    
    pre_request: () => {
      // URL methods
      console.log('Current URL:', req.getUrl());
      
      // Method methods
      console.log('HTTP Method:', req.getMethod());
      
      // Header methods
      req.setHeader('X-Custom-Header', 'custom-value');
      req.setHeaders({
        'X-Request-ID': crypto.randomUUID(),
        'X-Timestamp': new Date().toISOString(),
      });
      console.log('Headers:', req.getHeaders());
      
      // Query parameter methods
      req.setQuery({
        timestamp: Date.now(),
        source: 'panda-client',
      });
      console.log('Query params:', req.getQuery());
      
      // Body methods
      req.setJson({
        message: 'Hello from pre-request script',
        timestamp: new Date().toISOString(),
      });
      console.log('JSON body:', req.getJson());
      
      // Alternative body methods:
      // req.setText('Plain text content');
      // req.setXml('<root><message>Hello</message></root>');
      
      // Environment variable methods
      req.setVar('LAST_REQUEST_TIME', new Date().toISOString());
      console.log('API Token:', req.getVar('API_TOKEN'));
      
      // Body type detection
      console.log('Body type:', req.getBody()); // "json" | "text" | "xml" | null
      console.log('Body data:', req.getBodyData());
    },
  };
};

// ═══════════════════════════════════════════════════════════════════
// 📊 RESPONSE SCRIPTING API
// ═══════════════════════════════════════════════════════════════════

const RESPONSE_SCRIPTING_EXAMPLE = () => {
  return {
    name: "Response Scripting Demo",
    url: "https://jsonplaceholder.typicode.com/posts/1",
    
    post_response: () => {
      // Response status
      console.log('Status:', res.getStatus());
      console.log('Elapsed time:', res.getElapsedTime(), 'seconds');
      console.log('Content size:', res.getContentSize(), 'bytes');
      
      // Header methods
      console.log('Content-Type:', res.getHeader('content-type'));
      console.log('All headers:', res.getHeaders());
      
      // Response body methods
      const jsonData = res.getJson();    // Parsed JSON object
      const textData = res.getText();    // Raw text content
      const xmlData = res.getXml();      // Raw XML content
      
      console.log('JSON response:', jsonData);
      
      // Environment variable methods
      res.setVar('LAST_RESPONSE_STATUS', res.getStatus().toString());
      res.setVar('LAST_POST_ID', jsonData.id?.toString() || '');
      console.log('Saved post ID:', res.getVar('LAST_POST_ID'));
    },
  };
};

// ═══════════════════════════════════════════════════════════════════
// 🧪 TESTING WITH CHAI ASSERTIONS
// ═══════════════════════════════════════════════════════════════════

const TESTING_EXAMPLE = () => {
  return {
    name: "Testing Demo",
    url: "https://jsonplaceholder.typicode.com/posts",
    json: {
      title: 'Test Post',
      body: 'Test content',
      userId: 1,
    },
    
    post_response: () => {
      // Organize tests with describe blocks
      describe('API Response Tests', () => {
        
        it('should return successful status', () => {
          expect(res.getStatus()).to.equal(201);
        });
        
        it('should have correct content type', () => {
          expect(res.getHeader('content-type')).to.include('application/json');
        });
        
        it('should return created post data', () => {
          const data = res.getJson();
          expect(data).to.be.an('object');
          expect(data).to.have.property('id');
          expect(data.title).to.equal('Test Post');
          expect(data.userId).to.equal(1);
        });
        
        it('should respond within reasonable time', () => {
          expect(res.getElapsedTime()).to.be.below(2); // Less than 2 seconds
        });
        
      });
      
      // Standalone tests (without describe blocks)
      it('should have valid response size', () => {
        expect(res.getContentSize()).to.be.above(0);
      });
      
      // Advanced assertions
      describe('Data Validation', () => {
        
        it('should have valid post structure', () => {
          const post = res.getJson();
          
          // Type checks
          expect(post.id).to.be.a('number');
          expect(post.title).to.be.a('string');
          expect(post.body).to.be.a('string');
          expect(post.userId).to.be.a('number');
          
          // Value checks
          expect(post.title).to.not.be.empty;
          expect(post.id).to.be.above(0);
        });
        
      });
    },
  };
};

// ═══════════════════════════════════════════════════════════════════
// 🔄 HTTP METHODS EXAMPLES
// ═══════════════════════════════════════════════════════════════════

// GET Request
const GET_EXAMPLE = () => {
  return {
    name: "Fetch User Profile",
    url: "https://jsonplaceholder.typicode.com/users/1",
  };
};

// POST Request
const POST_EXAMPLE = () => {
  return {
    name: "Create New Post",
    url: "https://jsonplaceholder.typicode.com/posts",
    json: {
      title: 'My New Post',
      body: 'This is the post content',
      userId: 1,
    },
  };
};

// PUT Request
const PUT_EXAMPLE = () => {
  return {
    name: "Update Post",
    url: "https://jsonplaceholder.typicode.com/posts/1",
    json: {
      id: 1,
      title: 'Updated Post Title',
      body: 'Updated post content',
      userId: 1,
    },
  };
};

// DELETE Request
const DELETE_EXAMPLE = () => {
  return {
    name: "Delete Post",
    url: "https://jsonplaceholder.typicode.com/posts/1",
  };
};

// PATCH Request
const PATCH_EXAMPLE = () => {
  return {
    name: "Partial Update",
    url: "https://jsonplaceholder.typicode.com/posts/1",
    json: {
      title: 'Partially Updated Title',
    },
  };
};

// ═══════════════════════════════════════════════════════════════════
// 🎯 ADVANCED EXAMPLES
// ═══════════════════════════════════════════════════════════════════

const ADVANCED_AUTH_EXAMPLE = () => {
  return {
    name: "Advanced Authentication Flow",
    url: "{{API_BASE}}/protected-endpoint",
    
    pre_request: () => {
      // Dynamic token refresh logic
      const tokenExpiry = req.getVar('TOKEN_EXPIRY');
      const currentTime = Date.now();
      
      if (!tokenExpiry || currentTime > parseInt(tokenExpiry)) {
        console.log('Token expired, refreshing...');
        // In a real scenario, you'd make a token refresh request here
        req.setVar('ACCESS_TOKEN', 'new-refreshed-token');
        req.setVar('TOKEN_EXPIRY', (currentTime + 3600000).toString()); // 1 hour
      }
      
      req.setHeader('Authorization', \`Bearer \${req.getVar('ACCESS_TOKEN')}\`);
    },
    
    post_response: () => {
      describe('Authentication Tests', () => {
        it('should not return unauthorized', () => {
          expect(res.getStatus()).to.not.equal(401);
        });
        
        it('should not return forbidden', () => {
          expect(res.getStatus()).to.not.equal(403);
        });
      });
    },
  };
};

// ═══════════════════════════════════════════════════════════════════
// 📚 TIPS & BEST PRACTICES
// ═══════════════════════════════════════════════════════════════════

/*
🎯 TIPS:

1. Use environment variables for:
   - API base URLs
   - Authentication tokens
   - User IDs and other dynamic values

2. Pre-request scripts are great for:
   - Setting dynamic headers (timestamps, request IDs)
   - Token refresh logic
   - Request data transformation
   - Logging and debugging

3. Post-response scripts are perfect for:
   - Response validation and testing
   - Extracting data for future requests
   - Logging response metrics
   - Setting environment variables from response

4. Testing best practices:
   - Group related tests with describe() blocks
   - Test both success and error scenarios
   - Validate response structure and data types
   - Check performance metrics (response time, size)

5. Organization tips:
   - Use descriptive request names
   - Group related requests in folders
   - Document complex logic with comments
   - Use consistent naming conventions

6. Debugging:
   - Use console.log() in scripts for debugging
   - Check the Tests tab for assertion results
   - Monitor response times and sizes
   - Validate environment variable values
*/`;