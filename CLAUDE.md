# JustiFi Node.js SDK - Development Guide

## API Drift Checker

The SDK includes an automated API drift checker that monitors differences between the OpenAPI specification and SDK implementation.

### Running the Drift Checker

```bash
node scripts/check-api-drift.js
```

This will:
- Fetch the latest OpenAPI specification from JustiFi
- Extract SDK endpoints from `@endpoint` JSDoc comments
- Compare and generate a drift report (`drift-report.md`)

### Understanding Drift Results

- **New Endpoints in API**: API endpoints missing from SDK
- **SDK Endpoints Not in API**: SDK methods that don't match API endpoints  
- **Parameter Mismatches**: Differences in function parameters vs API parameters
- **Enum Mismatches**: Enum value differences between API and SDK

## Function Patterns and Annotations

The SDK uses two main function patterns:

### 1. Entity Functions (with drift detection)

Use this pattern for new entity endpoints that need API drift monitoring:

```typescript
/**
 * Creates a new checkout.
 * 
 * @endpoint POST /checkouts
 * @param token - Access token for authentication
 * @param payload - Checkout creation data
 * @param subAccountId - Optional sub-account to scope the checkout to
 * @returns Promise resolving to the created checkout
 */
export async function createEntityCheckout(
  token: string,
  payload: CreateCheckoutPayload,
  subAccountId?: string
): Promise<ApiResponse<Checkout>> {
  // implementation
}
```

**Key requirements:**
- Use `export async function` (not `export function`)
- Include detailed JSDoc with description
- Add `@endpoint METHOD /path` annotation
- Include `@param` and `@returns` documentation
- Path should NOT include `/v1` prefix in @endpoint

### 2. Core Functions (without drift detection)

Use this pattern for core payment/business logic functions:

```typescript
export const createPayment = (
  token: string,
  payload: CreatePaymentPayload
): Promise<ApiResponse<Payment>> => {
  // implementation  
};
```

**Characteristics:**
- Use `export const` with arrow functions
- Return `Promise<T>` directly (no `async`)
- No `@endpoint` annotations needed
- Consistent with existing payment functions

### Adding @endpoint Annotations

When adding `@endpoint` annotations to existing functions:

1. **Use the correct HTTP method and path from the OpenAPI spec**
2. **Omit the `/v1` prefix** (drift checker normalizes this)
3. **Add comprehensive JSDoc comments** (description + @param + @returns)
4. **Convert to `function` declarations** if using const arrow functions

**Example conversion:**

```typescript
// Before (not detected by drift checker)
export const getCheckout = (token: string, id: string): Promise<ApiResponse<Checkout>> => {
  return new JustifiRequest(RequestMethod.Get, `/v1/checkouts/${id}`)
    .withAuth(token)
    .execute<ApiResponse<Checkout>>();
};

// After (detected by drift checker)  
/**
 * Retrieves a checkout by its ID.
 * 
 * @endpoint GET /checkouts/{id}
 * @param token - Access token for authentication
 * @param id - The checkout ID to retrieve
 * @returns Promise resolving to the checkout details
 */
export function getCheckout(
  token: string,
  id: string
): Promise<ApiResponse<Checkout>> {
  return new JustifiRequest(RequestMethod.Get, `/v1/checkouts/${id}`)
    .withAuth(token)
    .execute<ApiResponse<Checkout>>();
}
```

## Type Definitions

When adding new endpoints, include proper TypeScript interfaces:

```typescript
export interface CreateCheckoutPayload {
  amount: number;
  currency?: string;
  description?: string;
  // ... other fields
}

export interface Checkout {
  id: string;
  accountId: string;
  // ... other fields
}
```

## Testing

Add comprehensive tests for new endpoints:

```typescript
describe("checkout operations", () => {
  it("creates checkout with payload", async () => {
    serverMock
      .post("/v1/checkouts", toSnakeCase(payload))
      .reply(201, withApiResponse(mockCheckout));

    const result = await client.createCheckout(payload);
    expect(result.data).toEqual(mockCheckout);
  });
});
```

## Best Practices

1. **Follow existing patterns** - Use entity pattern for new endpoints, core pattern for business logic
2. **Add drift detection** - Use `@endpoint` annotations for API endpoints
3. **Maintain backward compatibility** - Don't change existing function signatures
4. **Test thoroughly** - Add tests for success/error cases
5. **Document parameters** - Use JSDoc for all public functions
6. **Run drift checker** - Verify new endpoints are properly detected

## Common Issues

- **Comments not detected**: Ensure JSDoc has description + @endpoint + @param + @returns
- **Wrong endpoint path**: Use the exact path from OpenAPI spec (without /v1)
- **Function not detected**: Use `export function` or `export async function`, not `const` arrow functions
- **Breaking changes**: Avoid changing existing function signatures