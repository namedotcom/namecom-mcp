export interface NameApiResponse {
  [key: string]: any;
}

export interface FetchOptions {
  method: string;
  headers: {
    'Authorization': string;
    'Content-Type': string;
    'User-Agent'?: string;
  };
  body?: string;
}

export interface OpenApiSchema {
  type?: string | string[];
  enum?: string[];
  properties?: Record<string, OpenApiSchema>;
  required?: string[];
  items?: OpenApiSchema;
  additionalProperties?: OpenApiSchema | boolean;
  $ref?: string;
  title?: string;
  description?: string;
  format?: string;
  example?: any;
  nullable?: boolean; // OpenAPI 3.0 style
  allOf?: OpenApiSchema[];
  oneOf?: OpenApiSchema[];
  anyOf?: OpenApiSchema[];
}

export interface OpenApiParameter {
  name: string;
  in?: string;
  description?: string;
  required?: boolean;
  schema?: OpenApiSchema;
}

export interface OpenApiRequestBody {
  required?: boolean;
  content?: {
    'application/json'?: {
      schema?: OpenApiSchema;
    };
  };
}

export interface OpenApiOperation {
  operationId?: string;
  summary?: string;
  description?: string;
  parameters?: OpenApiParameter[];
  requestBody?: OpenApiRequestBody;
  tags?: string[];
  deprecated?: boolean;
}

export interface OpenApiPathItem {
  get?: OpenApiOperation;
  post?: OpenApiOperation;
  put?: OpenApiOperation;
  delete?: OpenApiOperation;
  [key: string]: OpenApiOperation | undefined;
}

export interface OpenApiSpec {
  paths: Record<string, OpenApiPathItem>;
  components?: { 
    schemas?: Record<string, OpenApiSchema> 
  };
} 