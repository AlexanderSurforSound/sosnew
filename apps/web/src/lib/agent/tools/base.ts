/**
 * Base Tool Interface
 *
 * All agent tools must implement this interface. Tools are self-contained
 * modules that define their own schema, validation, and execution logic.
 *
 * @module agent/tools/base
 *
 * @example
 * ```typescript
 * class MyTool extends BaseTool<MyInput, MyOutput> {
 *   readonly name = 'my_tool';
 *   readonly definition = { ... };
 *
 *   async execute(input: MyInput): Promise<ToolResult<MyOutput>> {
 *     // Implementation
 *   }
 * }
 * ```
 */

import type { ToolDefinition, ToolResult } from '../types';

/**
 * Abstract base class for all tools
 *
 * @template TInput - The input type for this tool
 * @template TOutput - The output type for successful execution
 */
export abstract class BaseTool<TInput = unknown, TOutput = unknown> {
  /**
   * Unique identifier for this tool
   * Used in tool calls and logging
   */
  abstract readonly name: string;

  /**
   * Human-readable description for documentation
   */
  abstract readonly description: string;

  /**
   * Claude tool definition
   * Includes name, description, and JSON schema for inputs
   */
  abstract readonly definition: ToolDefinition;

  /**
   * Execute the tool with the given input
   *
   * @param input - Validated input matching the tool's schema
   * @returns Promise resolving to success/failure result
   */
  abstract execute(input: TInput): Promise<ToolResult<TOutput>>;

  /**
   * Optional input validation
   * Override to add custom validation beyond JSON schema
   *
   * @param input - Raw input to validate
   * @returns Validation result
   */
  validate(input: unknown): { valid: boolean; error?: string } {
    // Default: trust JSON schema validation
    return { valid: true };
  }

  /**
   * Optional hook called before execution
   * Useful for logging, metrics, etc.
   */
  beforeExecute?(input: TInput): void | Promise<void>;

  /**
   * Optional hook called after execution
   * Useful for logging, cleanup, etc.
   */
  afterExecute?(input: TInput, result: ToolResult<TOutput>): void | Promise<void>;

  /**
   * Helper to create a success result
   */
  protected success(data: TOutput, message?: string): ToolResult<TOutput> {
    return {
      success: true,
      data,
      message,
    };
  }

  /**
   * Helper to create an error result
   */
  protected error(message: string): ToolResult<TOutput> {
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Tool registry for managing available tools
 */
export class ToolRegistry {
  private tools = new Map<string, BaseTool>();

  /**
   * Register a tool
   */
  register(tool: BaseTool): void {
    if (this.tools.has(tool.name)) {
      console.warn(`Tool "${tool.name}" is already registered. Overwriting.`);
    }
    this.tools.set(tool.name, tool);
  }

  /**
   * Unregister a tool
   */
  unregister(name: string): boolean {
    return this.tools.delete(name);
  }

  /**
   * Get a tool by name
   */
  get(name: string): BaseTool | undefined {
    return this.tools.get(name);
  }

  /**
   * Check if a tool is registered
   */
  has(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Get all registered tools
   */
  getAll(): BaseTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get all tool definitions for Claude
   */
  getDefinitions(): ToolDefinition[] {
    return this.getAll().map(tool => tool.definition);
  }

  /**
   * Get tool names
   */
  getNames(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Execute a tool by name
   */
  async execute(name: string, input: unknown): Promise<ToolResult> {
    const tool = this.get(name);

    if (!tool) {
      return { success: false, error: `Unknown tool: ${name}` };
    }

    // Validate input
    const validation = tool.validate(input);
    if (!validation.valid) {
      return { success: false, error: validation.error || 'Invalid input' };
    }

    try {
      // Before hook
      await tool.beforeExecute?.(input);

      // Execute
      const result = await tool.execute(input);

      // After hook
      await tool.afterExecute?.(input, result);

      return result;
    } catch (error) {
      console.error(`Tool "${name}" execution error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Tool execution failed',
      };
    }
  }
}

/**
 * Global tool registry instance
 */
export const toolRegistry = new ToolRegistry();
