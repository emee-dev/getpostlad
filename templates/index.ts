export const basicTemplate = `const GET = () => {
  return {
    name: "Basic GET Request",
    url: "https://jsonplaceholder.typicode.com/posts/1",
    query: {
      page: "1",
      limit: 20,
      "~name": "emee",
    },
    headers: {
      '~Authorization': 'Bearer token', // Disabled using ~
      'Content-Type': 'application/json',
    },
  };
};


// 📦 Postman Collection Samples (v2.1):
// https://drive.google.com/drive/folders/1GHvAWrivV7bHbUU-X_IEj4iGGyQNQM60

// 🐼 Basic Panda Request Template
// - Use capitalized HTTP methods as function names: GET, POST, PUT, DELETE, PATCH.
// - Prefix headers or query parameters with \`~\` to disable them (i.e., not sent).
// - Keep requests deterministic, no nesting or dynamic method names.

// ✅ Best Practices:
// 1. Always use uppercase method names.
// 2. Keep functions pure and flat – avoid nesting.
// 3. Move all query parameters into the \`query\` object. Don't use \`?\` in the URL.


`;

export const requestBodyTemplate = `const POST = () => {
  return {
    name: "Create Post (JSON)",
    url: "https://jsonplaceholder.typicode.com/posts",
    headers: {
      'Content-Type': 'application/json',
    },
    body: "json",
    // Request body: json
    json: { 
      title: 'My New Post', 
      body: 'Post content goes here',
      userId: 1,
    },
  };
};

const PUT = () => {
  return {
    name: "Update Resource (Text)",
    url: "https://httpbin.org/put",
    headers: {
      'Content-Type': 'text/plain',
    },
    // Request body: text
    text: "Plain text payload", 
  };
};

const POST = () => {
  return {
    name: "Submit Data (XML)",
    url: "https://httpbin.org/post",
    headers: {
      'Content-Type': 'application/xml',
    },
    // Request body: xml
    xml: \`
      <?xml version="1.0" encoding="UTF-8"?>
      <user>
        <name>John Doe</name>
        <email>john@example.com</email>
      </user>\`,
  };
};

// 🔁 Supported \`body\` types: "json" (default), "text", "xml"
// If \`body\` is defined, Panda uses the corresponding key (json/text/xml)
`;

export const variablesTemplate = `const GET = () => {
  return {
    name: "Using Env Vars",
    url: "{{baseUrl}}/users/{{USER_ID}}",
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

// 🔧 Environment Variables Format:
// ✅ {{{{VARIABLE_NAME}}}}
// ❌ {{ variable name }} (No spaces allowed)
`;

export const scriptingTemplate = `const POST = () => {
  return {
    name: "Post with Scripts",
    url: "https://jsonplaceholder.typicode.com/posts",
    headers: {
      'Content-Type': 'application/json',
    },
    json: {
      title: 'Scripted Post',
      body: 'Script content',
      userId: 1,
    },

    pre_request: () => {
      req.setHeader('X-Request-ID', crypto.randomUUID());
      req.setHeader('X-Timestamp', new Date().toISOString());
      const data = req.getJson();
      data.timestamp = Date.now();
      req.setJson(data);
      req.setVar('LAST_REQUEST_TIME', new Date().toISOString());
    },

    post_response: () => {
      describe('Post-Response Validation', () => {
        it('should return 201', () => {
          expect(res.getStatus()).to.equal(201);
        });

        it('should return application/json', () => {
          expect(res.getHeader('content-type')).to.include('application/json');
        });

        it('should contain post ID', () => {
          const data = res.getJson();
          expect(data).to.have.property('id');
        });
      });

      res.setVar('CREATED_POST_ID', res.getJson().id.toString());
    },
  };
};

// ⚠️ Note:
// - Do not nest describe() or it().
// - Tests fail fast (stop after first failure).
// - Use describe blocks for grouping related assertions.
`;

export const fullDocsTemplate = `const POST = () => {
  return {
    name: "💡 Full Panda Scripting Demo",
    url: "https://jsonplaceholder.typicode.com/posts",
    body: "json",
    json: {
      title: "Panda Scripting",
      body: "A complete reference for scripting APIs",
      userId: 123,
    },

    // 🧠 Runs before sending request
    pre_request: () => {
      req.setHeader("demo", "panda-client");              // ➜ Set single header
      req.setHeaders({                                    // ➜ Set multiple headers
        "req_id": crypto.randomUUID(),
        "platform": "web",
      });

      req.setQuery({                                      // ➜ Set query params
        timestamp: String(Date.now()),
        debug: "true",
      });

      req.setVar("last_run", new Date().toISOString());
      req.setJson({ message: "Updated body", userId: 99 });
      req.setText("Overwritten by text");                // ➜ Can overwrite body
      req.setXml(\`<msg>Hello</msg>\`);                    // ➜ Or overwrite with XML
      
      console.log("Text body:", req.getText());
      console.log("XML body:", req.getXml());
      console.log("Body type:", req.getBody());          // ➜ "json" | "text" | "xml"
      console.log("Body data:", req.getBodyData());      // ➜ Data based on body type

      console.log("URL:", req.getUrl());                 // ➜ Full URL
      console.log("Method:", req.getMethod());           // ➜ HTTP method (GET, POST, etc)
      console.log("Headers:", req.getHeaders());         // ➜ Get all headers
      console.log("Query Params:", req.getQuery());      // ➜ Get query params
      console.log("JSON body:", req.getJson());

      console.log("Env:", req.getVar("API_TOKEN"));
    },

    // 📥 Runs after receiving response
    post_response: () => {
      const response = res.getJson();
      res.setVar("NEW_POST_ID", response.id?.toString() || "N/A");
 
      describe("Response Validations", () => {
        it("should return 201 Created", () => {
          expect(res.getStatus()).to.equal(201);
        });

        it("should return correct content type", () => {
          expect(res.getHeader("content-type")).to.include("application/json");
        });

        it("should contain post ID", () => {
          const data = res.getJson();
          expect(data).to.have.property("id");
          expect(data.id).to.be.a("number");
        });

        it("should complete within 2s", () => {
          expect(res.getElapsedTime()).to.be.below(2000);
        });
      });

      console.log("Status:", res.getStatus());                 // ➜ HTTP status code
      console.log("Time:", res.getElapsedTime(), "ms");        // ➜ Elapsed request time
      console.log("Size:", res.getContentSize(), "bytes");     // ➜ Size of response body
      console.log("All Headers:", res.getHeaders());           // ➜ All response headers
      console.log("Content-Type:", res.getHeader("content-type"));
      console.log("JSON:", res.getJson());                     // ➜ Parsed JSON
      console.log("Text:", res.getText());                     // ➜ Raw text
      console.log("XML:", res.getXml());                       // ➜ Raw XML
      console.log("postId:", res.getVar("NEW_POST_ID"));
    },
  };
};
`;
