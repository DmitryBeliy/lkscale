// Type declarations for MCP SDK (no @types package available)
declare module "@modelcontextprotocol/sdk/server/mcp.js" {
  export class McpServer {
    constructor(config: { name: string; version: string });
    registerTool<T = unknown>(
      name: string,
      config: {
        title: string;
        description: string;
        inputSchema: import("zod").ZodType;
        annotations?: {
          readOnlyHint?: boolean;
          destructiveHint?: boolean;
          idempotentHint?: boolean;
          openWorldHint?: boolean;
        };
      },
      handler: (params: T) => Promise<{
        content: Array<{ type: string; text: string }>;
        isError?: boolean;
      }>
    ): void;
    connect(transport: unknown): Promise<void>;
  }
}

declare module "@modelcontextprotocol/sdk/server/stdio.js" {
  export class StdioServerTransport {
    constructor();
  }
}
