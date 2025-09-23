# JustiFi Node.js SDK - Development Guide

## Current Architecture (v1) - Transitioning to v2

**IMPORTANT**: We are transitioning from the current dual-layer architecture to a clean client-only approach in v2. This guide documents both approaches and the reasoning behind the transition.

## OpenAPI Specification Reference

**CRITICAL**: Always refer to the OpenAPI specification to understand what the API expects. This is the single source of truth for:
- Required vs optional parameters
- Parameter names and types  
- Request/response structures
- HTTP methods and paths
- Headers and authentication requirements

### Getting the OpenAPI Spec

The OpenAPI specification should be available locally as `openapi-spec.yaml`. If it's not present, download it:

```bash
curl -o openapi-spec.yaml https://docs.justifi.tech/redocusaurus/plugin-redoc-0.yaml
```

**Before implementing any endpoint:**
1. Check the OpenAPI spec for the exact parameter requirements
2. Verify parameter names (snake_case vs camelCase)
3. Confirm required vs optional status
4. Check for any special headers or authentication needs

**Never guess** - always verify against the spec to avoid parameter mismatches and ensure API compliance.

## Architecture Patterns

### Current v1 Pattern (Dual-Layer Architecture)

The current SDK uses a dual-layer approach with some inconsistencies:

**Layer 1: Exported Functions (Low-Level API)**
```typescript
// Takes accessToken as first parameter
export function createCheckout(
  authorizationToken: string,
  params: CreateCheckoutParams
): Promise<ApiResponse<Checkout>> {
  const { subAccountId, ...payload } = params;
  return new JustifiRequest(RequestMethod.Post, "/v1/checkouts")
    .withAuth(authorizationToken)
    .withBody(payload)
    .withHeader("Sub-Account", subAccountId)
    .execute<ApiResponse<Checkout>>();
}
```

**Layer 2: Client Methods (High-Level Wrapper)**
```typescript
// Client handles token internally
class Justifi {
  async createCheckout(params: CreateCheckoutParams): Promise<ApiResponse<Checkout>> {
    const token = await this.getToken(); // Client manages token
    return createCheckout(token.accessToken, params); // Calls exported function
  }
}
```

**Usage Pattern (Current v1)**
```typescript
// Users primarily use the client
const client = Justifi.client().withCredentials({ clientId, clientSecret });
await client.createCheckout(params); // No token management needed

// Advanced users can use exported functions directly
const token = await getAccessToken(credentials);
await createCheckout(token, params); // Manual token management
```

### Target v2 Pattern (Client-Only Architecture)

The v2 SDK will eliminate the dual-layer complexity:

**Single Client Class with Resource Organization**
```typescript
// Clean resource-based organization
class JustiFiClient {
  public readonly checkout: CheckoutResource;
  public readonly payments: PaymentResource;
  public readonly paymentMethods: PaymentMethodResource;
  
  constructor(credentials: ClientCredentials) {
    this.checkout = new CheckoutResource(this);
    this.payments = new PaymentResource(this);
    this.paymentMethods = new PaymentMethodResource(this);
  }
  
  private async getToken(): Promise<string> {
    // Internal token management
  }
}

class CheckoutResource {
  constructor(private client: JustiFiClient) {}
  
  async create(params: CreateCheckoutParams): Promise<Checkout> {
    const token = await this.client.getToken(); // Access client's token method
    // Direct API implementation - no exported function layer
    return new JustifiRequest(RequestMethod.Post, "/v1/checkouts")
      .withAuth(token)
      .withBody(params)
      .execute<Checkout>();
  }
}
```

**Usage Pattern (Target v2)**
```typescript
// Clean, discoverable API
const justiFi = require("justifi-node");
const gateway = new justiFi.Client({ 
  clientId: "your_client_id", 
  clientSecret: "your_client_secret" 
});

// Resource-based organization
await gateway.checkout.create(params);
await gateway.checkout.get(id);
await gateway.payments.capture(id);
await gateway.paymentMethods.list();
```

## Why We Removed API Interfaces

Previously, we had interfaces like `CheckoutApi` that attempted to define method signatures. This created fundamental type conflicts:

```typescript
// ❌ REMOVED - Created unsolvable type conflicts
export interface CheckoutApi {
  // Interface expected client method signature (no token)
  createCheckout(params: CreateCheckoutParams): Promise<ApiResponse<Checkout>>;
}

// But exported function has different signature (with token)
export function createCheckout(
  authorizationToken: string, // ← This parameter doesn't exist in interface
  params: CreateCheckoutParams
): Promise<ApiResponse<Checkout>>

// Client tried to implement both patterns - impossible!
class Justifi implements CheckoutApi {
  async createCheckout(params: CreateCheckoutParams) { ... } // Interface signature
  // But calls: createCheckout(token, params) // Function signature
}
```

**Solution**: Remove API interfaces entirely. Let client methods implement directly without interface constraints.

## Current Implementation Guidelines

### For v1 Maintenance (Current Approach)

**1. Exported Functions Pattern**
```typescript
/**
 * Creates a new checkout.
 * 
 * @endpoint POST /v1/checkouts
 * @param authorizationToken - Access token for authentication
 * @param params - Checkout creation parameters including subAccountId
 * @returns Promise resolving to the created checkout
 */
export function createCheckout(
  authorizationToken: string,
  params: CreateCheckoutParams
): Promise<ApiResponse<Checkout>> {
  // Implementation with token parameter
}
```

**2. Client Methods Pattern**
```typescript
// No interface constraints - implement directly
class Justifi {
  async createCheckout(params: CreateCheckoutParams): Promise<ApiResponse<Checkout>> {
    const token = await this.getToken(); // Get token internally
    return createCheckout(token.accessToken, params); // Call exported function
  }
}
```

**3. Parameter Structure**
```typescript
// Exported functions: token first, then resource IDs, then params
export function updateCheckout(
  authorizationToken: string,   // Token always first
  id: string,                   // Resource ID second  
  idempotencyKey: string,       // Required operation parameters
  params: UpdateCheckoutParams  // Everything else in params object
): Promise<ApiResponse<Checkout>>

// Client methods: no token, clean signatures
async updateCheckout(
  id: string, 
  idempotencyKey: string, 
  params: UpdateCheckoutParams
): Promise<ApiResponse<Checkout>>
```

### For v2 Development (Target Approach)

**1. Resource-Based Organization**
- Group related operations into resource classes
- Single responsibility per resource
- Clean method names (create, get, update, delete, list)

**2. No Exported Functions**
- All logic in resource classes
- Direct API implementation in methods
- No dual-layer complexity

**3. Automatic Token Management**
- Token handling completely internal
- Users never see or manage tokens
- Automatic refresh and caching

## API Drift Checker

The SDK includes an automated API drift checker that monitors differences between the OpenAPI specification and SDK implementation.

### Running the Drift Checker

```bash
node scripts/check-api-drift.js
```

### How the Drift Checker Works

1. **Extracts SDK endpoints** from implementation files using `@endpoint` JSDoc comments
2. **Compares against OpenAPI spec** for parameter and method mismatches
3. **Checks client exposure** - verifies implementation functions are accessible via client

### Understanding Drift Results

- **New Endpoints in API**: API endpoints missing from SDK implementation
- **SDK Endpoints Not in API**: Implementation methods that don't match API endpoints  
- **Parameter Mismatches**: Differences in function parameters vs API parameters
- **Endpoints Not Exposed in Client**: Implementation functions not accessible through client

## Type Definitions

Always include proper TypeScript interfaces for new endpoints:

```typescript
export interface CreateCheckoutParams {
  // Required context
  subAccountId: string;
  
  // Required API parameters  
  amount: number;
  description: string;
  
  // Optional API parameters
  origin_url?: string;
  payment_method_group_id?: string;
  statement_descriptor?: string;
  application_fees?: CheckoutApplicationFees;
  payment?: CheckoutPayment;
}

export interface Checkout {
  id: string;
  account_id: string;
  platform_account_id: string;
  payment_amount: number;
  payment_currency: string;
  payment_description: string;
  status: CheckoutStatus;
  created_at: string;
  updated_at: string;
}
```

## Testing

Add comprehensive tests for new endpoints:

```typescript
describe("checkout operations", () => {
  it("creates checkout with required parameters", async () => {
    const payload: CreateCheckoutParams = {
      subAccountId: "sub_123",
      amount: 1000,
      description: "Test checkout"
    };
    
    serverMock
      .post("/v1/checkouts")
      .reply(201, withApiResponse(mockCheckout));

    const result = await client.createCheckout(payload);
    expect(result.data).toEqual(mockCheckout);
  });
});
```

## Migration Path to v2

1. **Phase 1**: Clean up v1 inconsistencies (current phase)
   - Remove conflicting API interfaces
   - Fix parameter mismatches
   - Maintain backward compatibility

2. **Phase 2**: Design v2 resource architecture
   - Plan resource organization
   - Design clean client interface
   - Create migration guides

3. **Phase 3**: Implement v2
   - Build resource-based client
   - Remove exported functions
   - Simplify token management

## Best Practices

1. **Always check OpenAPI spec** before implementing any endpoint
2. **No API interfaces** - they create type conflicts in dual-layer architecture
3. **Client methods handle tokens internally** - users never manage tokens
4. **Exported functions take tokens as first parameter** - for direct usage
5. **Use `@endpoint` annotations** for drift detection
6. **Test thoroughly** with proper mocking
7. **Plan for v2 transition** - avoid patterns that complicate migration

## Common Issues

- **Parameter mismatches**: Always verify against OpenAPI spec
- **Type conflicts**: Don't create interfaces that span both architectural layers  
- **Missing idempotency keys**: Check API requirements carefully
- **Token management confusion**: Keep client and exported function patterns separate
- **Breaking changes**: Maintain backward compatibility in v1 maintenance