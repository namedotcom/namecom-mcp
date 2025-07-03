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
  format?: string;
  description?: string;
  items?: OpenApiSchema;
  properties?: Record<string, OpenApiSchema>;
  required?: string[];
  additionalProperties?: boolean | OpenApiSchema;
  $ref?: string;
  enum?: string[];
  pattern?: string;
  example?: any;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  allOf?: OpenApiSchema[];
  oneOf?: OpenApiSchema[];
  anyOf?: OpenApiSchema[];
  nullable?: boolean;
  title?: string;
  default?: any;
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