/**
 * Shared types for the JustiFi SDK
 * 
 * This file contains base interfaces that can be composed into specific API operation types.
 * Using composition instead of inheritance provides better flexibility and prevents breaking
 * changes when the API evolves.
 */

/**
 * Standard pagination options used across list operations
 */
export interface PaginationOptions {
  /** Maximum number of items to return */
  limit?: number;
  /** Cursor for retrieving items after this point */
  after_cursor?: string;
  /** Cursor for retrieving items before this point */
  before_cursor?: string;
}

/**
 * Sub-account scoping options used across operations that support sub-account scoping
 */
export interface SubAccountOptions {
  /** Optional sub-account ID to scope the operation to */
  subAccountId?: string;
}

/**
 * Base options that most operations support
 */
export interface BaseOperationOptions {
  subAccount?: SubAccountOptions;
}

/**
 * Base options for list operations
 */
export interface BaseListOptions extends BaseOperationOptions {
  pagination?: PaginationOptions;
}

/**
 * Supported currencies
 */
export enum Currency {
  USD = "usd",
  CAD = "cad"
}