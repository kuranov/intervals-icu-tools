# **Architecting the Next-Generation TypeScript Client for Intervals.icu: A Comprehensive Engineering Report (2025)**

## **1\. Executive Summary**

The software development landscape in 2025 is defined by a rigorous focus on type safety, runtime efficiency, and modular architecture. As the JavaScript ecosystem matures, the era of loosely typed, monolithic API wrappers has given way to sophisticated, "professional-grade" clients that prioritize developer experience (DX), bundle size optimization, and robust error handling. This report presents an exhaustive architectural analysis and implementation strategy for building an open-source TypeScript client for the **Intervals.icu** API.

Intervals.icu has established itself as a premier platform for sports analytics, offering a rich RESTful API that enables developers to access athlete data, manage planned workouts, and analyze complex activity streams.1 However, the current developer ecosystem lacks a unified, type-safe library, forcing integrators to rely on ad-hoc implementations or basic wrappers that fail to abstract the API's intricacies effectively.3

This report serves as a definitive guide for engineering a client that meets modern 2025 standards. It synthesizes research on the latest HTTP client libraries (Ky, ofetch), validation engines (Valibot), error handling patterns (Result type), and build tools (tsup, Changesets). By analyzing the specific constraints and behaviors of the Intervals.icu API—such as its unique authentication mechanisms, rate limiting behaviors, and data model quirks—this document outlines a blueprint for a client that is not merely functional, but architecturally superior.

The following analysis is structured to guide the reader through the entire engineering lifecycle: from analyzing the target system and selecting the core technology stack to implementing advanced patterns for error management, testing, and package distribution. The goal is to produce a library that is lightweight, tree-shakable, and reliable enough for mission-critical integration in high-performance web applications.

## ---

**2\. Analysis of the Intervals.icu API Ecosystem**

Before defining the client architecture, it is imperative to deconstruct the target system. The Intervals.icu API is a mature, feature-rich interface that exposes the platform's core entities: Athletes, Activities, Events, and Wellness data. Understanding its specific behaviors, constraints, and undocumented quirks is essential for building a robust abstraction layer.

### **2.1 Authentication and Authorization Models**

The API implements a dual-authentication strategy designed to support both personal scripting and multi-user third-party applications. This dichotomy necessitates a flexible configuration strategy in the client library.

#### **2.1.1 Basic Authentication (Personal Use)**

For individual developers or server-side scripts accessing a single user's data, the API utilizes Basic Authentication. The username is fixed as the literal string "API_KEY", and the password is the user's unique API key, which can be generated in the platform's settings page.2

- **Mechanism:** The client must encode API_KEY:\<user_api_key\> in Base64 and attach it to the Authorization header as Basic \<base64_string\>.
- **Use Case:** This is ideal for "headless" scripts, cron jobs, or personal dashboards where the developer owns the data.6

#### **2.1.2 OAuth 2.0 (Third-Party Applications)**

For public-facing applications (e.g., a mobile coaching app or a race planning tool), OAuth 2.0 is mandatory. This protects user credentials by issuing short-lived access tokens via an authorization code flow.7

- **Scopes:** Access is granular, controlled by specific scopes such as ACTIVITY:READ, ACTIVITY:WRITE, WELLNESS:READ, WELLNESS:WRITE, CALENDAR:READ, and SETTINGS:READ.7
- **Flow:** The client must facilitate the exchange of an authorization code for an access token via the POST /api/oauth/token endpoint.
- **Implication:** A professional-grade client cannot simply accept an API key. It must provide a Configuration interface that accepts either an API key pair or an OAuth access token, automatically selecting the appropriate header strategy (Basic vs. Bearer). Furthermore, robust clients should expose hooks to handle 401 Unauthorized responses, allowing the consuming application to trigger token refresh flows transparently.7

### **2.2 Rate Limiting and Traffic Control**

API stability is maintained through strict rate limiting. Observations and documentation indicate a limit of approximately **10 requests per second (RPS)** per IP address for standard access, with some variability based on "burst" allowances.8

**Constraint Analysis:**

- **Behavior:** Exceeding the limit results in a 429 Too Many Requests status code.
- **Retry-After Header:** While standard HTTP specifications suggest a Retry-After header indicating the wait time in seconds, anecdotal evidence from the developer community suggests inconsistencies. Some integrations report missing headers or require fallback logic.10
- **Implication:** The client architecture must not strictly rely on the presence of Retry-After. It must implement a "smart" backoff strategy. If the header is present, the client waits the specified duration. If absent, it must employ an **exponential backoff** algorithm (e.g., wait 1s, then 2s, then 4s) to avoid "retry storms" that could further degrade the API or trigger longer bans.12
- **Concurrency:** To maximize throughput without hitting limits, the client should optionally support a request queue with a concurrency limiter (e.g., p-limit), ensuring that bulk operations (like fetching history) do not inadvertently flood the network layer.13

### **2.3 Data Models and Resource Structures**

The Intervals.icu data model is complex, reflecting the domain of sports science.

- **Activities:** These are the core unit of data. They contain standard metrics (distance, time, watts) and Intervals.icu-specific fields like icu_training_load, icu_intensity, and icu_intervals.2
- **The "Zero" ID:** A unique convenience feature of the API is the use of the ID 0 or string "0" in path parameters (e.g., /api/v1/athlete/0/activities). This instructs the API to act on the athlete associated with the current API key or token, simplifying configuration for single-user contexts.2
- **Streams:** High-frequency data (1-second intervals for power, heart rate, etc.) is available via specific endpoints. These responses can be large, necessitating efficient parsing and potential support for binary formats (FIT files) alongside JSON.15
- **Wellness:** This resource tracks daily metrics like weight, HRV, and sleep. It supports bulk operations, which is critical for syncing historical data from other platforms.6

### **2.4 Integration Challenges and Quirks**

Research into developer forums reveals several specific challenges that the client must address:

- **Format Handling:** While JSON is the default, certain endpoints offer CSV exports or require FIT file uploads via multipart/form-data. The client must abstract the complexity of constructing FormData objects for file uploads.15
- **Uncertain Schemas:** The API is actively developed, meaning fields may be added without warning. Runtime validation (discussed in Section 4\) must be "lenient" by default—stripping unknown fields rather than crashing—while strict enough to ensure core data integrity.16
- **Existing Types:** There exists an NPM package @intervals-icu/js-data-model containing type definitions generated from the source code.17 A professional client should verify alignment with these types, or potentially use them as a reference source for generating its own Zod/Valibot schemas.

## ---

**3\. The Modern HTTP Client Architecture**

In 2025, the choice of the underlying HTTP engine is a foundational architectural decision. The historical dominance of Axios has waned in favor of lighter, standard-compliant libraries that leverage the native Fetch API.

### **3.1 The Decline of Axios and the Rise of Ky**

For nearly a decade, Axios was the default choice for JavaScript HTTP requests due to its ease of use compared to XMLHttpRequest. However, with fetch now universally available in Node.js (since v18) and all modern browsers, the overhead of Axios is increasingly difficult to justify.18

**Comparative Technology Matrix:**

| Feature          | Axios                                  | Ky                                   | Native Fetch          | Architectural Verdict                     |
| :--------------- | :------------------------------------- | :----------------------------------- | :-------------------- | :---------------------------------------- |
| **Engine**       | XMLHttpRequest (Browser) / http (Node) | Native fetch                         | Native fetch          | **Ky** wins on modern standards.          |
| **Bundle Size**  | \~12kB (gzipped)                       | \~1kB (gzipped)                      | 0kB                   | **Ky** is significantly lighter.19        |
| **Retries**      | Requires axios-retry plugin            | Built-in                             | Manual implementation | **Ky** handles 429s natively.19           |
| **Interceptors** | Mutable interceptor stack              | Hooks (beforeRequest, afterResponse) | None                  | **Ky** hooks are safer and immutable.     |
| **Typing**       | Good                                   | Excellent                            | Basic                 | **Ky** offers superior generic inference. |

Why Ky is the 2025 Standard:  
Ky effectively acts as a "standard library" extension to Fetch. It fixes the annoyances of raw fetch (e.g., 404s not throwing errors) and adds critical features like timeout handling and retries without the bloat of Axios.18 For the Intervals.icu client, Ky's built-in retry logic is particularly valuable for handling the transient 429 errors described in Section 2.2.19

### **3.2 Architectural Pattern: The Abstracted Client**

While Ky is the chosen implementation, professional software engineering principles dictate that we should not leak this implementation detail to the library consumer. We will employ the **Adapter Pattern** or a light abstraction layer.

Design Proposal:  
The client will expose a high-level IntervalsClient class. Internally, this class will instantiate a configured Ky instance.

TypeScript

// Conceptual Architecture  
class IntervalsClient {  
 private httpClient: KyInstance;

constructor(config: IntervalsConfig) {  
 this.httpClient \= ky.create({  
 prefixUrl: 'https://intervals.icu/api/v1',  
 headers: this.buildHeaders(config),  
 retry: {  
 limit: 3,  
 statusCodes: ,  
 afterStatusCodes: , // Respect Retry-After  
 },  
 hooks: {  
 beforeError: \[  
 // Normalize errors into a domain-specific ApiError  
 \]  
 }  
 });  
 }

// Domain modules  
 public get activities() { return new ActivitiesResource(this.httpClient); }  
 public get wellness() { return new WellnessResource(this.httpClient); }  
}

This architecture achieves **Separation of Concerns**:

1. **Network Layer:** Handles retries, timeouts, and auth headers.
2. **Resource Layer:** Handles endpoint URLs (/athlete/0/activities) and data transformation.
3. **Public API:** Provides a clean, typed surface area for the developer.

### **3.3 Handling Binary Data and Compression**

Intervals.icu activities can contain massive amounts of data (streams). Efficient handling is non-negotiable.

- **Compression:** Ky (via fetch) handles standard gzip decompression automatically.
- **Uploads:** For uploading FIT files (POST /v1/athlete/{id}/activities), the client must abstract the FormData complexity. The method signature should accept a Blob, Buffer, or File object, automatically setting the correct Content-Type: multipart/form-data headers.6

## ---

**4\. Type Safety and Runtime Validation**

TypeScript provides compile-time safety, but API clients operate at the boundary of the application where runtime data is untrusted. In 2025, relying solely on TypeScript interfaces (as Activity) is considered an anti-pattern because API responses can change, leading to runtime errors that manifest far from the source.

### **4.1 The Shift from Zod to Valibot**

For several years, Zod was the dominant schema validation library. However, its large bundle size and object-oriented architecture (which resists tree-shaking) have led to the rise of **Valibot**.20

**Why Valibot for a Library?**

- **Tree Shaking:** Valibot is built on independent functions. If a client only uses v.string() and v.number(), only those functions are included in the final bundle. Zod includes its entire class hierarchy regardless of usage.22
- **Size:** A Valibot schema is often 90% smaller than an equivalent Zod schema (\<1kB vs \~13kB).23
- **Performance:** Benchmarks indicate Valibot performs validation significantly faster, which is crucial when parsing large arrays of activity summaries.20

### **4.2 Schema Strategy for Intervals.icu**

We will define Valibot schemas for every resource. These schemas act as the "Source of Truth" for the library.

**Example: Activity Schema Implementation**

TypeScript

import \* as v from 'valibot';

export const ActivitySchema \= v.object({  
 id: v.string(),  
 start_date_local: v.string(),  
 name: v.string(),  
 type: v.string(),  
 moving_time: v.number(),  
 elapsed_time: v.number(),  
 // Optional/Nullable fields common in Intervals data  
 icu_training_load: v.optional(v.number()),  
 average_watts: v.optional(v.number()),  
 average_heartrate: v.optional(v.number()),  
 // Lenient handling of unknown fields ensures forward compatibility  
 ...v.unknown()  
});

// Derive static TypeScript type directly from the runtime schema  
export type Activity \= v.InferOutput\<typeof ActivitySchema\>;

### **4.3 Validation Pipelines**

The client will implement a validation pipeline within the HTTP layer. When data returns from Ky, it passes through v.parse(Schema, data).

- **Success:** The typed data is returned to the user.
- **Failure:** A explicit SchemaValidationError is thrown (or returned, see Section 5), detailing exactly which field failed (e.g., "Expected number for 'moving_time', received string"). This aids debugging significantly compared to generic "undefined is not a function" errors.21

For lists (e.g., GET /activities), we will use v.array(ActivitySchema). To optimize performance for large datasets, we may consider a "Partial" schema that only validates critical fields needed for the list view, reserving the full validation for GET /activity/{id}.23

## ---

**5\. Error Handling: The "Errors as Values" Pattern**

One of the most significant shifts in TypeScript best practices by 2025 is the move away from throwing exceptions for anticipated errors. Exceptions (try/catch) are computationally expensive, break control flow, and crucially, are **not typed** in TypeScript (a catch block error is always unknown or any).25

### **5.1 The Result Pattern**

The **Result Pattern**, inspired by functional languages like Rust and Haskell, treats errors as first-class citizens (values) rather than side effects.

Implementation:  
The client methods will strictly return a Result type.

TypeScript

// Core Type Definition  
export type Result\<T, E\> \=

| { ok: true; value: T }  
| { ok: false; error: E };

// Usage in Client  
public async listActivities(): Promise\<Result\<Activity, ApiError\>\> {  
 //...  
}

### **5.2 Advantages for the Consumer**

This pattern forces the developer to handle the error state, eliminating "unhandled promise rejections."

**Comparison: Try/Catch vs. Result Pattern**

**The Legacy Way (Try/Catch):**

TypeScript

try {  
 const activities \= await client.getActivities();  
 // Do something  
} catch (error) {  
 // What is error? Is it a 404? A network timeout? A schema error?  
 // No type support here.  
}

**The Modern Way (Result Pattern):**

TypeScript

const result \= await client.getActivities();

if (\!result.ok) {  
 // TypeScript narrows 'result.error' to specific ApiError type  
 switch (result.error.code) {  
 case 'RATE_LIMIT':  
 console.warn(\`Wait ${result.error.retryAfter} seconds\`);  
 break;  
 case 'AUTH_FAILED':  
 redirectToLogin();  
 break;  
 }  
 return;  
}

// TypeScript knows 'result.value' is definitely Activity  
renderList(result.value);

### **5.3 Domain-Specific Error Mapping**

The client will map standard HTTP codes to domain errors:

- 401 \-\> UnauthorizedError (Signal to refresh token)
- 403 \-\> ForbiddenError (Scope missing?)
- 404 \-\> NotFoundError
- 429 \-\> RateLimitError (Contains retryAfter value)
- ValibotError \-\> SchemaError (Data mismatch)

This abstraction allows the consuming application to write logic based on _semantic_ meanings rather than HTTP status codes.25

## ---

**6\. Package Engineering and Distribution**

Building a library in 2025 requires navigating the "Dual Package Hazard"—ensuring compatibility with both the modern ES Module (ESM) standard and the legacy CommonJS (CJS) system used by older Node.js installations.

### **6.1 Bundling with tsup**

tsup is the industry-standard tool for bundling TypeScript libraries. It requires zero config for basic cases but offers deep customization via esbuild.

**Configuration Strategy (tsup.config.ts):**

1. **Dual Format:** We will configure format: \['esm', 'cjs'\].
2. **Type Definitions:** dts: true ensures .d.ts files are generated, which is critical for TypeScript consumers.
3. **Clean:** Automatically clean the dist folder.
4. **Tree Shaking:** Enabled to ensure unused Valibot functions are stripped.
5. **Code Splitting:** To prevent code duplication across entry points.

TypeScript

import { defineConfig } from 'tsup';

export default defineConfig({  
 entry: \['src/index.ts'\],  
 format: \['cjs', 'esm'\],  
 dts: true,  
 clean: true,  
 treeshake: true,  
 minify: false, // Consumers should handle minification  
 sourcemap: true,  
});

### **6.2 The package.json Exports Field**

To correctly expose these dual builds, the exports field is mandatory.28

JSON

{  
 "name": "intervals-icu-client",  
 "type": "module",  
 "exports": {  
 ".": {  
 "import": {  
 "types": "./dist/index.d.ts",  
 "default": "./dist/index.mjs"  
 },  
 "require": {  
 "types": "./dist/index.d.cts",  
 "default": "./dist/index.cjs"  
 }  
 }  
 }  
}

This configuration ensures that tools like Vite pick up the tree-shakable ESM build, while a standard Node require() script picks up the CJS build, with Typescript correctly resolving types for both.29

### **6.3 Semantic Versioning with Changesets**

Automating the release process is critical for maintenance. **Changesets** is the preferred tool for monorepos and libraries in 2025\.30

- **Workflow:** When a contributor opens a PR, they add a "changeset" (a markdown file describing the change).
- **Release:** A GitHub Action consumes these changesets, determines the next semantic version (Patch/Minor/Major), updates the changelog, and publishes to NPM.
- **Advantage:** Unlike semantic-release, which relies on commit message parsing (which can be fragile), Changesets is explicit and allows for human editorial control over the changelog.32

## ---

**7\. Testing Strategy: Vitest and MSW**

A professional-grade library requires a rigorous testing strategy that simulates real-world conditions without depending on the live API (which would be slow, flaky, and rate-limited).

### **7.1 Test Runner: Vitest**

**Vitest** replaces Jest as the default runner. It is built on Vite, uses the same configuration, supports ESM natively, and is significantly faster.34 Its compatibility with the jest API means the learning curve is minimal.

### **7.2 Network Mocking: Mock Service Worker (MSW)**

Testing HTTP clients by mocking fetch or axios methods is an anti-pattern because it tests implementation details. If you switch from Axios to Ky, your tests break. **MSW** solves this by intercepting requests at the network layer.35

**Testing Scenarios with MSW:**

1. **Happy Path:** MSW intercepts GET /activities and returns a mock JSON. We assert that the client correctly parses this into an array of Activity objects.
2. **Schema Validation:** We configure MSW to return a payload missing a required field (e.g., id). We assert that the client returns a Result.err containing a SchemaError.
3. **Rate Limits:** We configure MSW to return a 429 with Retry-After: 2\. We assert that the client's internal timer waits for \~2 seconds before resolving.
4. **Auth Failure:** We return 401\. We assert the client returns an UnauthorizedError.

**Integration Test Example:**

TypeScript

// test/activities.test.ts  
import { http, HttpResponse } from 'msw';  
import { setupServer } from 'msw/node';  
import { IntervalsClient } from '../src';

const server \= setupServer(  
 http.get('https://intervals.icu/api/v1/athlete/0/activities', () \=\> {  
 return HttpResponse.json();  
 })  
);

beforeAll(() \=\> server.listen());  
afterEach(() \=\> server.resetHandlers());  
afterAll(() \=\> server.close());

test('fetches and validates activities', async () \=\> {  
 const client \= new IntervalsClient({ apiKey: 'test', athleteId: '1' });  
 const result \= await client.activities.list();

expect(result.ok).toBe(true);  
 if (result.ok) {  
 expect(result.value.name).toBe('Test Ride');  
 }  
});

## ---

**8\. Documentation and Developer Experience**

Professional libraries are distinguished by their documentation.

### **8.1 Typedoc for API References**

We will use **TypeDoc** to automatically generate API reference documentation from the source code comments. By strictly using TSDoc standard comments (e.g., @param, @returns, @example), we ensure that documentation is always in sync with the code.37

### **8.2 The "Cookbook" Approach**

Following the example of the Intervals.icu community, the documentation should include a "Cookbook" or "Recipes" section. This goes beyond API references to show how to solve specific problems:

- "Syncing daily weight from a smart scale."
- "Uploading a structured workout from a ZWO file."
- "Backfilling activity history without hitting rate limits."  
  This aligns with the Intervals.icu API Integration Cookbook found on their forums.6

## ---

**9\. Detailed Implementation Roadmap**

### **Phase 1: Foundation**

1. **Repository Setup:** Initialize with pnpm, tsup, vitest, and biome (for linting).
2. **Core Types:** Implement the Result generic type and ApiError class.
3. **Network Layer:** Setup Ky instance with default hooks for auth and error normalization.

### **Phase 2: Domain Modeling**

1. **Schema Definition:** Translate Intervals.icu JSON samples into Valibot schemas.
2. **Resource Implementation:** Create Activities, Events, and Wellness classes that use the HTTP client and Schemas.
3. **Binary Handling:** Implement helper functions for multipart/form-data uploads (FIT files).

### **Phase 3: Robustness**

1. **Rate Limiter:** Implement the interceptor for 429 handling with exponential backoff.
2. **Testing:** Write MSW handlers for all endpoints and achieve \>90% code coverage.
3. **CI/CD:** Setup GitHub Actions to run tests and use Changesets for publishing.

## ---

**10\. Conclusion**

The architecture proposed in this report represents the convergence of the best practices of 2025\. By moving away from bloated legacy tools (Axios, Zod) to modern, modular alternatives (Ky, Valibot), we achieve a client that is lightweight and performant. By adopting the Result pattern, we provide a level of safety and predictability that try/catch cannot match. Finally, by respecting the specific constraints of the Intervals.icu API—its rate limits, auth flows, and data models—we ensure the client is a reliable tool for the developer community. This is not just a wrapper; it is a piece of professional engineering infrastructure.

## ---

**11\. Technical Appendix: Reference Implementations**

### **A. The Result Pattern (Source:**

27.

TypeScript

export type Result\<T, E \= Error\> \= { ok: true; value: T } | { ok: false; error: E };

export const ok \= \<T\>(value: T): Result\<T, never\> \=\> ({ ok: true, value });  
export const err \= \<E\>(error: E): Result\<never, E\> \=\> ({ ok: false, error });

export async function safeRequest\<T\>(promise: Promise\<T\>): Promise\<Result\<T, ApiError\>\> {  
 try {  
 const data \= await promise;  
 return ok(data);  
 } catch (e) {  
 return err(ApiError.from(e));  
 }  
}

### **B. Valibot Schema for Activity (Source:**

21.

TypeScript

import \* as v from 'valibot';

export const ActivitySchema \= v.object({  
 id: v.string(),  
 start_date: v.string(),  
 name: v.string(),  
 type: v.string(),  
 moving_time: v.number(),  
 distance: v.number(),  
 icu_training_load: v.optional(v.number()),  
 // Allow unknown fields for forward compatibility  
 ...v.unknown()  
});

### **C. tsup Configuration (Source:**

39.

TypeScript

import { defineConfig } from 'tsup';

export default defineConfig({  
 entry: \['src/index.ts'\],  
 format: \['cjs', 'esm'\],  
 dts: true,  
 clean: true,  
 treeshake: true,  
});

#### **Works cited**

1. Swagger and the Intervals API \- Intervals Help Site, accessed December 29, 2025, [https://help.myintervals.com/api/swagger/](https://help.myintervals.com/api/swagger/)
2. API access to Intervals.icu \- Guide, accessed December 29, 2025, [https://forum.intervals.icu/t/api-access-to-intervals-icu/609](https://forum.intervals.icu/t/api-access-to-intervals-icu/609)
3. Python script to sent training events to Intervals.icu API \- GitHub, accessed December 29, 2025, [https://github.com/h3xh0und/intervals.icu-api](https://github.com/h3xh0und/intervals.icu-api)
4. Python API for intervals.icu, accessed December 29, 2025, [https://forum.intervals.icu/t/python-api-for-intervals-icu/3341](https://forum.intervals.icu/t/python-api-for-intervals-icu/3341)
5. API access to Intervals.icu \- Page 11 \- Guide, accessed December 29, 2025, [https://forum.intervals.icu/t/api-access-to-intervals-icu/609?page=11](https://forum.intervals.icu/t/api-access-to-intervals-icu/609?page=11)
6. Intervals.icu API Integration Cookbook \- Guide, accessed December 29, 2025, [https://forum.intervals.icu/t/intervals-icu-api-integration-cookbook/80090](https://forum.intervals.icu/t/intervals-icu-api-integration-cookbook/80090)
7. Intervals.icu OAuth support \- Announcements, accessed December 29, 2025, [https://forum.intervals.icu/t/intervals-icu-oauth-support/2759](https://forum.intervals.icu/t/intervals-icu-oauth-support/2759)
8. API access to Intervals.icu \- Page 24 \- Guide, accessed December 29, 2025, [https://forum.intervals.icu/t/api-access-to-intervals-icu/609?page=24](https://forum.intervals.icu/t/api-access-to-intervals-icu/609?page=24)
9. Intervals API Rate Limits, accessed December 29, 2025, [https://help.myintervals.com/api/api-rate-limits/](https://help.myintervals.com/api/api-rate-limits/)
10. Retry-After HTTP header when hiting Rate Limit \#21904 \- GitHub, accessed December 29, 2025, [https://github.com/hashicorp/vault/issues/21904](https://github.com/hashicorp/vault/issues/21904)
11. When rate limiting is hit return return a Retry-After header \- Feature, accessed December 29, 2025, [https://meta.discourse.org/t/when-rate-limiting-is-hit-return-return-a-retry-after-header/81838](https://meta.discourse.org/t/when-rate-limiting-is-hit-return-return-a-retry-after-header/81838)
12. HTTP Error 429 (Too Many Requests) \- How to Fix \- Postman Blog, accessed December 29, 2025, [https://blog.postman.com/http-error-429/](https://blog.postman.com/http-error-429/)
13. \[SOLVED\] Guidance on API rate limits for bulk activity reloading, accessed December 29, 2025, [https://forum.intervals.icu/t/solved-guidance-on-api-rate-limits-for-bulk-activity-reloading/110818](https://forum.intervals.icu/t/solved-guidance-on-api-rate-limits-for-bulk-activity-reloading/110818)
14. Server side data model for scripts \- Intervals.icu Forum, accessed December 29, 2025, [https://forum.intervals.icu/t/server-side-data-model-for-scripts/25781](https://forum.intervals.icu/t/server-side-data-model-for-scripts/25781)
15. API access to Intervals.icu \- Page 16 \- Guide, accessed December 29, 2025, [https://forum.intervals.icu/t/api-access-to-intervals-icu/609?page=16](https://forum.intervals.icu/t/api-access-to-intervals-icu/609?page=16)
16. API access to Intervals.icu \- Page 10 \- Guide, accessed December 29, 2025, [https://forum.intervals.icu/t/api-access-to-intervals-icu/609?page=10](https://forum.intervals.icu/t/api-access-to-intervals-icu/609?page=10)
17. intervals-icu/js-data-model \- NPM, accessed December 29, 2025, [https://www.npmjs.com/package/@intervals-icu/js-data-model?activeTab=code](https://www.npmjs.com/package/@intervals-icu/js-data-model?activeTab=code)
18. Choosing the Right HTTP Client in JavaScript \- node-fetch, Axios ..., accessed December 29, 2025, [https://leapcell.io/blog/choosing-the-right-http-client-in-javascript-node-fetch-axios-and-ky](https://leapcell.io/blog/choosing-the-right-http-client-in-javascript-node-fetch-axios-and-ky)
19. Why Ky is the Best Alternative to Axios and Fetch for Modern HTTP ..., accessed December 29, 2025, [https://dev.to/usluer/why-ky-is-the-best-alternative-to-axios-and-fetch-for-modern-http-requests-27c3](https://dev.to/usluer/why-ky-is-the-best-alternative-to-axios-and-fetch-for-modern-http-requests-27c3)
20. Performance improvement · Issue \#73 · open-circle/valibot \- GitHub, accessed December 29, 2025, [https://github.com/fabian-hiller/valibot/issues/73](https://github.com/fabian-hiller/valibot/issues/73)
21. Validating structural data with Valibot \- LogRocket Blog, accessed December 29, 2025, [https://blog.logrocket.com/validating-structural-data-valibot/](https://blog.logrocket.com/validating-structural-data-valibot/)
22. This technique makes Valibot's bundle size 10x smaller than Zod's\!, accessed December 29, 2025, [https://www.builder.io/blog/valibot-bundle-size](https://www.builder.io/blog/valibot-bundle-size)
23. Comparison \- Valibot, accessed December 29, 2025, [https://valibot.dev/guides/comparison/](https://valibot.dev/guides/comparison/)
24. Migrating from Zod to Valibot: A Comparative Experience, accessed December 29, 2025, [https://www.mwskwong.com/blog/migrating-from-zod-to-valibot-a-comparative-experience](https://www.mwskwong.com/blog/migrating-from-zod-to-valibot-a-comparative-experience)
25. Functional Error Handling in TypeScript with the Result Pattern, accessed December 29, 2025, [https://arg-software.medium.com/functional-error-handling-in-typescript-with-the-result-pattern-5b96a5abb6d3](https://arg-software.medium.com/functional-error-handling-in-typescript-with-the-result-pattern-5b96a5abb6d3)
26. TypeScript Error Handling \- The Candid Startup, accessed December 29, 2025, [https://www.thecandidstartup.org/2025/04/14/typescript-error-handling.html](https://www.thecandidstartup.org/2025/04/14/typescript-error-handling.html)
27. brunosps/usecase_ts: A robust implementation of the Result pattern ..., accessed December 29, 2025, [https://github.com/brunosps/usecase.ts](https://github.com/brunosps/usecase.ts)
28. Building an npm package compatible with ESM and CJS in 2024, accessed December 29, 2025, [https://snyk.io/blog/building-npm-package-compatible-with-esm-and-cjs-2024/](https://snyk.io/blog/building-npm-package-compatible-with-esm-and-cjs-2024/)
29. Dual Publishing ESM and CJS Modules with tsup and Are the Types ..., accessed December 29, 2025, [https://johnnyreilly.com/dual-publishing-esm-cjs-modules-with-tsup-and-are-the-types-wrong](https://johnnyreilly.com/dual-publishing-esm-cjs-modules-with-tsup-and-are-the-types-wrong)
30. Introducing Changesets: Simplify Project Versioning with Semantic ..., accessed December 29, 2025, [https://lirantal.com/blog/introducing-changesets-simplify-project-versioning-with-semantic-releases](https://lirantal.com/blog/introducing-changesets-simplify-project-versioning-with-semantic-releases)
31. changesets/changesets: A way to manage your versioning ... \- GitHub, accessed December 29, 2025, [https://github.com/changesets/changesets](https://github.com/changesets/changesets)
32. Changesets vs Semantic Release \- Brian Schiller, accessed December 29, 2025, [https://brianschiller.com/blog/2023/09/18/changesets-vs-semantic-release/](https://brianschiller.com/blog/2023/09/18/changesets-vs-semantic-release/)
33. The Ultimate Guide to NPM Release Automation \- Oleksii Popov, accessed December 29, 2025, [https://oleksiipopov.com/blog/npm-release-automation/](https://oleksiipopov.com/blog/npm-release-automation/)
34. An advanced guide to Vitest testing and mocking \- LogRocket Blog, accessed December 29, 2025, [https://blog.logrocket.com/advanced-guide-vitest-testing-mocking/](https://blog.logrocket.com/advanced-guide-vitest-testing-mocking/)
35. Using Mock Service Worker With Vitest For API Testing \- Steve Kinney, accessed December 29, 2025, [https://stevekinney.com/courses/testing/testing-with-mock-service-worker](https://stevekinney.com/courses/testing/testing-with-mock-service-worker)
36. Mocking Requests \- Vitest, accessed December 29, 2025, [https://vitest.dev/guide/mocking/requests](https://vitest.dev/guide/mocking/requests)
37. \[Discussion\] Default Modern Theme \+ complete / linkable built-in TS ..., accessed December 29, 2025, [https://github.com/TypeStrong/typedoc/discussions/2849](https://github.com/TypeStrong/typedoc/discussions/2849)
38. TypeDoc, accessed December 29, 2025, [https://typedoc.org/](https://typedoc.org/)
39. TypeScript in 2025 with ESM and CJS npm publishing is still a mess, accessed December 29, 2025, [https://lirantal.com/blog/typescript-in-2025-with-esm-and-cjs-npm-publishing](https://lirantal.com/blog/typescript-in-2025-with-esm-and-cjs-npm-publishing)
40. Using tsup to bundle your TypeScript package \- LogRocket Blog, accessed December 29, 2025, [https://blog.logrocket.com/tsup/](https://blog.logrocket.com/tsup/)
