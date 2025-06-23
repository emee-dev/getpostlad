# 🐼 Panda

**A modern, git-friendly alternative to Postman for API testing**

![Panda App Screenshot](https://ri3guaa55l.ufs.sh/f/8gXsFydJfZdnahvBxJK5FJ8IseWikZRX0gmq1Y3dBDE2M9Np)

Panda is a powerful REST API testing tool that stores collections as JavaScript files, making them version-control friendly and easily shareable. Built with modern web technologies, Panda offers a clean, intuitive interface for developers who want their API collections to live alongside their code. Offering offline support, less GUI based workflows and a lot more to come.

## ✨ Features

### 🚀 **Core Functionality**

- **JavaScript-based Collections** - Define HTTP requests using clean JavaScript syntax
- **Git-Friendly** - Store collections as `.js` files that work perfectly with version control
- **Environment Variables** - Manage different environments (dev, staging, prod) with ease
- **Request History** - Automatic response caching and history tracking
- **Real-time Testing** - Built-in test runner with Chai assertions
- **Import/Export** - Seamless migration from Postman collections (v2.1+)

### 🎨 **Modern Interface**

- **Dark/Light Theme** - Beautiful themes that adapt to your preference
- **Split-Pane Layout** - Code editor on the left, response viewer on the right
- **Syntax Highlighting** - Full JavaScript syntax highlighting with CodeMirror
- **File Explorer** - Organize requests in folders with context menu actions.
- **Search & Navigation** - Quickly find and navigate between requests

### 🔧 **Developer Experience**

- **Pre/Post Request Scripts** - Execute custom JavaScript before and after requests
- **Environment Interpolation** - Use `{{variables}}` in URLs, headers, and bodies
- **Response Validation** - Write tests to validate API responses automatically
- **Multiple Body Types** - Support for JSON, XML, and plain text payloads
- **Header Management** - Easy header configuration with enable/disable toggles

## 🚀 Quick Start

### 1. **Create Your First Request**

```javascript
const GET = () => {
  return {
    name: "Get User Profile",
    url: "https://jsonplaceholder.typicode.com/users/1",
    headers: {
      "Content-Type": "application/json",
    },
  };
};
```

### 2. **Add Environment Variables**

Set up variables like `{{BASE_URL}}` and `{{API_TOKEN}}` in your environment settings, then use them in your requests:

```javascript
const GET = () => {
  return {
    name: "Protected Endpoint",
    url: "{{BASE_URL}}/api/users/{{USER_ID}}",
    headers: {
      Authorization: "Bearer {{API_TOKEN}}",
    },
  };
};
```

### 3. **Add Request Body**

```javascript
const POST = () => {
  return {
    name: "Create User",
    url: "{{BASE_URL}}/api/users",
    headers: {
      "Content-Type": "application/json",
    },
    json: {
      name: "John Doe",
      email: "john@example.com",
      role: "user",
    },
  };
};
```

### 4. **Add Tests**

```javascript
const POST = () => {
  return {
    name: "Create User with Tests",
    url: "{{BASE_URL}}/api/users",
    json: {
      name: "John Doe",
      email: "john@example.com",
    },

    post_response: () => {
      describe("User Creation", () => {
        it("should return 201 status", () => {
          expect(res.getStatus()).to.equal(201);
        });

        it("should return user with ID", () => {
          const user = res.getJson();
          expect(user).to.have.property("id");
          expect(user.name).to.equal("John Doe");
        });
      });

      // Save user ID for future requests
      const user = res.getJson();
      res.setVar("CREATED_USER_ID", user.id.toString());
    },
  };
};
```

## 📚 Documentation

### **HTTP Methods**

Panda supports all standard HTTP methods. Use uppercase function names:

```javascript
const GET = () => {
  /* ... */
};
const POST = () => {
  /* ... */
};
const PUT = () => {
  /* ... */
};
const DELETE = () => {
  /* ... */
};
const PATCH = () => {
  /* ... */
};
```

### **Request Structure**

```javascript
const METHOD = () => {
  return {
    name: "Request Name", // Optional: Display name
    url: "https://api.example.com", // Required: Request URL

    // Body type (optional)
    body: "json", // "json" | "text" | "xml"

    // Request body (choose one)
    json: { key: "value" }, // JSON payload
    text: "Plain text content", // Text payload
    xml: "<root>XML content</root>", // XML payload

    // Headers (optional)
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer token",
      "~X-Debug": "disabled", // Prefix with ~ to disable
    },

    // Query parameters (optional)
    query: {
      page: 1,
      limit: 10,
      "~debug": "disabled", // Prefix with ~ to disable
    },

    // Scripts (optional)
    pre_request: () => {
      // Runs before sending request
      req.setHeader("X-Timestamp", new Date().toISOString());
    },

    post_response: () => {
      // Runs after receiving response
      expect(res.getStatus()).to.equal(200);
    },
  };
};
```

### **Environment Variables**

Use double curly braces to reference environment variables:

```javascript
const GET = () => {
  return {
    url: "{{BASE_URL}}/users/{{USER_ID}}",
    headers: {
      Authorization: "Bearer {{API_TOKEN}}",
    },
  };
};
```

### **Scripting API**

#### **Request Object (`req`)**

```javascript
// URL and method
req.getUrl(); // Get current URL
req.getMethod(); // Get HTTP method

// Headers
req.setHeader(key, value); // Set single header
req.setHeaders(object); // Set multiple headers
req.getHeaders(); // Get all headers

// Query parameters
req.setQuery(object); // Set query parameters
req.getQuery(); // Get query parameters

// Body
req.setJson(data); // Set JSON body
req.setText(data); // Set text body
req.setXml(data); // Set XML body
req.getJson(); // Get JSON body
req.getText(); // Get text body
req.getXml(); // Get XML body
req.getBody(); // Get body type
req.getBodyData(); // Get raw body data

// Environment variables
req.setVar(key, value); // Set environment variable
req.getVar(key); // Get environment variable
```

#### **Response Object (`res`)**

```javascript
// Status and metrics
res.getStatus(); // HTTP status code
res.getElapsedTime(); // Request duration (seconds)
res.getContentSize(); // Response size (bytes)

// Headers
res.getHeader(key); // Get single header
res.getHeaders(); // Get all headers

// Body
res.getJson(); // Parse response as JSON
res.getText(); // Get response as text
res.getXml(); // Get response as XML

// Environment variables
res.setVar(key, value); // Set environment variable
res.getVar(key); // Get environment variable
```

### **Testing with Chai**

Panda includes Chai for assertions:

```javascript
post_response: () => {
  describe("API Tests", () => {
    it("should return success status", () => {
      expect(res.getStatus()).to.equal(200);
    });

    it("should return valid JSON", () => {
      const data = res.getJson();
      expect(data).to.be.an("object");
      expect(data).to.have.property("id");
    });

    it("should respond quickly", () => {
      expect(res.getElapsedTime()).to.be.below(1);
    });
  });
};
```

## 📦 Import from Postman

Panda supports importing Postman collections (v2.1+):

1. Export your Postman collection as JSON
2. Click **"New" → "Import Collection"** in Panda
3. Select your `.json` file
4. Your requests will be converted to JavaScript format

## 🔧 Tech Stack

- **Frontend**: Next.js 13, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Editor**: CodeMirror 6 with JavaScript syntax highlighting
- **Database**: Convex (real-time backend)
- **Authentication**: Convex Auth with email/password
- **Testing**: Chai assertions
- **File Handling**: JSZip for import/export

## 🏗️ Architecture

Panda is built with modern web technologies:

- **File-based Collections**: Each request is a JavaScript function
- **Real-time Sync**: Collections sync across devices via Convex
- **Environment Management**: Separate environments for different stages
- **Response Caching**: Automatic history tracking for debugging
- **Workspace Organization**: Group related requests environments, response histories in workspaces.

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and add tests
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Setup

```bash
# Clone the repository
git clone https://github.com/emee-dev/getpostlad.git
cd getpostlad

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start the development server
npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Discord Community**: [Join our Discord](https://discord.gg/BmvSwRXX)
- **Issues**: [GitHub Issues](https://github.com/emee-dev/getpostlad/issues)

## 🎯 Roadmap

- [ ] **GraphQL Support** - Query and mutation testing
- [ ] **WebSocket Testing** - Real-time connection testing
- [ ] **Mock Server** - Built-in mock server for testing
- [ ] **Team Collaboration** - Real-time collaboration features
- [ ] **API Documentation** - Generate docs from collections
- [ ] **Performance Testing** - Load testing capabilities
- [ ] **CLI Tool** - Command-line interface for CI/CD

---

**Made with ❤️ by Emmanuel Ajike**
