// Auto-generated from assets/namecom.api.yaml - DO NOT EDIT DIRECTLY
// Update assets/namecom.api.yaml and run 'npm run build' to regenerate
export const EMBEDDED_SPEC = {
    "openapi": "3.1.0",
    "info": {
        "contact": {
            "email": "accountservices@name.com",
            "name": "Account Services"
        },
        "description": "RESTful API for managing domains, DNS records, and related services at name.com.  Access via HTTPS at api.name.com (production) or api.dev.name.com (testing).  Supports standard authentication, rate-limited to 20 requests/second. ",
        "title": "name.com Core API",
        "version": "1.2.1",
        "termsOfService": "https://www.name.com/policies/api-access-agreement"
    },
    "servers": [
        {
            "description": "Testing",
            "url": "https://api.dev.name.com"
        }
    ],
    "security": [
        {
            "BasicAuth": []
        }
    ],
    "tags": [
        {
            "name": "Hello",
            "description": "Use the Hello endpoint to verify that your API connection and credentials are working properly. This simple call returns a success message (along with server time and version info) to confirm the API is reachable and authenticated."
        },
        {
            "name": "Account Info",
            "description": "Use Account Info endpoints to retrieve basic information about your name.com account. For example, you can check your account’s current credit balance and other account details using these endpoints."
        },
        {
            "name": "Accounts",
            "description": "Use Accounts endpoints (available upon request) to manage sub-accounts under your main account. For example, resellers can programmatically create new customer accounts with their own login credentials and permissions."
        },
        {
            "name": "Domains",
            "description": "Use Domains endpoints to search for domain availability, register new domains, and manage existing domains."
        },
        {
            "name": "DNS",
            "description": "Use DNS endpoints to manage DNS records for your domains. You can list all existing DNS records for a domain and create, update, or delete records as needed."
        },
        {
            "name": "DNSSECs",
            "description": "Use DNSSEC endpoints to configure DNS Security Extensions for your domains. These endpoints allow you to add, retrieve, or remove DNSSEC records."
        },
        {
            "name": "Email Forwardings",
            "description": "Use Email Forwardings endpoints to set up and manage email forwarding addresses on your domains."
        },
        {
            "name": "URL Forwardings",
            "description": "Use URL Forwardings endpoints to control URL redirection settings for your domains."
        },
        {
            "name": "Vanity Nameservers",
            "description": "Use Vanity Nameservers endpoints to configure custom nameserver hostnames (glue records) for your domains."
        },
        {
            "name": "Transfers",
            "description": "Use Transfers endpoints to move domains into your name.com account. Start by creating a transfer request, then monitor and manage the status of pending transfers. You can also cancel a transfer if needed."
        },
        {
            "name": "Orders",
            "description": "Use Orders endpoints to review and track purchases made via the API."
        },
        {
            "name": "Webhook Notifications",
            "description": "Use Webhook Notification endpoints to subscribe to real-time notifications for account and domain events. This keeps your application updated on important changes without polling the API."
        },
        {
            "name": "Domain Info",
            "description": "Use Domain Info endpoints to retrieve information about TLD-specific requirements and registration rules. These endpoints help you understand what fields, documents, or constraints are needed to successfully register domains across different TLDs."
        },
        {
            "name": "TLD Pricing",
            "description": "Use TLD Pricing endpoints to retrieve general pricing information for your account."
        }
    ],
    "paths": {
        "/core/v1/accountinfo/balance": {
            "get": {
                "description": "Returns the current account credit balance for the authenticated user.",
                "operationId": "CheckAccountBalance",
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/CheckAccountBalanceResponse"
                                }
                            }
                        },
                        "description": "A successful response."
                    },
                    "401": {
                        "description": "You are attempting to make an API request with invalid credentials.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Unauthorized401"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error occurred.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "Check Account Balance",
                "tags": [
                    "Account Info"
                ]
            }
        },
        "/core/v1/accounts": {
            "post": {
                "description": "Creates a new sub-account under your authenticated reseller account and returns API credentials for the new account.  This endpoint is only available to approved reseller accounts. Contact name.com support to request access.",
                "operationId": "CreateAccount",
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/CreateAccountRequest"
                            }
                        }
                    },
                    "description": "CreateAccountRequest has the information that is needed to create an account with the CreateAccount function.",
                    "required": true
                },
                "responses": {
                    "200": {
                        "description": "A successful response containing the newly created account details and credentials.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/CreateAccountResponse"
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Bad request - Invalid query or request body parameters. Account creation requeires both TOS and APITOS values to be true.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/InvalidArgument400"
                                }
                            }
                        }
                    },
                    "401": {
                        "description": "Unauthorized.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Unauthorized401"
                                }
                            }
                        }
                    },
                    "403": {
                        "description": "Only authorized accounts have access to this endpoint. To request access, please contact our support team.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericForbidden403"
                                }
                            }
                        }
                    },
                    "415": {
                        "description": "All POST, PUT, PATCH requests for this API must include the `Content-Type: application/json` header in the requests.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/UnsupportedMedia415"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    }
                },
                "summary": "Create Account",
                "tags": [
                    "Accounts"
                ]
            }
        },
        "/core/v1/domains": {
            "get": {
                "description": "Lists all domains in your account (basic details for each domain).",
                "operationId": "ListDomains",
                "parameters": [
                    {
                        "description": "Per Page is the number of records to return per request. Per Page defaults to 1,000.",
                        "in": "query",
                        "name": "perPage",
                        "schema": {
                            "format": "int32",
                            "type": "integer",
                            "default": 1000
                        }
                    },
                    {
                        "description": "Page is which page to return.",
                        "in": "query",
                        "name": "page",
                        "schema": {
                            "format": "int32",
                            "type": "integer"
                        }
                    },
                    {
                        "description": "Sort specifies which domain property to order by.",
                        "in": "query",
                        "name": "sort",
                        "schema": {
                            "type": "string"
                        }
                    },
                    {
                        "description": "Dir indicates direction of sort. Possible values are 'asc' (default) or 'desc'.",
                        "in": "query",
                        "name": "dir",
                        "schema": {
                            "type": "string"
                        }
                    },
                    {
                        "description": "DomainName filters domains by exact domain name or wildcard (starts with '*').",
                        "in": "query",
                        "name": "domainName",
                        "schema": {
                            "type": "string"
                        }
                    },
                    {
                        "description": "Tld filters on specific tld.",
                        "in": "query",
                        "name": "tld",
                        "schema": {
                            "type": "string"
                        }
                    },
                    {
                        "description": "Locked filters on locked domains.",
                        "in": "query",
                        "name": "locked",
                        "schema": {
                            "type": "boolean"
                        }
                    },
                    {
                        "description": "CreateDate filters domains created on this date.",
                        "in": "query",
                        "name": "createDate",
                        "schema": {
                            "type": "string"
                        }
                    },
                    {
                        "description": "CreateDateStart filters domains created on or after this date.",
                        "in": "query",
                        "name": "createDateStart",
                        "schema": {
                            "type": "string"
                        }
                    },
                    {
                        "description": "CreateDateEnd filters domains created on or before this date.",
                        "in": "query",
                        "name": "createDateEnd",
                        "schema": {
                            "type": "string"
                        }
                    },
                    {
                        "description": "ExpireDate filters domains expiring on this date.",
                        "in": "query",
                        "name": "expireDate",
                        "schema": {
                            "type": "string"
                        }
                    },
                    {
                        "description": "ExpireDateStart filters domains with expire date on or after this date.",
                        "in": "query",
                        "name": "expireDateStart",
                        "schema": {
                            "type": "string"
                        }
                    },
                    {
                        "description": "ExpireDateEnd filters domains with expire date on or before this date.",
                        "in": "query",
                        "name": "expireDateEnd",
                        "schema": {
                            "type": "string"
                        }
                    },
                    {
                        "description": "PrivacyEnabled indicates whether there is a privacy product associated with the domain.",
                        "in": "query",
                        "name": "privacyEnabled",
                        "schema": {
                            "type": "boolean"
                        }
                    },
                    {
                        "description": "IsPremium indicates whether the domain is a premium domain.",
                        "in": "query",
                        "name": "isPremium",
                        "schema": {
                            "type": "boolean"
                        }
                    },
                    {
                        "description": "AutorenewEnabled indicates if the domain will attempt to renew automatically before expiration.",
                        "in": "query",
                        "name": "autorenewEnabled",
                        "schema": {
                            "type": "boolean"
                        }
                    },
                    {
                        "description": "OrderId specifies the order number of a domain purchase.",
                        "in": "query",
                        "name": "orderId",
                        "schema": {
                            "format": "int32",
                            "type": "integer"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/ListDomainsResponse"
                                }
                            }
                        },
                        "description": "A successful response.",
                        "headers": {
                            "Link": {
                                "description": "String delimited list of links for pagination",
                                "schema": {
                                    "type": "string",
                                    "example": "<https://api.dev.name.com?page=3; rel=\"next\">,<https://api.dev.name.com?page=1; rel=\"prev\">,<https://api.dev.name.com?page=10; rel=\"last\">"
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Bad request - Invalid input data.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/InvalidArgument400"
                                }
                            }
                        }
                    },
                    "401": {
                        "description": "You are attempting to make an API request with invalid credentials.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Unauthorized401"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "An error has occurred on the server.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "List Domains",
                "tags": [
                    "Domains"
                ]
            },
            "post": {
                "description": "Registers a new domain under your account. You must provide the `domain.domainName` at a bare minimum to register. \nFor premium or special-priced domains, the purchase_price must also be included to confirm cost. \nThis endpoint is commonly used to programmatically onboard new domains through user signup flows or checkout experiences.\n\nIf no contacts are passed in this request, the default contacts for your name.com account will be used.\n\n### Best Practices For Domain Creates\n\nIn general, you should check that a domain is available prior to attempting to purchase a domain. \nYou can use either the [checkAvailability](#operation/CheckAvailability) endpoint, or the [Search](#operation/Search) endpoint\nto confirm that a domain is purchasable.\n\n#### Important Note on Dropcatching and Abuse Prevention\n\n_The createDomain endpoint is designed for standard domain registrations and is not intended for automated dropcatching (i.e., mass or high-frequency attempts to register domains the moment they become available after expiration). The use of drop-catching tools or services to acquire expired domains is strictly prohibited. All domain acquisitions must go through approved channels to ensure fair and transparent access._\n",
                "operationId": "CreateDomain",
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/CreateDomainRequest"
                            },
                            "examples": {
                                "noContacts": {
                                    "summary": "Creating a domain without contacts.",
                                    "description": "For a basic domain create, you do not need to send contacts in the request. **When contacts are not sent in the request, we will apply the default contacts for your account to the domain.**",
                                    "value": {
                                        "domain": {
                                            "domainName": "example.com"
                                        }
                                    }
                                },
                                "multipleYears": {
                                    "summary": "Creating a domain for multiple years.",
                                    "description": "To purchase a domain for more than the default minimum for a TLD, just add \"years\" to the request.",
                                    "value": {
                                        "domain": {
                                            "domainName": "example.com"
                                        },
                                        "years": 2
                                    }
                                },
                                "premiumPurchase": {
                                    "summary": "Creating a premium domain",
                                    "description": "To create a premium domain, the `purchasePrice` and `purchaseType` parameters are required",
                                    "value": {
                                        "domain": {
                                            "domainName": "premiumexample.com"
                                        },
                                        "purchasePrice": 349.95,
                                        "purchaseType": "expiring"
                                    }
                                },
                                "premiumPurchaseMultiYear": {
                                    "summary": "Creating a premium domain for multiple years",
                                    "description": "To create a premium domain for multiple years, the `purchasePrice`, `purchaseType` and `years` parameters are required. You will need to get the single year pricing, and then multiply the single year pricing by the number of years you wish to purchase the domain for. Example: 1 year pricing = 349.95. 2 year pricing = 699.90",
                                    "value": {
                                        "domain": {
                                            "domainName": "premiumexample.com"
                                        },
                                        "purchasePrice": 699.9,
                                        "purchaseType": "expiring",
                                        "years": 2
                                    }
                                },
                                "singleContactAtCreate": {
                                    "summary": "Send single, specific contact with domain create",
                                    "description": "Generally all contacts need to be submitted when creating a domain that will not use your account default contacts. By passing a single contact during a domain create, you can set a single contact to be different than the account default contacts. This may also be required for some TLDs due to ICANN changes in registration contact requirements",
                                    "value": {
                                        "domain": {
                                            "domainName": "example.com",
                                            "contacts": {
                                                "tech": {
                                                    "firstName": "Jonny",
                                                    "lastName": "IT Guy",
                                                    "companyName": "My Company",
                                                    "address1": "1234 Any Street",
                                                    "address2": null,
                                                    "city": "Anytown",
                                                    "state": "NY",
                                                    "zip": "11222",
                                                    "country": "US",
                                                    "email": "support@example.com",
                                                    "phone": "+15555555"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "description": "CreateDomainRequest has the information that is needed to create a domain with the CreateDomain function.",
                    "required": true
                },
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/CreateDomainResponse"
                                }
                            }
                        },
                        "description": "A successful response."
                    },
                    "400": {
                        "description": "Bad request - Invalid input data.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/InvalidArgument400"
                                }
                            }
                        }
                    },
                    "401": {
                        "description": "Failure creating domain.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Unauthorized401"
                                }
                            }
                        }
                    },
                    "402": {
                        "description": "Payment has failed for this transaction.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/PaymentRequired402"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Domain or requested resource not found.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        }
                    },
                    "415": {
                        "description": "All POST, PUT, PATCH requests for this API must include the `Content-Type: application/json` header in the requests.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/UnsupportedMedia415"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    },
                    "501": {
                        "description": "Not implemented.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError501"
                                }
                            }
                        }
                    }
                },
                "summary": "Create Domain",
                "tags": [
                    "Domains"
                ]
            }
        },
        "/core/v1/domains/{domainName}": {
            "get": {
                "description": "Retrieves detailed information for a specific domain in your account.",
                "operationId": "GetDomain",
                "parameters": [
                    {
                        "description": "DomainName is the domain to retrieve.",
                        "in": "path",
                        "name": "domainName",
                        "required": true,
                        "schema": {
                            "type": "string",
                            "example": "example.com"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/DomainResponsePayload"
                                }
                            }
                        },
                        "description": "A successful response."
                    },
                    "401": {
                        "description": "Unauthorized.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Unauthorized401"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "Get Domain",
                "tags": [
                    "Domains"
                ]
            },
            "patch": {
                "description": "Allows updating of the autorenew, WhoIs Privacy and lock status of the specified domain. The request requires one, or any combination of the parameters in order to pass validation. If any of the requested updates failed, the domain will be returned to it's original state.",
                "operationId": "UpdateDomain",
                "summary": "Update a domain",
                "tags": [
                    "Domains"
                ],
                "parameters": [
                    {
                        "description": "DomainName is the domain to update.",
                        "in": "path",
                        "name": "domainName",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    }
                ],
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "autorenewEnabled": {
                                        "type": "boolean",
                                        "description": "Enable or disable automatic renewal for the domain.",
                                        "example": true
                                    },
                                    "privacyEnabled": {
                                        "type": "boolean",
                                        "description": "Enable or disable Whois privacy for the domain.",
                                        "example": true
                                    },
                                    "locked": {
                                        "type": "boolean",
                                        "description": "Set the transfer lock status for the domain",
                                        "example": true
                                    }
                                },
                                "anyOf": [
                                    {
                                        "required": [
                                            "autorenewEnabled"
                                        ]
                                    },
                                    {
                                        "required": [
                                            "privacyEnabled"
                                        ]
                                    },
                                    {
                                        "required": [
                                            "locked"
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "A successful response will return the updated domain.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/DomainResponsePayload"
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "The request failed to pass validation. See the response message for information as to what failed validation.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/InvalidArgument400"
                                }
                            }
                        }
                    },
                    "403": {
                        "description": "The domain you are attempting to update has expired.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/InvalidArgument400"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "We were unable to locate the domain to update.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        }
                    },
                    "409": {
                        "description": "A condition of the domain prevents the update. There are several reasons you may receive this error. For example, not all domains can be locked by the registrar. Another reason is that a domain does not have WHOIS Privacy available. Please check the \"message\" property of the response so you know why the request has failed.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericConflict409"
                                }
                            }
                        }
                    },
                    "415": {
                        "description": "All POST, PUT, PATCH requests for this API must include the `Content-Type: application/json` header in the requests.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/UnsupportedMedia415"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "An error occurred on the server.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/core/v1/domains/{domainName}/dnssec": {
            "get": {
                "description": "Lists all DNSSEC (DS) records configured for a domain.",
                "operationId": "ListDNSSECs",
                "parameters": [
                    {
                        "description": "DomainName is the domain name to list keys for.",
                        "in": "path",
                        "name": "domainName",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/ListDNSSECsResponse"
                                }
                            }
                        },
                        "description": "A successful response."
                    },
                    "403": {
                        "description": "Failure listing DNSSECs at registry.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericForbidden403"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Domain or DNSSEC not found.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "List DNSSECs",
                "tags": [
                    "DNSSECs"
                ]
            },
            "post": {
                "description": "Adds (registers) a new DNSSEC DS record for a domain.",
                "operationId": "CreateDNSSEC",
                "parameters": [
                    {
                        "description": "DomainName is the domain name to create keys for.",
                        "in": "path",
                        "name": "domainName",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    }
                ],
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/CreateDNSSECBody"
                            }
                        }
                    },
                    "required": true
                },
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/DNSSEC"
                                }
                            }
                        },
                        "description": "A successful response."
                    },
                    "400": {
                        "description": "Invalid request parameters.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/InvalidArgument400"
                                },
                                "example": {
                                    "message": "This resource already exists."
                                }
                            }
                        }
                    },
                    "403": {
                        "description": "Failure creating DNSSEC at registry.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericForbidden403"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Domain or DNSSEC not found.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        }
                    },
                    "415": {
                        "description": "All POST, PUT, PATCH requests for this API must include the `Content-Type: application/json` header in the requests.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/UnsupportedMedia415"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "An error occurred on the server.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "Create DNSSEC",
                "tags": [
                    "DNSSECs"
                ]
            }
        },
        "/core/v1/domains/{domainName}/dnssec/{digest}": {
            "delete": {
                "description": "Deletes a DNSSEC record from a domain.",
                "operationId": "DeleteDNSSEC",
                "parameters": [
                    {
                        "description": "DomainName is the domain name the key is registered for.",
                        "in": "path",
                        "name": "domainName",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    },
                    {
                        "description": "Digest is the digest for the DNSKEY RR to remove from the registry.",
                        "in": "path",
                        "name": "digest",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    }
                ],
                "responses": {
                    "204": {
                        "description": "DNSSEC successfully deleted."
                    },
                    "404": {
                        "description": "Domain or DNSSEC not found.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "An error occurred on the server.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "Delete DNSSEC",
                "tags": [
                    "DNSSECs"
                ]
            },
            "get": {
                "description": "Retrieves details of a specific DNSSEC record for a domain.",
                "operationId": "GetDNSSEC",
                "parameters": [
                    {
                        "description": "DomainName is the domain name.",
                        "in": "path",
                        "name": "domainName",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    },
                    {
                        "description": "Digest is the digest for the DNSKEY RR to retrieve.",
                        "in": "path",
                        "name": "digest",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/DNSSEC"
                                }
                            }
                        },
                        "description": "A successful response."
                    },
                    "404": {
                        "description": "Domain or DNSSEC not found.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "An error occurred on the server.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "Get DNSSEC",
                "tags": [
                    "DNSSECs"
                ]
            }
        },
        "/core/v1/domains/{domainName}/email/forwarding": {
            "get": {
                "description": "Returns a paginated list of all email forwarding rules for a domain.",
                "operationId": "ListEmailForwardings",
                "parameters": [
                    {
                        "description": "DomainName is the domain to list email forwarded boxes for.",
                        "in": "path",
                        "name": "domainName",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    },
                    {
                        "description": "(optional) Per Page is the number of records to return per request. Per Page defaults to 1,000 if not set.",
                        "in": "query",
                        "name": "perPage",
                        "schema": {
                            "format": "int32",
                            "type": "integer",
                            "example": 100
                        }
                    },
                    {
                        "description": "(optional) Page is which page to return. Default to page 1 if not set.",
                        "in": "query",
                        "name": "page",
                        "schema": {
                            "format": "int32",
                            "type": "integer",
                            "example": 1
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/ListEmailForwardingsResponse"
                                }
                            }
                        },
                        "headers": {
                            "Link": {
                                "description": "String delimited list of links for pagination",
                                "schema": {
                                    "type": "string",
                                    "example": "<https://api.dev.name.com?page=3; rel=\"next\">,<https://api.dev.name.com?page=1; rel=\"prev\">,<https://api.dev.name.com?page=10; rel=\"last\">"
                                }
                            }
                        },
                        "description": "A successful response."
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error occurred.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "List Email Forwardings",
                "tags": [
                    "Email Forwardings"
                ]
            },
            "post": {
                "description": "Creates a new email forwarding rule for a domain, such as redirecting info@example.com to an external inbox.  If this is the first email forwarding rule created for the domain, the API may also update your MX records automatically to enable mail routing.  The alias must not conflict with existing email services or MX records.  To modify a forwarding rule later, use [UpdateEmailForwarding](#operation/UpdateEmailForwarding).",
                "operationId": "CreateEmailForwarding",
                "parameters": [
                    {
                        "description": "DomainName is the domain part of the email address to forward.",
                        "in": "path",
                        "name": "domainName",
                        "required": true,
                        "schema": {
                            "type": "string",
                            "example": "example.com"
                        }
                    }
                ],
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/CreateEmailForwardingRequest"
                            }
                        }
                    },
                    "required": true
                },
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/EmailForwarding"
                                }
                            }
                        },
                        "description": "An email forwarding record has been successfully created."
                    },
                    "400": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/InvalidArgument400"
                                }
                            }
                        },
                        "description": "Bad request - Invalid input data."
                    },
                    "403": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "properties": {
                                        "message": {
                                            "type": "string",
                                            "example": "Permission Denied. The domain is expired."
                                        }
                                    }
                                }
                            }
                        },
                        "description": "If the domain in the request has expired, we cannot configure email forwarding for it, and will return this response."
                    },
                    "415": {
                        "description": "All POST, PUT, PATCH requests for this API must include the `Content-Type: application/json` header in the requests.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/UnsupportedMedia415"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        },
                        "description": "An error occurred on the server."
                    }
                },
                "summary": "Create Email Forwarding",
                "tags": [
                    "Email Forwardings"
                ]
            }
        },
        "/core/v1/domains/{domainName}/email/forwarding/{emailBox}": {
            "delete": {
                "description": "Deletes an email forwarding rule from a domain.",
                "operationId": "DeleteEmailForwarding",
                "parameters": [
                    {
                        "description": "DomainName is the domain to delete the email forwarded box from.",
                        "in": "path",
                        "name": "domainName",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    },
                    {
                        "description": "EmailBox is which email box to delete.",
                        "in": "path",
                        "name": "emailBox",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    }
                ],
                "responses": {
                    "204": {
                        "description": "Email Forwarding entry successfully deleted."
                    },
                    "403": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericForbidden403"
                                },
                                "example": {
                                    "message": "Too Many Concurrent Requests"
                                }
                            }
                        },
                        "description": "If the domain that was passed in the request has expired, we cannot configure email forwarding for it, and will return this response."
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error occurred.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "Delete Email Forwarding",
                "tags": [
                    "Email Forwardings"
                ]
            },
            "get": {
                "description": "Retrieves the details of a specific email forwarding entry.",
                "operationId": "GetEmailForwarding",
                "parameters": [
                    {
                        "description": "DomainName is the domain to list email forwarded box for.",
                        "in": "path",
                        "name": "domainName",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    },
                    {
                        "description": "EmailBox is which email box to retrieve.",
                        "in": "path",
                        "name": "emailBox",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/EmailForwarding"
                                }
                            }
                        },
                        "description": "A successful response."
                    },
                    "403": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericForbidden403"
                                },
                                "example": {
                                    "message": "Permission Denied. The domain is expired."
                                }
                            }
                        },
                        "description": "If the domain that was passed in the request has expired, we cannot configure email forwarding for it, and will return this response."
                    },
                    "404": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        },
                        "description": "The Email Forwarding record cannot be found."
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "Get Email Forwarding",
                "tags": [
                    "Email Forwardings"
                ]
            },
            "put": {
                "description": "Updates the destination email address for an existing forwarding rule.",
                "operationId": "UpdateEmailForwarding",
                "parameters": [
                    {
                        "description": "DomainName is the domain part of the email address to forward.",
                        "in": "path",
                        "name": "domainName",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    },
                    {
                        "description": "EmailBox is the user portion of the email address to forward.",
                        "in": "path",
                        "name": "emailBox",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    }
                ],
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/EmailForwardingsUpdateEmailForwardingBody"
                            }
                        }
                    },
                    "required": true
                },
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/EmailForwarding"
                                }
                            }
                        },
                        "description": "A successful response."
                    },
                    "403": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericForbidden403"
                                },
                                "example": {
                                    "message": "Permission Denied. The domain is expired."
                                }
                            }
                        },
                        "description": "If the domain that was passed in the request has expired, we cannot configure email forwarding for it, and will return this response."
                    },
                    "404": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        },
                        "description": "The Email Forwarding record cannot be found."
                    },
                    "415": {
                        "description": "All POST, PUT, PATCH requests for this API must include the `Content-Type: application/json` header in the requests.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/UnsupportedMedia415"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "Update Email Forwarding",
                "tags": [
                    "Email Forwardings"
                ]
            }
        },
        "/core/v1/domains/{domainName}/records": {
            "get": {
                "description": "Lists all DNS records for a specified domain.",
                "operationId": "ListRecords",
                "parameters": [
                    {
                        "description": "DomainName is the zone to list the records for.",
                        "in": "path",
                        "name": "domainName",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    },
                    {
                        "description": "Per Page is the number of records to return per request. Per Page defaults to 1,000.",
                        "in": "query",
                        "name": "perPage",
                        "schema": {
                            "format": "int32",
                            "type": "integer"
                        }
                    },
                    {
                        "description": "Page is which page to return.",
                        "in": "query",
                        "name": "page",
                        "schema": {
                            "format": "int32",
                            "type": "integer"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/ListRecordsResponse"
                                }
                            }
                        },
                        "description": "A successful response."
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error occurred.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "List Records",
                "tags": [
                    "DNS"
                ]
            },
            "post": {
                "description": "Adds a new DNS record to the specified domain zone. Provide the record type (e.g. A, MX, CNAME), host, value, and TTL.  This is used for configuring domain-based services such as email, website hosting, or third-party verifications.",
                "operationId": "CreateRecord",
                "parameters": [
                    {
                        "description": "DomainName is the zone that the record belongs to.",
                        "in": "path",
                        "name": "domainName",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    }
                ],
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/DNSCreateRecordBody"
                            }
                        }
                    },
                    "required": true
                },
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Record"
                                }
                            }
                        },
                        "description": "A successful response."
                    },
                    "415": {
                        "description": "All POST, PUT, PATCH requests for this API must include the `Content-Type: application/json` header in the requests.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/UnsupportedMedia415"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "An error occurred on the server.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "Create Record",
                "tags": [
                    "DNS"
                ]
            }
        },
        "/core/v1/domains/{domainName}/records/{id}": {
            "delete": {
                "description": "Removes a DNS record by ID. Often used during cleanup operations or when replacing outdated DNS settings with updated records.",
                "operationId": "DeleteRecord",
                "parameters": [
                    {
                        "description": "DomainName is the zone that the record to be deleted exists in.",
                        "in": "path",
                        "name": "domainName",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    },
                    {
                        "description": "ID is the server-assigned unique identifier for the Record to be deleted. If the Record with that ID does not exist in the specified Domain, an error is returned.",
                        "in": "path",
                        "name": "id",
                        "required": true,
                        "schema": {
                            "format": "int32",
                            "type": "integer"
                        }
                    }
                ],
                "responses": {
                    "204": {
                        "description": "Record successfully deleted."
                    },
                    "400": {
                        "description": "Bad request - Invalid input data.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/InvalidArgument400"
                                }
                            }
                        }
                    },
                    "403": {
                        "description": "The authoritative nameserver for the request domain is not name.com, or the request domain is expired.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericForbidden403"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Domain or DNS record not found.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "Delete Record",
                "tags": [
                    "DNS"
                ]
            },
            "get": {
                "description": "Retrieves details of a specific DNS record.",
                "operationId": "GetRecord",
                "parameters": [
                    {
                        "description": "DomainName is the zone the record exists in.",
                        "in": "path",
                        "name": "domainName",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    },
                    {
                        "description": "ID is the server-assigned unique identifier for this record.",
                        "in": "path",
                        "name": "id",
                        "required": true,
                        "schema": {
                            "format": "int32",
                            "type": "integer"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Record"
                                }
                            }
                        },
                        "description": "A successful response."
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "An error occurred on the server.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "Get Record",
                "tags": [
                    "DNS"
                ]
            },
            "put": {
                "description": "Replaces an existing DNS record with new data. This is a full overwrite — all required fields (host, type, answer, ttl) must be included in the request body. If you omit a field, the existing value will not be preserved and the request may fail. Use [GetRecord](#operation/GetRecord) beforehand to retrieve the current values if you intend to modify just one field. The record ID must belong to a domain you manage.",
                "operationId": "UpdateRecord",
                "parameters": [
                    {
                        "description": "DomainName is the zone that the record belongs to.",
                        "in": "path",
                        "name": "domainName",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    },
                    {
                        "description": "Unique record id. Value is ignored on Create, and must match the URI on Update.",
                        "in": "path",
                        "name": "id",
                        "required": true,
                        "schema": {
                            "format": "int32",
                            "type": "integer"
                        }
                    }
                ],
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/DNSUpdateRecordBody"
                            }
                        }
                    },
                    "required": true
                },
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Record"
                                }
                            }
                        },
                        "description": "A successful response."
                    },
                    "400": {
                        "description": "Bad request - Invalid input data.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/InvalidArgument400"
                                }
                            }
                        }
                    },
                    "403": {
                        "description": "The authoritative nameserver for the request domain is not name.com, or the request domain is expired.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericForbidden403"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Domain or DNS record not found.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        }
                    },
                    "415": {
                        "description": "All POST, PUT, PATCH requests for this API must include the `Content-Type: application/json` header in the requests.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/UnsupportedMedia415"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "Update Record",
                "tags": [
                    "DNS"
                ]
            }
        },
        "/core/v1/domains/{domainName}/url/forwarding": {
            "get": {
                "description": "Returns all URL forwarding settings configured for a domain.",
                "operationId": "ListURLForwardings",
                "parameters": [
                    {
                        "description": "DomainName is the domain to list URL forwarding entries for.",
                        "in": "path",
                        "name": "domainName",
                        "required": true,
                        "schema": {
                            "type": "string",
                            "example": "example.com",
                            "format": "uri"
                        }
                    },
                    {
                        "description": "Per Page is the number of records to return per request. Per Page defaults to 1,000.",
                        "in": "query",
                        "name": "perPage",
                        "schema": {
                            "format": "int32",
                            "type": "integer",
                            "default": 1000,
                            "minimum": 1,
                            "maximum": 1000,
                            "example": 100
                        }
                    },
                    {
                        "description": "Page is which page to return. Starts at 1 for first page.",
                        "in": "query",
                        "name": "page",
                        "schema": {
                            "format": "int32",
                            "type": "integer",
                            "default": 1,
                            "minimum": 1,
                            "example": 1
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/ListURLForwardingsResponse"
                                }
                            }
                        },
                        "headers": {
                            "Link": {
                                "description": "String delimited list of links for pagination",
                                "schema": {
                                    "type": "string",
                                    "example": "<https://api.dev.name.com?page=3; rel=\"next\">,<https://api.dev.name.com?page=1; rel=\"prev\">,<https://api.dev.name.com?page=10; rel=\"last\">"
                                }
                            }
                        },
                        "description": "A successful response containing the list of URL forwarding entries."
                    },
                    "400": {
                        "description": "Bad Request - Invalid parameters or malformed request.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/InvalidArgument400"
                                }
                            }
                        }
                    },
                    "401": {
                        "description": "Unauthorized.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Unauthorized401"
                                }
                            }
                        }
                    },
                    "403": {
                        "description": "The domain you are attempting to update has expired.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericForbidden403"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Domain or URL forwarding entry not found.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "List URLForwardings",
                "tags": [
                    "URL Forwardings"
                ]
            },
            "post": {
                "description": "Sets up a new URL forwarding (redirect) for a domain or subdomain. If this is the first URL forwarding entry, it may modify the A records for the domain accordingly. Note that changes may take up to 24 hours to fully propagate.",
                "operationId": "CreateURLForwarding",
                "parameters": [
                    {
                        "description": "DomainName is the domain part of the hostname to forward.",
                        "in": "path",
                        "name": "domainName",
                        "required": true,
                        "schema": {
                            "type": "string",
                            "example": "example.com",
                            "format": "uri"
                        }
                    }
                ],
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/CreateURLForwardingBody"
                            }
                        }
                    },
                    "required": true,
                    "description": "URL forwarding details to create"
                },
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/URLForwardingResponse"
                                }
                            }
                        },
                        "description": "A successful response containing the created URL forwarding entry."
                    },
                    "400": {
                        "description": "Bad Request - Invalid parameters or malformed request.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/InvalidArgument400"
                                }
                            }
                        }
                    },
                    "401": {
                        "description": "Unauthorized.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Unauthorized401"
                                }
                            }
                        }
                    },
                    "403": {
                        "description": "The domain you are attempting to update has expired.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericForbidden403"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Not Found - The specified domain was not found.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        }
                    },
                    "409": {
                        "description": "Conflict - A URL forwarding entry already exists for this host.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericConflict409"
                                }
                            }
                        }
                    },
                    "415": {
                        "description": "All POST, PUT, PATCH requests for this API must include the `Content-Type: application/json` header in the requests.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/UnsupportedMedia415"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "Create URLForwarding",
                "tags": [
                    "URL Forwardings"
                ]
            }
        },
        "/core/v1/domains/{domainName}/url/forwarding/{host}": {
            "delete": {
                "description": "Removes a URL forwarding configuration from the domain. This operation cannot be undone.",
                "operationId": "DeleteURLForwarding",
                "parameters": [
                    {
                        "description": "DomainName is the domain to delete the URL forwarding entry from.",
                        "in": "path",
                        "name": "domainName",
                        "required": true,
                        "schema": {
                            "type": "string",
                            "example": "example.com",
                            "format": "uri"
                        }
                    },
                    {
                        "description": "The full hostname, including subdomain.",
                        "in": "path",
                        "name": "host",
                        "required": true,
                        "schema": {
                            "type": "string",
                            "format": "hostname",
                            "example": "www.example.org"
                        }
                    }
                ],
                "responses": {
                    "204": {
                        "description": "URL Forwarding entry successfully deleted."
                    },
                    "401": {
                        "description": "Unauthorized.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Unauthorized401"
                                }
                            }
                        }
                    },
                    "403": {
                        "description": "The domain you are attempting to update has expired.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericForbidden403"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Domain or URL forwarding entry not found.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "Delete URLForwarding",
                "tags": [
                    "URL Forwardings"
                ]
            },
            "get": {
                "description": "Retrieves the details of a specific URL forwarding configuration.",
                "operationId": "GetURLForwarding",
                "parameters": [
                    {
                        "description": "DomainName is the domain to get the URL forwarding entry for.",
                        "in": "path",
                        "name": "domainName",
                        "required": true,
                        "schema": {
                            "type": "string",
                            "example": "example.com",
                            "format": "uri"
                        }
                    },
                    {
                        "description": "The full hostname, including subdomain.",
                        "in": "path",
                        "name": "host",
                        "required": true,
                        "schema": {
                            "type": "string",
                            "format": "hostname",
                            "example": "www.example.org"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/URLForwardingResponse"
                                }
                            }
                        },
                        "description": "A successful response containing the requested URL forwarding entry."
                    },
                    "400": {
                        "description": "Bad request - Invalid query parameters.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/InvalidArgument400"
                                }
                            }
                        }
                    },
                    "401": {
                        "description": "Unauthorized.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Unauthorized401"
                                }
                            }
                        }
                    },
                    "403": {
                        "description": "The domain you are attempting to update has expired.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericForbidden403"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Domain or URL forwarding entry not found.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "Get URLForwarding",
                "tags": [
                    "URL Forwardings"
                ]
            },
            "put": {
                "description": "Modifies an existing URL forwarding rule. Changes may take up to 24 hours to fully propagate.",
                "operationId": "UpdateURLForwarding",
                "parameters": [
                    {
                        "description": "DomainName is the domain part of the hostname to forward.",
                        "in": "path",
                        "name": "domainName",
                        "required": true,
                        "schema": {
                            "type": "string",
                            "example": "example.com",
                            "format": "uri"
                        }
                    },
                    {
                        "description": "The full hostname, including subdomain.",
                        "in": "path",
                        "name": "host",
                        "required": true,
                        "schema": {
                            "type": "string",
                            "format": "hostname",
                            "example": "www.example.org"
                        }
                    }
                ],
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/UpdateURLForwardingBody"
                            }
                        }
                    },
                    "required": true,
                    "description": "Updated URL forwarding configuration"
                },
                "responses": {
                    "200": {
                        "description": "A successful response containing the updated URL forwarding entry.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/URLForwardingResponse"
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Bad request - Invalid query parameters.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/InvalidArgument400"
                                }
                            }
                        }
                    },
                    "401": {
                        "description": "Unauthorized.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Unauthorized401"
                                }
                            }
                        }
                    },
                    "403": {
                        "description": "The domain you are attempting to update has expired.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericForbidden403"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Domain or URL forwarding entry not found.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        }
                    },
                    "415": {
                        "description": "All POST, PUT, PATCH requests for this API must include the `Content-Type: application/json` header in the requests.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/UnsupportedMedia415"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "Update URLForwarding",
                "tags": [
                    "URL Forwardings"
                ]
            }
        },
        "/core/v1/domains/{domainName}/vanity_nameservers": {
            "get": {
                "summary": "List Vanity Nameservers",
                "description": "Lists all vanity nameserver hostnames configured for a domain.",
                "operationId": "ListVanityNameservers",
                "tags": [
                    "Vanity Nameservers"
                ],
                "parameters": [
                    {
                        "name": "domainName",
                        "in": "path",
                        "description": "The domain name to list vanity nameservers for.",
                        "required": true,
                        "schema": {
                            "type": "string",
                            "format": "hostname",
                            "example": "example.com"
                        }
                    },
                    {
                        "name": "perPage",
                        "in": "query",
                        "description": "The number of records to return per page. Defaults to 1000.",
                        "schema": {
                            "type": "integer",
                            "format": "int32",
                            "minimum": 1,
                            "default": 1000,
                            "example": 50
                        },
                        "style": "form",
                        "explode": true
                    },
                    {
                        "name": "page",
                        "in": "query",
                        "description": "The page number to return.",
                        "schema": {
                            "type": "integer",
                            "format": "int32",
                            "minimum": 1,
                            "default": 1,
                            "example": 2
                        },
                        "style": "form",
                        "explode": true
                    }
                ],
                "responses": {
                    "200": {
                        "description": "List of vanity nameservers.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/ListVanityNameserversResponse"
                                }
                            }
                        },
                        "headers": {
                            "Link": {
                                "description": "String delimited list of links for pagination",
                                "schema": {
                                    "type": "string",
                                    "example": "<https://api.dev.name.com?page=3; rel=\"next\">,<https://api.dev.name.com?page=1; rel=\"prev\">,<https://api.dev.name.com?page=10; rel=\"last\">"
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Bad request - Invalid query parameters.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/InvalidArgument400"
                                }
                            }
                        }
                    },
                    "403": {
                        "description": "If the domain that was passed in the request has expired, we cannot create vanity nameservers for it, and will return this response.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericForbidden403"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Domain not found.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                }
            },
            "post": {
                "summary": "Create Vanity Nameserver",
                "description": "Register a new vanity nameserver for the specified domain.",
                "operationId": "CreateVanityNameserver",
                "tags": [
                    "Vanity Nameservers"
                ],
                "parameters": [
                    {
                        "name": "domainName",
                        "in": "path",
                        "description": "The domain name to create a vanity nameserver for.",
                        "required": true,
                        "schema": {
                            "type": "string",
                            "format": "hostname",
                            "example": "example.com"
                        }
                    }
                ],
                "requestBody": {
                    "description": "Details of the vanity nameserver to create.",
                    "required": true,
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/CreateVanityNameserverBody"
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "Vanity nameserver successfully created.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/VanityNameserverResponse"
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Bad request - Invalid input data.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/InvalidArgument400"
                                }
                            }
                        }
                    },
                    "403": {
                        "description": "If the domain that was passed in the request has expired, we cannot create vanity nameservers for it, and will return this response.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericForbidden403"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Domain not found.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        }
                    },
                    "415": {
                        "description": "All POST, PUT, PATCH requests for this API must include the `Content-Type: application/json` header in the requests.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/UnsupportedMedia415"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/core/v1/domains/{domainName}/vanity_nameservers/{hostname}": {
            "delete": {
                "summary": "Delete Vanity Nameserver",
                "description": "Deletes a vanity nameserver from the domain’s registry settings. This operation might fail if the registry detects the nameserver is still in use.",
                "operationId": "DeleteVanityNameserver",
                "tags": [
                    "Vanity Nameservers"
                ],
                "parameters": [
                    {
                        "name": "domainName",
                        "in": "path",
                        "description": "The domain name associated with the vanity nameserver.",
                        "required": true,
                        "schema": {
                            "type": "string",
                            "format": "hostname",
                            "example": "example.com"
                        }
                    },
                    {
                        "name": "hostname",
                        "in": "path",
                        "description": "The hostname of the vanity nameserver to delete.",
                        "required": true,
                        "schema": {
                            "type": "string",
                            "format": "hostname",
                            "example": "ns1.example.com"
                        }
                    }
                ],
                "responses": {
                    "204": {
                        "description": "Vanity nameserver successfully deleted."
                    },
                    "400": {
                        "description": "Bad request - Invalid input data.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/InvalidArgument400"
                                }
                            }
                        }
                    },
                    "403": {
                        "description": "If the domain that was passed in the request has expired, we cannot delete vanity nameservers for it, and will return this response.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericForbidden403"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Domain or vanity nameserver hostname not found.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                }
            },
            "get": {
                "summary": "Get Vanity Nameserver",
                "description": "Retrieves details for a of a specific vanity nameserver (including its IP addresses).",
                "operationId": "GetVanityNameserver",
                "tags": [
                    "Vanity Nameservers"
                ],
                "parameters": [
                    {
                        "name": "domainName",
                        "in": "path",
                        "description": "The domain name associated with the vanity nameserver.",
                        "required": true,
                        "schema": {
                            "type": "string",
                            "format": "hostname",
                            "example": "example.com"
                        }
                    },
                    {
                        "name": "hostname",
                        "in": "path",
                        "description": "The hostname of the vanity nameserver to retrieve.",
                        "required": true,
                        "schema": {
                            "type": "string",
                            "format": "hostname",
                            "example": "ns1.example.com"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Details of the vanity nameserver.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/VanityNameserverResponse"
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Bad request - Invalid input data.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/InvalidArgument400"
                                }
                            }
                        }
                    },
                    "403": {
                        "description": "If the domain that was passed in the request has expired, we cannot get vanity nameservers for it, and will return this response.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericForbidden403"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Domain or vanity nameserver hostname not found.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                }
            },
            "put": {
                "summary": "Update Vanity Nameserver IP",
                "description": "Updates the glue record IP addresses for a vanity nameserver.",
                "operationId": "UpdateVanityNameserver",
                "tags": [
                    "Vanity Nameservers"
                ],
                "parameters": [
                    {
                        "name": "domainName",
                        "in": "path",
                        "description": "The domain name associated with the vanity nameserver.",
                        "required": true,
                        "schema": {
                            "type": "string",
                            "format": "hostname",
                            "example": "example.com"
                        }
                    },
                    {
                        "name": "hostname",
                        "in": "path",
                        "description": "The hostname of the vanity nameserver to update.",
                        "required": true,
                        "schema": {
                            "type": "string",
                            "format": "hostname",
                            "example": "ns1.example.com"
                        }
                    }
                ],
                "requestBody": {
                    "description": "Updated IP addresses for the vanity nameserver.",
                    "required": true,
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/UpdateVanityNameserverBody"
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "Vanity nameserver successfully updated.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/VanityNameserverResponse"
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Bad request - Invalid input data.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/InvalidArgument400"
                                }
                            }
                        }
                    },
                    "403": {
                        "description": "If the domain that was passed in the request has expired, we cannot update vanity nameservers for it, and will return this response.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericForbidden403"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Domain or vanity nameserver hostname not found.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        }
                    },
                    "415": {
                        "description": "All POST, PUT, PATCH requests for this API must include the `Content-Type: application/json` header in the requests.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/UnsupportedMedia415"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/core/v1/domains/{domainName}:disableAutorenew": {
            "post": {
                "description": "Turns off automatic renewal for a domain.  **DEPRECATED** This endpoint is deprecated in favor of the new UpdateDomain API. This will be removed in a future release.",
                "operationId": "DisableAutorenew",
                "deprecated": true,
                "parameters": [
                    {
                        "description": "DomainName is the domain name to disable autorenew for.",
                        "in": "path",
                        "name": "domainName",
                        "required": true,
                        "schema": {
                            "type": "string"
                        },
                        "example": "example.com"
                    },
                    {
                        "description": "Required Content-Type Header for POST requests.",
                        "in": "header",
                        "name": "Content-Type",
                        "required": true,
                        "schema": {
                            "type": "string",
                            "enum": [
                                "application/json"
                            ]
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Domain"
                                }
                            }
                        },
                        "description": "A successful response."
                    },
                    "400": {
                        "description": "Bad request - Invalid query parameters.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/InvalidArgument400"
                                }
                            }
                        }
                    },
                    "403": {
                        "description": "If the domain that was passed in the request has expired, we cannot disable autorenew on it.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericForbidden403"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Domain not found.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        }
                    },
                    "415": {
                        "description": "All POST, PUT, PATCH requests for this API must include the `Content-Type: application/json` header in the requests.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/UnsupportedMedia415"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "Disable Autorenew",
                "tags": [
                    "Domains"
                ]
            }
        },
        "/core/v1/domains/{domainName}:disableWhoisPrivacy": {
            "post": {
                "description": "Disables WHOIS privacy protection on a domain. **DEPRECATED** This endpoint is deprecated in favor of the new UpdateDomain API. This will be removed in a future release.",
                "operationId": "DisableWhoisPrivacy",
                "deprecated": true,
                "parameters": [
                    {
                        "description": "DomainName is the domain name to disable whoisprivacy for.",
                        "in": "path",
                        "name": "domainName",
                        "required": true,
                        "schema": {
                            "type": "string"
                        },
                        "example": "example.com"
                    },
                    {
                        "description": "Required Content-Type Header for POST requests.",
                        "in": "header",
                        "name": "Content-Type",
                        "required": true,
                        "schema": {
                            "type": "string",
                            "enum": [
                                "application/json"
                            ]
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Domain"
                                }
                            }
                        },
                        "description": "A successful response."
                    },
                    "400": {
                        "description": "Bad request - Invalid query parameters.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/InvalidArgument400"
                                }
                            }
                        }
                    },
                    "403": {
                        "description": "If the domain that was passed in the request has expired, we cannot disable Whois Privacy on it.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericForbidden403"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Domain not found.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        }
                    },
                    "415": {
                        "description": "All POST, PUT, PATCH requests for this API must include the `Content-Type: application/json` header in the requests.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/UnsupportedMedia415"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "Disable Whois Privacy",
                "tags": [
                    "Domains"
                ]
            }
        },
        "/core/v1/domains/{domainName}:enableAutorenew": {
            "post": {
                "description": "Turns on automatic renewal for a domain. **DEPRECATED** This endpoint is deprecated in favor of the new UpdateDomain API. This will be removed in a future release.",
                "operationId": "EnableAutorenew",
                "deprecated": true,
                "parameters": [
                    {
                        "description": "DomainName is the domain name to enable autorenew for.",
                        "in": "path",
                        "name": "domainName",
                        "required": true,
                        "schema": {
                            "type": "string"
                        },
                        "example": "example.com"
                    },
                    {
                        "description": "Required Content-Type Header for POST requests.",
                        "in": "header",
                        "name": "Content-Type",
                        "required": true,
                        "schema": {
                            "type": "string",
                            "enum": [
                                "application/json"
                            ]
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Domain"
                                }
                            }
                        },
                        "description": "A successful response."
                    },
                    "400": {
                        "description": "Bad request - Invalid query parameters.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/InvalidArgument400"
                                }
                            }
                        }
                    },
                    "403": {
                        "description": "If the domain that was passed in the request has expired, we cannot enable autorenew on it.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericForbidden403"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Domain not found.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        }
                    },
                    "415": {
                        "description": "All POST, PUT, PATCH requests for this API must include the `Content-Type: application/json` header in the requests.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/UnsupportedMedia415"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "Enable Autorenew",
                "tags": [
                    "Domains"
                ]
            }
        },
        "/core/v1/domains/{domainName}:enableWhoisPrivacy": {
            "post": {
                "description": "Enables WHOIS privacy protection on a domain. **DEPRECATED** This endpoint is deprecated in favor of the new UpdateDomain API. This will be removed in a future release.",
                "operationId": "EnableWhoisPrivacy",
                "deprecated": true,
                "parameters": [
                    {
                        "description": "DomainName is the domain name to enable whoisprivacy for.",
                        "in": "path",
                        "name": "domainName",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    },
                    {
                        "description": "Required Content-Type Header for POST requests.",
                        "in": "header",
                        "name": "Content-Type",
                        "required": true,
                        "schema": {
                            "type": "string",
                            "enum": [
                                "application/json"
                            ]
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Domain"
                                }
                            }
                        },
                        "description": "A successful response."
                    },
                    "400": {
                        "description": "Bad request - Invalid query parameters.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/InvalidArgument400"
                                }
                            }
                        }
                    },
                    "401": {
                        "description": "If the domain that was passed in the request has expired, we cannot enable Whois Privacy on it.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Unauthorized401"
                                }
                            }
                        }
                    },
                    "403": {
                        "description": "If the domain that was passed in the request has expired, we cannot enable autorenew on it.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericForbidden403"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Domain not found.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        }
                    },
                    "415": {
                        "description": "All POST, PUT, PATCH requests for this API must include the `Content-Type: application/json` header in the requests.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/UnsupportedMedia415"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "Enable Whois Privacy",
                "tags": [
                    "Domains"
                ]
            }
        },
        "/core/v1/domains/{domainName}:getAuthCode": {
            "get": {
                "description": "Retrieves the transfer authorization code (EPP code) for a domain.",
                "operationId": "GetAuthCodeForDomain",
                "parameters": [
                    {
                        "name": "domainName",
                        "description": "DomainName is the domain name to retrieve the authorization code for.",
                        "in": "path",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/AuthCodeResponse"
                                }
                            }
                        },
                        "description": "A successful response."
                    },
                    "403": {
                        "description": "You are attempting to make an API request with invalid credentials.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericForbidden403"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Domain name not found.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        }
                    },
                    "406": {
                        "description": "We were unable to retrieve an auth code for the domain. You will need to reach out to the registrar for more information.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                },
                                "example": {
                                    "message": "No authcode found"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "An error has occurred on the server.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "Get Auth Code For Domain",
                "tags": [
                    "Domains"
                ]
            }
        },
        "/core/v1/domains/{domainName}:getPricing": {
            "get": {
                "description": "Retrieves the registration and renewal pricing for a given domain.",
                "operationId": "GetPricingForDomain",
                "parameters": [
                    {
                        "name": "domainName",
                        "description": "DomainName is the domain to retrieve.",
                        "in": "path",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    },
                    {
                        "name": "years",
                        "description": "Years specifies the time period in years to get pricing for the domain. Years defaults to the minimum time period (typically 1 year) if not passed and cannot be more than 10.  Some TLDs default to longer periods (e.g. .AI requires 2 year periods).",
                        "in": "query",
                        "schema": {
                            "format": "int32",
                            "type": "integer",
                            "example": 2
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/PricingResponse"
                                }
                            }
                        },
                        "description": "A successful response."
                    },
                    "404": {
                        "description": "Domain name not found.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    }
                },
                "summary": "Get Pricing For Domain",
                "tags": [
                    "Domains"
                ]
            }
        },
        "/core/v1/domains/{domainName}:lock": {
            "post": {
                "description": "Locks a domain to prevent it from being transferred. **DEPRECATED** This endpoint is deprecated in favor of the new UpdateDomain API. This will be removed in a future release.",
                "operationId": "LockDomain",
                "deprecated": true,
                "parameters": [
                    {
                        "description": "DomainName is the domain name to lock.",
                        "in": "path",
                        "name": "domainName",
                        "required": true,
                        "schema": {
                            "type": "string"
                        },
                        "example": "example.com"
                    },
                    {
                        "description": "Required Content-Type Header for POST requests.",
                        "in": "header",
                        "name": "Content-Type",
                        "required": true,
                        "schema": {
                            "type": "string",
                            "enum": [
                                "application/json"
                            ]
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Domain"
                                }
                            }
                        },
                        "description": "A successful response."
                    },
                    "400": {
                        "description": "Bad request - Invalid query parameters.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/InvalidArgument400"
                                }
                            }
                        }
                    },
                    "403": {
                        "description": "If the domain that was passed in the request has expired, we cannot lock the domain.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericForbidden403"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Domain not found.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        }
                    },
                    "415": {
                        "description": "All POST, PUT, PATCH requests for this API must include the `Content-Type: application/json` header in the requests.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/UnsupportedMedia415"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "Lock Domain",
                "tags": [
                    "Domains"
                ]
            }
        },
        "/core/v1/domains/{domainName}:purchasePrivacy": {
            "post": {
                "description": "Adds or renews WHOIS privacy protection for a domain. This is used to ensure personal contact details remain hidden from public WHOIS lookups.  If WHOIS privacy is already enabled, this will extend the protection. If it’s not yet active, this will both purchase and enable the service.  This is a billable action unless covered by a bundled privacy plan.",
                "operationId": "PurchasePrivacy",
                "parameters": [
                    {
                        "description": "DomainName is the domain to purchase Whois Privacy for.",
                        "in": "path",
                        "name": "domainName",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    }
                ],
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/DomainsPurchasePrivacyBody"
                            }
                        }
                    },
                    "required": true
                },
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/PrivacyResponse"
                                }
                            }
                        },
                        "description": "A successful response."
                    },
                    "401": {
                        "description": "Unauthorized.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Unauthorized401"
                                }
                            }
                        }
                    },
                    "402": {
                        "description": "Payment has failed for this transaction.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/PaymentRequired402"
                                }
                            }
                        }
                    },
                    "415": {
                        "description": "All POST, PUT, PATCH requests for this API must include the `Content-Type: application/json` header in the requests.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/UnsupportedMedia415"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "Purchase Privacy",
                "tags": [
                    "Domains"
                ]
            }
        },
        "/core/v1/domains/{domainName}:renew": {
            "post": {
                "description": "Renews an existing domain for an additional registration period.  Include the domain name and renewal term.  If the domain has non-standard pricing (e.g. premium), the purchasePrice must be passed.  This is typically used to extend ownership before a domain’s expiration.",
                "operationId": "RenewDomain",
                "parameters": [
                    {
                        "description": "DomainName is the domain to renew.",
                        "in": "path",
                        "name": "domainName",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    }
                ],
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/DomainsRenewDomainBody"
                            }
                        }
                    },
                    "required": true
                },
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/RenewDomainResponse"
                                }
                            }
                        },
                        "description": "A successful response."
                    },
                    "404": {
                        "description": "Domain name not found.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        }
                    },
                    "415": {
                        "description": "All POST, PUT, PATCH requests for this API must include the `Content-Type: application/json` header in the requests.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/UnsupportedMedia415"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    }
                },
                "summary": "Renew Domain",
                "tags": [
                    "Domains"
                ]
            }
        },
        "/core/v1/domains/{domainName}:setContacts": {
            "post": {
                "description": "Updates WHOIS contact information for a domain. This includes the registrant, administrative, technical, and billing contacts.  All contact objects must be complete — partial updates are not supported.  You should fetch the existing contact data first (e.g., via [GetDomain](#operation/GetDomain) and modify only the values you wish to change.  This call replaces all four contact sets at once.",
                "operationId": "SetContacts",
                "parameters": [
                    {
                        "description": "DomainName is the domain name to set the contacts for.",
                        "in": "path",
                        "name": "domainName",
                        "required": true,
                        "schema": {
                            "type": "string",
                            "example": "example.com"
                        }
                    }
                ],
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/DomainsSetContactsBody"
                            }
                        }
                    },
                    "required": true
                },
                "responses": {
                    "200": {
                        "description": "A successful response with updated domain contact information.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/DomainResponsePayload"
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Bad request - Invalid query parameters.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/InvalidArgument400"
                                }
                            }
                        }
                    },
                    "403": {
                        "description": "If the domain that was passed in the request has expired, we cannot set contacts for it, and will return this response.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericForbidden403"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Domain not found.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        }
                    },
                    "415": {
                        "description": "All POST, PUT, PATCH requests for this API must include the `Content-Type: application/json` header in the requests.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/UnsupportedMedia415"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "Set Contacts",
                "tags": [
                    "Domains"
                ]
            }
        },
        "/core/v1/domains/{domainName}:setNameservers": {
            "post": {
                "description": "SetNameservers will set the nameservers for the Domain. This operation updates the DNS configuration by changing which nameservers are responsible for the domain's zone.",
                "operationId": "SetNameservers",
                "parameters": [
                    {
                        "description": "DomainName is the domain name to set the nameservers for.",
                        "in": "path",
                        "name": "domainName",
                        "required": true,
                        "schema": {
                            "type": "string",
                            "example": "example.com"
                        }
                    }
                ],
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/DomainsSetNameserversBody"
                            }
                        }
                    },
                    "required": true
                },
                "responses": {
                    "200": {
                        "description": "A successful response.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/DomainResponsePayload"
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Bad request - Invalid query parameters.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/InvalidArgument400"
                                }
                            }
                        }
                    },
                    "403": {
                        "description": "If the domain that was passed in the request has expired, we cannot set nameservers for it, and will return this response.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericForbidden403"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Domain not found.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        }
                    },
                    "415": {
                        "description": "All POST, PUT, PATCH requests for this API must include the `Content-Type: application/json` header in the requests.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/UnsupportedMedia415"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "Set Nameservers",
                "tags": [
                    "Domains"
                ]
            }
        },
        "/core/v1/domains/{domainName}:unlock": {
            "post": {
                "description": "Unlocks a domain to allow it to be transferred. **DEPRECATED** This endpoint is deprecated in favor of the new UpdateDomain API. This will be removed in a future release.",
                "operationId": "UnlockDomain",
                "deprecated": true,
                "parameters": [
                    {
                        "description": "DomainName is the domain name to unlock.",
                        "in": "path",
                        "name": "domainName",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    },
                    {
                        "description": "Required Content-Type Header for POST requests.",
                        "in": "header",
                        "name": "Content-Type",
                        "required": true,
                        "schema": {
                            "type": "string",
                            "enum": [
                                "application/json"
                            ]
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Domain"
                                }
                            }
                        },
                        "description": "A successful response."
                    },
                    "400": {
                        "description": "Bad request - Invalid query parameters.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/InvalidArgument400"
                                }
                            }
                        }
                    },
                    "403": {
                        "description": "If the domain that was passed in the request has expired, we cannot unlock the domain.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericForbidden403"
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "Domain not found.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        }
                    },
                    "415": {
                        "description": "All POST, PUT, PATCH requests for this API must include the `Content-Type: application/json` header in the requests.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/UnsupportedMedia415"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "Unlock Domain",
                "tags": [
                    "Domains"
                ]
            }
        },
        "/core/v1/domains:checkAvailability": {
            "post": {
                "description": "CheckAvailability will check a list of domains to see if they are purchasable. A Maximum of 50 domains can be specified.",
                "operationId": "CheckAvailability",
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/AvailabilityRequest"
                            }
                        }
                    },
                    "description": "AvailabilityRequest is used to list the domain names to check availability for.",
                    "required": true
                },
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/SearchResponse"
                                }
                            }
                        },
                        "description": "A successful response."
                    },
                    "401": {
                        "description": "Unauthorized.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Unauthorized401"
                                }
                            }
                        }
                    },
                    "415": {
                        "description": "All POST, PUT, PATCH requests for this API must include the `Content-Type: application/json` header in the requests.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/UnsupportedMedia415"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "502": {
                        "description": "Registries can sometimes go into maintenance, or be unavailable for several reasons. If we are unable to contact the registry for the domains you are checking the availability for, we will return this response.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/BadGateway502"
                                }
                            }
                        }
                    }
                },
                "summary": "Check Availability",
                "tags": [
                    "Domains"
                ]
            }
        },
        "/core/v1/domains:search": {
            "post": {
                "description": "Searches for domain name suggestions based on a keyword or term. Important: Do not encode the `:` in the path. Use `/core/v1/domains:search`, not `/core/v1/domains%3Asearch`.",
                "operationId": "Search",
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/SearchRequest"
                            }
                        }
                    },
                    "description": "SearchRequest is used to specify the search parameters.",
                    "required": true
                },
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/SearchResponse"
                                }
                            }
                        },
                        "description": "A successful response."
                    },
                    "400": {
                        "description": "Returned when an invalid request is made. The message will contain information on the field that is failing validation.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/InvalidArgument400"
                                }
                            }
                        }
                    },
                    "415": {
                        "description": "All POST, PUT, PATCH requests for this API must include the `Content-Type: application/json` header in the requests.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/UnsupportedMedia415"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "An internal error occurred on the server.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "Search",
                "tags": [
                    "Domains"
                ]
            }
        },
        "/core/v1/hello": {
            "get": {
                "description": "Returns basic information about the API server (useful for testing connectivity and version checks).",
                "operationId": "Hello",
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/HelloResponse"
                                }
                            }
                        },
                        "description": "A successful response."
                    },
                    "401": {
                        "description": "Unauthorized.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Unauthorized401"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "Hello",
                "tags": [
                    "Hello"
                ]
            }
        },
        "/core/v1/notifications": {
            "get": {
                "description": "Retrieves all active webhook subscriptions on the account.",
                "operationId": "GetSubscribedNotifications",
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/ListSubscribedWebhooksResponse"
                                }
                            }
                        },
                        "description": "A successful response."
                    },
                    "401": {
                        "description": "Unauthorized.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Unauthorized401"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "Get Subscribed Notifications",
                "tags": [
                    "Webhook Notifications"
                ]
            },
            "post": {
                "description": "Creates a webhook subscription to receive real-time notifications about specific domain or account events (e.g. transfer completions, renewals).  Pass the callback URL and event types. This allows external systems to stay in sync with name.com changes.",
                "operationId": "SubscribeToNotification",
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/SubscribeToNotification"
                            }
                        }
                    }
                },
                "responses": {
                    "201": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/SubscribeToNotificationResponse"
                                }
                            }
                        },
                        "description": "A successful response."
                    },
                    "401": {
                        "description": "Unauthorized.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Unauthorized401"
                                }
                            }
                        }
                    },
                    "415": {
                        "description": "All POST, PUT, PATCH requests for this API must include the `Content-Type: application/json` header in the requests.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/UnsupportedMedia415"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "Subscribe To Notification",
                "tags": [
                    "Webhook Notifications"
                ]
            }
        },
        "/core/v1/notifications/{id}": {
            "delete": {
                "description": "Removes a webhook subscription from the account.",
                "operationId": "DeleteSubscription",
                "parameters": [
                    {
                        "description": "ID of the subscription to delete.",
                        "in": "path",
                        "name": "id",
                        "required": true,
                        "schema": {
                            "format": "int32",
                            "type": "integer"
                        }
                    }
                ],
                "responses": {
                    "204": {
                        "description": "Subscription successfully deleted."
                    },
                    "401": {
                        "description": "Unauthorized.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Unauthorized401"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "Delete Subscription",
                "tags": [
                    "Webhook Notifications"
                ]
            },
            "put": {
                "description": "Updates an existing webhook’s configuration.  This may include changing the callback URL or updating whether the webhook is currently active.",
                "operationId": "ModifySubscription",
                "parameters": [
                    {
                        "description": "ID of the subscription to update.",
                        "in": "path",
                        "name": "id",
                        "required": true,
                        "schema": {
                            "format": "int32",
                            "type": "integer"
                        }
                    }
                ],
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "url": {
                                        "type": "string",
                                        "description": "Optionally update the URL we send the webhook data to",
                                        "example": "https://example2.com"
                                    },
                                    "active": {
                                        "type": "boolean",
                                        "description": "Optionally update if the subscription is currently active",
                                        "example": false
                                    }
                                },
                                "anyOf": [
                                    {
                                        "required": [
                                            "url"
                                        ]
                                    },
                                    {
                                        "required": [
                                            "active"
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/ModifySubscriptionResponse"
                                }
                            }
                        },
                        "description": "A successful response."
                    },
                    "404": {
                        "description": "The requested resource could not be located.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        }
                    },
                    "415": {
                        "description": "All POST, PUT, PATCH requests for this API must include the `Content-Type: application/json` header in the requests.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/UnsupportedMedia415"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "An error occurred on the server.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "Modify Subscription",
                "tags": [
                    "Webhook Notifications"
                ]
            }
        },
        "/core/v1/orders": {
            "get": {
                "description": "Retrieves a list of all orders placed in the account.",
                "operationId": "ListOrders",
                "parameters": [
                    {
                        "name": "perPage",
                        "description": "Per Page is the number of records to return per request. Per Page defaults to 1,000.",
                        "in": "query",
                        "schema": {
                            "format": "int32",
                            "type": "integer",
                            "default": 1000
                        }
                    },
                    {
                        "name": "page",
                        "description": "Page is which page to return.",
                        "in": "query",
                        "schema": {
                            "format": "int32",
                            "type": "integer",
                            "default": 1
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/ListOrdersResponse"
                                }
                            }
                        },
                        "description": "A successful response.",
                        "headers": {
                            "Link": {
                                "description": "String delimited list of links for pagination",
                                "schema": {
                                    "type": "string",
                                    "example": "<https://api.dev.name.com?page=3; rel=\"next\">,<https://api.dev.name.com?page=1; rel=\"prev\">,<https://api.dev.name.com?page=10; rel=\"last\">"
                                }
                            }
                        }
                    },
                    "401": {
                        "description": "Unauthorized.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Unauthorized401"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "List Orders",
                "tags": [
                    "Orders"
                ]
            }
        },
        "/core/v1/orders/{orderId}": {
            "get": {
                "description": "Fetches full details about a specific order using its ID. This includes domains, prices, and timestamps.  Useful for confirming transactions, receipts, or generating invoices.",
                "operationId": "GetOrder",
                "parameters": [
                    {
                        "description": "OrderId is the unique identifier of the requested order.",
                        "in": "path",
                        "name": "orderId",
                        "required": true,
                        "schema": {
                            "format": "int32",
                            "type": "integer"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Order"
                                }
                            }
                        },
                        "description": "A successful response."
                    },
                    "404": {
                        "description": "Order not found.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    }
                },
                "summary": "Get Order",
                "tags": [
                    "Orders"
                ]
            }
        },
        "/core/v1/transfers": {
            "get": {
                "description": "Returns all domain transfer requests for the account, including in-progress and recent transfers.",
                "operationId": "ListTransfers",
                "parameters": [
                    {
                        "description": "Per Page is the number of records to return per request. Per Page defaults to 1,000.",
                        "in": "query",
                        "name": "perPage",
                        "schema": {
                            "format": "int32",
                            "type": "integer"
                        }
                    },
                    {
                        "description": "Page is which page to return.",
                        "in": "query",
                        "name": "page",
                        "schema": {
                            "format": "int32",
                            "type": "integer"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/ListTransfersResponse"
                                }
                            }
                        },
                        "headers": {
                            "Link": {
                                "description": "String of comma delimited links for pagination of the response",
                                "schema": {
                                    "type": "string",
                                    "example": "<https:\\\\api.dev.name.com?page=3; rel=\"next\">,<https:\\\\api.dev.name.com?page=1; rel=\"prev\">,<https:\\\\api.dev.name.com?page=10; rel=\"last\">"
                                }
                            }
                        },
                        "description": "A successful response."
                    },
                    "401": {
                        "description": "Unauthorized.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Unauthorized401"
                                }
                            }
                        }
                    },
                    "402": {
                        "description": "Payment has failed for this transaction.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/PaymentRequired402"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        },
                        "description": "A server error occurred."
                    }
                },
                "summary": "List Transfers",
                "tags": [
                    "Transfers"
                ]
            },
            "post": {
                "description": "Initiates a domain transfer into your name.com account from another registrar.  You must provide the domain name and its valid transfer authorization code (EPP code).  The domain must not be locked or under any transfer restrictions (e.g. clientTransferProhibited).  If successful, the transfer is submitted and tracked through the ICANN transfer process. Once a transfer has been created, you can track its progress via the [GetTransfer](#operation/GetTransfer) endpoint.",
                "operationId": "CreateTransfer",
                "requestBody": {
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/CreateTransferRequest"
                            }
                        }
                    },
                    "description": "CreateTransferRequest passes the required transfer info to the CreateTransfer function.",
                    "required": true
                },
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/CreateTransferResponse"
                                }
                            }
                        },
                        "description": "A successful response."
                    },
                    "400": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/InvalidArgument400"
                                }
                            }
                        },
                        "description": "There was an invalid or missing argument in the request. The response messages will indicate which fields are invalid."
                    },
                    "402": {
                        "description": "The account placing the order has insufficient account credit to process this transfer order.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                },
                                "example": {
                                    "message": "Insufficient Funds"
                                }
                            }
                        }
                    },
                    "409": {
                        "description": "The status of the domain indicates that we are unable to process a transfer for it.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericConflict409"
                                }
                            }
                        }
                    },
                    "415": {
                        "description": "All POST, PUT, PATCH requests for this API must include the `Content-Type: application/json` header in the requests.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/UnsupportedMedia415"
                                }
                            }
                        }
                    },
                    "429": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/InvalidArgument400"
                                },
                                "example": {
                                    "message": "Too Many Concurrent Requests"
                                }
                            }
                        },
                        "description": "We can only process one (1) order for your account at a time. We will return this response when an order is still processing, but an attempt to create a new order is made."
                    },
                    "500": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        },
                        "description": "This can mean there was an internal error on the server, or that the domain has a lock status that prevents the transfers. Please confirm by checking the message parameter. We will update this API at a later date to have a more accurate response code in this instance."
                    }
                },
                "summary": "Create Transfer",
                "tags": [
                    "Transfers"
                ]
            }
        },
        "/core/v1/transfers/{domainName}": {
            "get": {
                "description": "Retrieves details of a specific domain transfer request.",
                "operationId": "GetTransfer",
                "parameters": [
                    {
                        "description": "DomainName is the domain you want to get the transfer information for.",
                        "in": "path",
                        "name": "domainName",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Transfer"
                                }
                            }
                        },
                        "description": "A successful response."
                    },
                    "404": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        },
                        "description": "We were unable to locate a transfer for the requested domain."
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        },
                        "description": "A server error occurred."
                    }
                },
                "summary": "Get Transfer",
                "tags": [
                    "Transfers"
                ]
            }
        },
        "/core/v1/transfers/{domainName}:cancel": {
            "post": {
                "description": "Cancels a pending transfer request. This can be used if the transfer was initiated in error or if the authorization code provided was incorrect. The price of the transfer will refund the amount to account credit.",
                "operationId": "CancelTransfer",
                "parameters": [
                    {
                        "description": "DomainName is the domain to cancel the transfer for.",
                        "in": "path",
                        "name": "domainName",
                        "required": true,
                        "schema": {
                            "type": "string"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Transfer"
                                }
                            }
                        },
                        "description": "A successful response."
                    },
                    "400": {
                        "description": "Response returned when you have requested to cancel a transfer that has already been cancelled.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                },
                                "example": {
                                    "message": "A transfer for this domain has already been canceled"
                                }
                            }
                        }
                    },
                    "404": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        },
                        "description": "We were unable to locate a cancelable transfer for the requested domain."
                    },
                    "415": {
                        "description": "All POST, PUT, PATCH requests for this API must include the `Content-Type: application/json` header in the requests.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/UnsupportedMedia415"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        },
                        "description": "An internal server error occurred."
                    }
                },
                "summary": "Cancel Transfer",
                "tags": [
                    "Transfers"
                ]
            }
        },
        "/core/v1/domaininfo/requirements/{tld}": {
            "get": {
                "description": "Returns the registration requirements some general information for a specific TLD. The response contains a detailed description of eligibility criteria and a fields object with all required and optional fields, including validation rules, conditional logic, and nested field structures. Provide the TLD as a path parameter to retrieve its complete registration requirements. Useful when you only need details for one TLD (e.g., when a user selects .fr from a dropdown).",
                "operationId": "GetRequirement",
                "parameters": [
                    {
                        "name": "tld",
                        "description": "TLD indicates which domain requirements to retrieve (without the dot prefix, e.g., 'fr' for .fr domains).",
                        "in": "path",
                        "schema": {
                            "type": "string",
                            "example": "fr"
                        },
                        "required": true
                    }
                ],
                "responses": {
                    "200": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GetRequirementResponse"
                                },
                                "examples": {
                                    "complex_requirement_set": {
                                        "summary": "Complex requirement set",
                                        "description": "Example of a complex requirement set with multiple fields, conditional logic, and nested requirements",
                                        "value": {
                                            "tldInfo": {
                                                "tld": "fr",
                                                "ccTld": true,
                                                "supportsTransferLock": true,
                                                "supportsDnssec": true,
                                                "supportsPremium": true,
                                                "expirationGracePeriod": 3,
                                                "idnLanguages": {},
                                                "allowedRegistrationYears": [
                                                    1,
                                                    2,
                                                    3,
                                                    4,
                                                    5,
                                                    6,
                                                    7,
                                                    8,
                                                    9,
                                                    10
                                                ]
                                            },
                                            "requirements": {
                                                "description": "Registration requirements for .fr domains",
                                                "fields": {
                                                    "firstName": {
                                                        "description": "First name of registrant",
                                                        "type": "string",
                                                        "required": true
                                                    },
                                                    "lastName": {
                                                        "description": "Last name of registrant",
                                                        "type": "string",
                                                        "required": true
                                                    },
                                                    "address1": {
                                                        "description": "First part of mailing address",
                                                        "type": "string",
                                                        "required": true
                                                    },
                                                    "address2": {
                                                        "description": "Second part of mailing address",
                                                        "type": "string",
                                                        "required": false
                                                    },
                                                    "companyName": {
                                                        "description": "Company name of registrant",
                                                        "type": "string",
                                                        "required": false
                                                    },
                                                    "phone": {
                                                        "description": "Phone number of registrant",
                                                        "type": "string",
                                                        "required": true
                                                    },
                                                    "fax": {
                                                        "description": "Fax number of registrant",
                                                        "type": "string",
                                                        "required": false
                                                    },
                                                    "email": {
                                                        "description": "Email address of registrant",
                                                        "type": "string",
                                                        "required": true,
                                                        "validation": "valid_email"
                                                    },
                                                    "city": {
                                                        "description": "City of registrant",
                                                        "type": "string",
                                                        "required": true
                                                    },
                                                    "state": {
                                                        "description": "State/Province of registrant",
                                                        "type": "string",
                                                        "required": true
                                                    },
                                                    "zip": {
                                                        "description": "Postal code of registrant",
                                                        "type": "string",
                                                        "required": true
                                                    },
                                                    "country": {
                                                        "description": "Country of registrant, only options in this list are allowed",
                                                        "type": "enum",
                                                        "required": true,
                                                        "options": [
                                                            {
                                                                "value": "AT",
                                                                "label": "Austria"
                                                            },
                                                            {
                                                                "value": "AX",
                                                                "label": "Åland Islands"
                                                            },
                                                            {
                                                                "value": "BE",
                                                                "label": "Belgium"
                                                            },
                                                            {
                                                                "value": "BG",
                                                                "label": "Bulgaria"
                                                            },
                                                            {
                                                                "value": "CH",
                                                                "label": "Switzerland"
                                                            },
                                                            {
                                                                "value": "CY",
                                                                "label": "Cyprus"
                                                            },
                                                            {
                                                                "value": "CZ",
                                                                "label": "Czech Republic"
                                                            },
                                                            {
                                                                "value": "DE",
                                                                "label": "Germany"
                                                            },
                                                            {
                                                                "value": "DK",
                                                                "label": "Denmark"
                                                            },
                                                            {
                                                                "value": "EE",
                                                                "label": "Estonia"
                                                            },
                                                            {
                                                                "value": "ES",
                                                                "label": "Spain"
                                                            },
                                                            {
                                                                "value": "FI",
                                                                "label": "Finland"
                                                            },
                                                            {
                                                                "value": "FR",
                                                                "label": "France"
                                                            },
                                                            {
                                                                "value": "GF",
                                                                "label": "Guiana"
                                                            },
                                                            {
                                                                "value": "GP",
                                                                "label": "Guadeloupe"
                                                            },
                                                            {
                                                                "value": "GR",
                                                                "label": "Greece"
                                                            },
                                                            {
                                                                "value": "HU",
                                                                "label": "Hungary"
                                                            },
                                                            {
                                                                "value": "IE",
                                                                "label": "Ireland"
                                                            },
                                                            {
                                                                "value": "IS",
                                                                "label": "Iceland"
                                                            },
                                                            {
                                                                "value": "IT",
                                                                "label": "Italy"
                                                            },
                                                            {
                                                                "value": "LI",
                                                                "label": "Liechtenstein"
                                                            },
                                                            {
                                                                "value": "LT",
                                                                "label": "Lithuania"
                                                            },
                                                            {
                                                                "value": "LU",
                                                                "label": "Luxembourg"
                                                            },
                                                            {
                                                                "value": "LV",
                                                                "label": "Latvia"
                                                            },
                                                            {
                                                                "value": "MQ",
                                                                "label": "Martinique"
                                                            },
                                                            {
                                                                "value": "MT",
                                                                "label": "Malta"
                                                            },
                                                            {
                                                                "value": "NC",
                                                                "label": "New Caledonia"
                                                            },
                                                            {
                                                                "value": "NL",
                                                                "label": "Netherlands"
                                                            },
                                                            {
                                                                "value": "NO",
                                                                "label": "Norway"
                                                            },
                                                            {
                                                                "value": "PF",
                                                                "label": "Polynesia (French)"
                                                            },
                                                            {
                                                                "value": "PL",
                                                                "label": "Poland"
                                                            },
                                                            {
                                                                "value": "PM",
                                                                "label": "St. Pierre & Miquelon"
                                                            },
                                                            {
                                                                "value": "PT",
                                                                "label": "Portugal"
                                                            },
                                                            {
                                                                "value": "RE",
                                                                "label": "Reunion"
                                                            },
                                                            {
                                                                "value": "RO",
                                                                "label": "Romania"
                                                            },
                                                            {
                                                                "value": "SE",
                                                                "label": "Sweden"
                                                            },
                                                            {
                                                                "value": "SI",
                                                                "label": "Slovenia"
                                                            },
                                                            {
                                                                "value": "SK",
                                                                "label": "Slovakia"
                                                            },
                                                            {
                                                                "value": "TF",
                                                                "label": "French Southern and Antarctic Lands"
                                                            },
                                                            {
                                                                "value": "WF",
                                                                "label": "Wallis & Futuna Is."
                                                            },
                                                            {
                                                                "value": "YT",
                                                                "label": "Mayotte"
                                                            }
                                                        ]
                                                    },
                                                    "business": {
                                                        "description": "",
                                                        "type": "enum",
                                                        "required": true,
                                                        "label": "business",
                                                        "options": [
                                                            {
                                                                "value": "no",
                                                                "label": "I am an individual",
                                                                "fields": {
                                                                    "X-FR-BIRTHDATE": {
                                                                        "description": "",
                                                                        "type": "string",
                                                                        "required": false,
                                                                        "label": "Date of Birth (YYYY-MM-DD)"
                                                                    },
                                                                    "X-FR-BIRTHPLACE": {
                                                                        "description": "",
                                                                        "type": "string",
                                                                        "required": true,
                                                                        "label": "Birth Country (2 Letter Code)",
                                                                        "fields": {
                                                                            "X-FR-BIRTHCITY": {
                                                                                "description": "",
                                                                                "type": "string",
                                                                                "required": false,
                                                                                "label": "Birth City",
                                                                                "required_when": "FR"
                                                                            },
                                                                            "X-FR-BIRTHPC": {
                                                                                "description": "",
                                                                                "type": "string",
                                                                                "required": false,
                                                                                "label": "Birth Postal Code",
                                                                                "required_when": "FR"
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                "value": "yes",
                                                                "label": "I am an organization",
                                                                "fields": {
                                                                    "X-FR-LOCAL": {
                                                                        "description": "Local company registration #, or tax ID",
                                                                        "type": "string",
                                                                        "required": false,
                                                                        "label": "Local company registration #, or tax ID"
                                                                    }
                                                                }
                                                            }
                                                        ]
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    "simple_acknowledgement_requirement": {
                                        "summary": "Simple acknowledgement requirement",
                                        "description": "Example of a simple requirement with just an acknowledgement field",
                                        "value": {
                                            "tldInfo": {
                                                "tld": "security",
                                                "ccTld": false,
                                                "supportsTransferLock": true,
                                                "supportsDnssec": true,
                                                "supportsPremium": true,
                                                "expirationGracePeriod": 25,
                                                "idnLanguages": {
                                                    "AR": "Arabic",
                                                    "GREK": "Greek",
                                                    "HE": "Hebrew",
                                                    "JA": "Japanese",
                                                    "KO": "Korean",
                                                    "LATN": "Latin",
                                                    "LO": "Lao",
                                                    "RU": "Russian",
                                                    "TH": "Thai",
                                                    "ZH": "Chinese"
                                                },
                                                "allowedRegistrationYears": [
                                                    1,
                                                    2,
                                                    3,
                                                    4,
                                                    5,
                                                    6,
                                                    7,
                                                    8,
                                                    9,
                                                    10
                                                ]
                                            },
                                            "requirements": {
                                                "description": "Registration requirements for .security domains",
                                                "fields": {
                                                    "acknowledgement": {
                                                        "description": ".SECURITY domains will not resolve unless they have both DNSSEC and an SSL on the domain.",
                                                        "type": "acknowledgement",
                                                        "required": false,
                                                        "label": "I understand",
                                                        "value": "accepted"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    "simple_notification_requirement": {
                                        "summary": "Simple notification requirement",
                                        "description": "Example of a simple requirement with just a notice field",
                                        "value": {
                                            "tldInfo": {
                                                "tld": "at",
                                                "ccTld": true,
                                                "supportsTransferLock": false,
                                                "supportsDnssec": true,
                                                "supportsPremium": false,
                                                "expirationGracePeriod": 3,
                                                "idnLanguages": {},
                                                "allowedRegistrationYears": [
                                                    1,
                                                    2,
                                                    3,
                                                    4,
                                                    5,
                                                    6,
                                                    7,
                                                    8,
                                                    9,
                                                    10
                                                ]
                                            },
                                            "requirements": {
                                                "description": "Registration requirements for .at domains",
                                                "fields": {
                                                    "description": {
                                                        "description": "The .AT registry has special rules regarding the expiration and deletion of .AT domains. Customers who may choose not to renew .AT domains at their expiration should take note of these requirements. If you do not intend to renew your .AT domain when it comes up for renewal, you will need to complete the official NIC.AT cancellation form at least 28 days before it's expiration date and return it directly to the .AT registry. If an official cancellation form is not received by the .AT registry 28 days prior to the domain's expiration date, name.com will be required to withdraw the registration, which will result in NIC.AT billing you directly for the subsequent registration period at the NIC.AT standard rate.",
                                                        "type": "notice",
                                                        "required": false,
                                                        "label": ""
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "description": "The complete registration requirements for the specified TLD."
                    },
                    "404": {
                        "description": "Tld not found.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/NotFound404"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    }
                },
                "summary": "Get Specific TLD Requirements",
                "tags": [
                    "Domain Info"
                ]
            }
        },
        "/core/v1/tldpricing": {
            "get": {
                "description": "Get an alphabetical pricing list of all TLDs supported by name.com. The pricing returned will be your account level price in US Dollars (USD) and is the price you pay for non-premium registrations.\n\n**Please Note:** This is general pricing for domains registered with the specified TLD. Individual domains may have different pricing based on a large number of factors.\nIf you are trying to see pricing for a specific individual domain, you will need to use the [Get Pricing For Domain API](#tag/Domains/operation/GetPricingForDomain).\n\nPlease note that if `null` is returned for any of the prices, it means that particular product is unavailable at name.com at the time of the request.\nFor example, if `registrationPrice` returns as `null` in the response, it means that name.com is not currently accepting registrations for that TLD.\n\nAny IDN TLDs will return in their unicode format.\n",
                "operationId": "TldPriceList",
                "parameters": [
                    {
                        "description": "Per Page is the number of records to return per request. Per Page defaults to 25.",
                        "in": "query",
                        "name": "perPage",
                        "schema": {
                            "format": "int32",
                            "type": "integer",
                            "default": 25
                        }
                    },
                    {
                        "description": "Page is which page to return.",
                        "in": "query",
                        "name": "page",
                        "schema": {
                            "format": "int32",
                            "type": "integer",
                            "default": 1
                        }
                    },
                    {
                        "name": "duration",
                        "description": "The number of years to get pricing for. The requested duration must be between 1 and 10 (inclusive). If the duration is not passed in the request, it will default to 1.",
                        "required": false,
                        "in": "query",
                        "schema": {
                            "type": "number",
                            "format": "int32",
                            "minimum": 1,
                            "maximum": 10,
                            "example": 1,
                            "default": 5
                        }
                    },
                    {
                        "name": "tlds",
                        "description": "A list of specific TLDs to get pricing for. Maximum of 25 TLDs can be requested at a time. When querying for IDN TLDs, due to character restrictions within a URL, they must be submitted in ASCII format. This means using \"xn--9dbq2a\" as opposed to it's unicode equivalent.",
                        "in": "query",
                        "required": false,
                        "schema": {
                            "type": "array",
                            "minItems": 1,
                            "maxItems": 25,
                            "items": {
                                "type": "string"
                            }
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "A successful response.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TldPriceListResponse"
                                }
                            }
                        }
                    },
                    "429": {
                        "description": "Rate limit has been exceeded.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/TooManyRequests429"
                                }
                            }
                        },
                        "headers": {
                            "x-ratelimit-reset": {
                                "description": "Unix timestamp for the time at which the current rate limit will reset.",
                                "schema": {
                                    "type": "number",
                                    "example": 1747668270
                                }
                            }
                        }
                    },
                    "500": {
                        "description": "Internal server error.",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/GenericError500"
                                }
                            }
                        }
                    }
                },
                "summary": "TLD Price List",
                "tags": [
                    "TLD Pricing"
                ]
            }
        }
    },
    "webhooks": {
        "domainTransferStatusChange": {
            "post": {
                "tags": [
                    "Webhook Notifications"
                ],
                "operationId": "DomainTransferStatusChangeWebhook",
                "summary": "Domain Transfer Status Change",
                "description": "Sent when you have subscribed to the event on your account, and a domain transfer is processing.",
                "requestBody": {
                    "description": "The request sent to your server.",
                    "required": true,
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/DomainTransferStatusChange"
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "The subscribed server accepted the request."
                    },
                    "4xx": {
                        "description": "The subscribed server returned an error (bad request, Unauthenticated etc)."
                    },
                    "5xx": {
                        "description": "The subscribed server experienced an error while processing the request."
                    }
                }
            }
        },
        "accountCreditBalanceChange": {
            "post": {
                "tags": [
                    "Webhook Notifications"
                ],
                "operationId": "AccountCreditBalanceChangeWebhook",
                "summary": "Webhook for credit balance changes",
                "description": "This is the payload that will be sent to the subscribed URL, when a changed to the amount of account credit for an account changes. This will trigger on both increases and decreases in account credit for the account.",
                "requestBody": {
                    "required": true,
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/AccountCreditBalanceChange"
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "The subscribed server accepted the request."
                    },
                    "4xx": {
                        "description": "The subscribed server returned an error (bad request, Unauthenticated etc)."
                    },
                    "5xx": {
                        "description": "The subscribed server experienced an error while processing the request."
                    }
                }
            }
        }
    },
    "components": {
        "securitySchemes": {
            "BasicAuth": {
                "scheme": "basic",
                "type": "http",
                "description": "Authentication for the name.com API (Core) uses HTTP Basic Authentication. Provide your username and API token (not your account password) as the credentials. For the testing environment (api.dev.name.com), append \"-test\" to your username and use your test API token found in your API Token Management page.\nNote that Two-Step Verification is not compatible with API access. Rate limits of 20 requests per second or 3000 requests per hour apply. All requests must be made over HTTPS (port 443).\nFailure to authenticate properly will result in 401 Unauthenticated or 403 Permission Denied responses with appropriate error messages."
            }
        },
        "schemas": {
            "CheckAccountBalanceResponse": {
                "properties": {
                    "balance": {
                        "description": "Balance is the current account balance in USD.",
                        "format": "double",
                        "type": "number",
                        "example": 103.35
                    }
                },
                "title": "CheckAccountBalanceResponse is the current account balance for the authenticated user",
                "type": "object",
                "required": [
                    "balance"
                ]
            },
            "Unauthorized401": {
                "type": "object",
                "required": [
                    "message"
                ],
                "properties": {
                    "message": {
                        "type": "string",
                        "description": "A human-readable message providing more details about the error",
                        "example": "Unauthorized"
                    }
                }
            },
            "TooManyRequests429": {
                "type": "object",
                "required": [
                    "message"
                ],
                "properties": {
                    "message": {
                        "type": "string",
                        "description": "A human-readable message providing more details about the error",
                        "example": "Rate Limit Exceeded"
                    }
                }
            },
            "GenericError500": {
                "type": "object",
                "required": [
                    "message"
                ],
                "properties": {
                    "message": {
                        "type": "string",
                        "description": "A human-readable message providing more details about the error.",
                        "example": "Internal Server Error"
                    },
                    "details": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Additional context or information about the error.",
                        "example": "Something went wrong."
                    }
                }
            },
            "Contact": {
                "description": "Contact contains all relevant contact data for a domain registrant.",
                "type": "object",
                "properties": {
                    "firstName": {
                        "description": "First name of the contact.",
                        "type": "string",
                        "example": "John",
                        "minLength": 1
                    },
                    "lastName": {
                        "description": "Last name of the contact.",
                        "type": "string",
                        "example": "Doe",
                        "minLength": 1
                    },
                    "companyName": {
                        "description": "Company name of the contact. Leave blank if the contact is an individual, as some registries may assume it is a corporate entity otherwise.",
                        "type": [
                            "string",
                            "null"
                        ],
                        "example": "Example Inc."
                    },
                    "address1": {
                        "description": "The first line of the contact's address.",
                        "type": "string",
                        "example": "123 Main Street",
                        "minLength": 1
                    },
                    "address2": {
                        "description": "The second line of the contact's address (optional).",
                        "type": [
                            "string",
                            "null"
                        ],
                        "example": "Suite 400"
                    },
                    "city": {
                        "description": "City of the contact's address.",
                        "type": "string",
                        "example": "New York",
                        "minLength": 1
                    },
                    "state": {
                        "description": "State or Province of the contact's address.",
                        "type": "string",
                        "example": "NY",
                        "minLength": 1
                    },
                    "zip": {
                        "description": "ZIP or Postal Code of the contact's address.",
                        "type": "string",
                        "example": "10001",
                        "minLength": 1
                    },
                    "country": {
                        "description": "Country code for the contact's address. Must be an ISO 3166-1 alpha-2 country code.",
                        "type": "string",
                        "example": "US",
                        "pattern": "^[A-Z]{2}$"
                    },
                    "email": {
                        "description": "Email address of the contact. Must be a valid email format. The validation is performed against the `addr-spec` syntax in [RFC 822](https://datatracker.ietf.org/doc/html/rfc822)",
                        "type": "string",
                        "format": "email",
                        "example": "john.doe@example.com"
                    },
                    "phone": {
                        "description": "Phone number of the contact. Should follow the E.164 international format: \"+[country code][number]\".",
                        "type": "string",
                        "pattern": "^\\+[1-9]\\d{7,14}$",
                        "example": "+15551234567"
                    },
                    "fax": {
                        "description": "Fax number of the contact. Should follow the E.164 international format: \"+[country code][number]\".",
                        "type": [
                            "string",
                            "null"
                        ],
                        "pattern": "^\\+[1-9]\\d{7,14}$",
                        "example": "+15557654321"
                    }
                },
                "required": [
                    "firstName",
                    "lastName",
                    "address1",
                    "city",
                    "state",
                    "zip",
                    "country",
                    "email",
                    "phone"
                ]
            },
            "Contacts": {
                "description": "Contacts stores the contact information for the roles related to domains.",
                "properties": {
                    "admin": {
                        "$ref": "#/components/schemas/Contact"
                    },
                    "billing": {
                        "$ref": "#/components/schemas/Contact"
                    },
                    "registrant": {
                        "$ref": "#/components/schemas/Contact"
                    },
                    "tech": {
                        "$ref": "#/components/schemas/Contact"
                    }
                },
                "type": "object"
            },
            "Account": {
                "description": "Account lists all the data for an account.",
                "type": "object",
                "properties": {
                    "accountId": {
                        "description": "AccountId is the unique id of account.",
                        "format": "int32",
                        "type": "integer",
                        "example": 12345
                    },
                    "accountName": {
                        "description": "AccountName is the unique name of the account.  Minimum length is 6 characters, maximum length is 60.",
                        "type": "string",
                        "minLength": 6,
                        "maxLength": 60,
                        "example": "namecom_reseller"
                    },
                    "autoRenew": {
                        "title": "AutoRenew reflects account setting auto renew",
                        "description": "When set to true, domains in this account will be automatically renewed before expiration.",
                        "type": "boolean",
                        "default": true
                    },
                    "contacts": {
                        "$ref": "#/components/schemas/Contacts",
                        "description": "Contact information associated with this account."
                    },
                    "createDate": {
                        "description": "CreateDate is the date the account was created.",
                        "type": "string",
                        "format": "date-time",
                        "example": "2023-04-01T12:00:00Z"
                    },
                    "password": {
                        "description": "Password has minimum length of 7 characters. It must contain at least 1 letter and at least 1 number/symbol.",
                        "type": "string",
                        "format": "password",
                        "minLength": 7
                    }
                }
            },
            "CreateAccountRequest": {
                "description": "CreateAccountRequest has the information that is needed to create an account with the CreateAccount function.",
                "type": "object",
                "required": [
                    "account",
                    "apiTos",
                    "tos"
                ],
                "properties": {
                    "account": {
                        "$ref": "#/components/schemas/Account",
                        "description": "The account details for the new account being created."
                    },
                    "apiTos": {
                        "title": "ApiTos indicates accepted API Terms of Service agreement",
                        "description": "Must be set to true to indicate acceptance of the API Terms of Service.",
                        "type": "boolean",
                        "example": true
                    },
                    "tos": {
                        "title": "Tos indicates accepted Terms of Service agreement",
                        "description": "Must be set to true to indicate acceptance of the general Terms of Service.",
                        "type": "boolean",
                        "example": true
                    }
                },
                "example": {
                    "account": {
                        "accountName": "reseller_subaccount",
                        "password": "SecureP4ss!",
                        "contacts": {
                            "registrant": {
                                "firstName": "Jane",
                                "lastName": "Doe",
                                "address1": "123 Main St.",
                                "city": "Denver",
                                "state": "CO",
                                "zip": "12345",
                                "country": "US",
                                "phone": "+13035551212",
                                "email": "admin@example.net"
                            }
                        }
                    },
                    "apiTos": true,
                    "tos": true
                }
            },
            "CreateAccountResponse": {
                "description": "CreateAccountResponse contains information about the newly created account and the API credentials generated for it.",
                "type": "object",
                "required": [
                    "accountName",
                    "apiToken",
                    "apiTokenName"
                ],
                "properties": {
                    "accountName": {
                        "description": "AccountName is the unique user-assigned name of newly created account.",
                        "type": "string",
                        "example": "new_reseller_account"
                    },
                    "apiToken": {
                        "title": "ApiToken secret hash to make api requests",
                        "description": "The authentication token that should be used to access the API. This value is only returned once upon account creation.",
                        "type": "string",
                        "format": "password",
                        "example": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
                    },
                    "apiTokenName": {
                        "description": "ApiTokenName user assigned name of api token.",
                        "type": "string",
                        "example": "my_reseller_token"
                    }
                },
                "example": {
                    "accountName": "new_reseller_account",
                    "apiToken": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
                    "apiTokenName": "my_reseller_token"
                }
            },
            "InvalidArgument400": {
                "type": "object",
                "required": [
                    "message"
                ],
                "properties": {
                    "message": {
                        "type": "string",
                        "description": "A human-readable message providing more details about the error",
                        "example": "Bad Request"
                    },
                    "details": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Additional context or information about the error",
                        "example": "'domainName' cannot be null"
                    }
                }
            },
            "GenericForbidden403": {
                "type": "object",
                "required": [
                    "message"
                ],
                "properties": {
                    "message": {
                        "type": "string",
                        "description": "A human-readable message providing more details about the error",
                        "example": "Permission denied"
                    },
                    "details": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Additional context or information about the error",
                        "example": "Failed authentication"
                    }
                }
            },
            "UnsupportedMedia415": {
                "type": "object",
                "required": [
                    "message"
                ],
                "properties": {
                    "message": {
                        "type": "string",
                        "description": "A human-readable message providing more details about the error",
                        "example": "The 'Content-Type' header must be 'application/json' for this request."
                    }
                }
            },
            "Domain": {
                "description": "Domain contains all relevant data for a domain.",
                "type": "object",
                "properties": {
                    "domainName": {
                        "description": "The punycode-encoded value of the domain name.",
                        "type": "string",
                        "example": "example.com"
                    },
                    "createDate": {
                        "description": "The date and time when the domain was created at the registry.",
                        "type": "string",
                        "format": "date-time",
                        "example": "2023-01-15T14:30:00Z",
                        "readOnly": true
                    },
                    "expireDate": {
                        "description": "The date and time when the domain will expire.",
                        "type": "string",
                        "format": "date-time",
                        "example": "2025-01-15T14:30:00Z",
                        "readOnly": true
                    },
                    "autorenewEnabled": {
                        "description": "Indicates whether the domain is set to renew automatically before expiration.",
                        "type": "boolean",
                        "example": true
                    },
                    "locked": {
                        "description": "Indicates if the domain is locked, preventing transfers to another registrar.",
                        "type": "boolean",
                        "example": true
                    },
                    "privacyEnabled": {
                        "description": "Indicates if Whois Privacy is enabled for this domain.",
                        "type": "boolean",
                        "example": true
                    },
                    "contacts": {
                        "$ref": "#/components/schemas/Contacts"
                    },
                    "nameservers": {
                        "description": "The list of nameservers assigned to this domain. If unspecified, it defaults to the account's default nameservers.",
                        "type": "array",
                        "items": {
                            "type": "string"
                        },
                        "example": [
                            "ns1.example.com",
                            "ns2.example.com"
                        ]
                    },
                    "renewalPrice": {
                        "description": "The cost to renew the domain. This may be required for the RenewDomain operation.",
                        "type": "number",
                        "format": "double",
                        "example": 12.99,
                        "readOnly": true
                    }
                }
            },
            "DomainResponsePayload": {
                "description": "The response format for a domain.",
                "allOf": [
                    {
                        "$ref": "#/components/schemas/Domain"
                    },
                    {
                        "type": "object",
                        "required": [
                            "domainName",
                            "createDate",
                            "expireDate",
                            "autorenewEnabled",
                            "locked",
                            "privacyEnabled",
                            "contacts",
                            "nameservers",
                            "renewalPrice"
                        ]
                    }
                ]
            },
            "ListDomainsResponse": {
                "description": "ListDomainsResponse is the response from a list request, it contains the paginated list of Domains.",
                "properties": {
                    "domains": {
                        "description": "Domains is the list of domains in your account.",
                        "items": {
                            "$ref": "#/components/schemas/DomainResponsePayload"
                        },
                        "type": "array"
                    },
                    "from": {
                        "description": "From is starting record count for current page.",
                        "format": "int32",
                        "type": "integer"
                    },
                    "lastPage": {
                        "description": "LastPage is the identifier for the final page of results. It is only populated if there is another page of results after the current page.",
                        "format": "int32",
                        "type": "integer"
                    },
                    "nextPage": {
                        "description": "NextPage is the identifier for the next page of results. It is only populated if there is another page of results after the current page.",
                        "format": "int32",
                        "type": "integer"
                    },
                    "to": {
                        "description": "To is ending record count for current page.",
                        "format": "int32",
                        "type": "integer"
                    },
                    "totalCount": {
                        "description": "TotalCount is total number of domains returned for request.",
                        "format": "int32",
                        "type": "integer"
                    }
                },
                "type": "object",
                "required": [
                    "to",
                    "from",
                    "totalCount",
                    "domains"
                ]
            },
            "DomainCreatePayload": {
                "description": "The payload to be sent for when making a request to purchase a domain.",
                "allOf": [
                    {
                        "$ref": "#/components/schemas/Domain"
                    },
                    {
                        "type": "object",
                        "required": [
                            "domainName"
                        ]
                    }
                ]
            },
            "CreateDomainRequest": {
                "description": "CreateDomainRequest has the information that is needed to create a domain with the CreateDomain function.",
                "properties": {
                    "domain": {
                        "$ref": "#/components/schemas/DomainCreatePayload"
                    },
                    "purchasePrice": {
                        "description": "PurchasePrice is the price in USD for purchasing this domain for the minimum time period (typically 1 year). PurchasePrice is required if purchaseType is not \"registration\" or if it is a premium domain. If privacyEnabled is set, the regular price for Whois Privacy protection will be added automatically. If VAT tax applies, it will also be added automatically.",
                        "format": "double",
                        "type": "number"
                    },
                    "purchaseType": {
                        "description": "PurchaseType defaults to \"registration\" but should be copied from the result of either a [Search](#operation/Search) or [checkAvailability](#operation/CheckAvailability) request.",
                        "type": "string"
                    },
                    "tldRequirements": {
                        "additionalProperties": {
                            "type": "string"
                        },
                        "description": "TLDRequirements is a way to pass additional data that is required by some registries.",
                        "type": "object"
                    },
                    "years": {
                        "description": "Years specifies how many years to register the domain for. Years defaults to the minimum time period (typically 1 year) if not passed and cannot be more than 10. Some TLDs default to longer initial periods (e.g. .AI requires a 2 year registration).\nIf passing purchasePrice make sure to adjust it accordingly.",
                        "format": "int32",
                        "type": "integer",
                        "example": 1
                    }
                },
                "type": "object",
                "required": [
                    "domain"
                ]
            },
            "CreateDomainResponse": {
                "description": "CreateDomainResponse contains the domain info as well as the order info for the created domain.",
                "properties": {
                    "domain": {
                        "$ref": "#/components/schemas/DomainResponsePayload"
                    },
                    "order": {
                        "description": "Order is an identifier for this purchase.",
                        "format": "int32",
                        "type": "integer"
                    },
                    "totalPaid": {
                        "description": "TotalPaid is the total amount paid, including VAT and Whois privacy protection.",
                        "format": "double",
                        "type": "number"
                    }
                },
                "type": "object",
                "required": [
                    "order",
                    "totalPaid",
                    "domain"
                ]
            },
            "PaymentRequired402": {
                "type": "object",
                "required": [
                    "message"
                ],
                "properties": {
                    "message": {
                        "type": "string",
                        "description": "A human-readable message providing more details about the error",
                        "example": "Payment failed"
                    },
                    "details": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Additional context or information about the error",
                        "example": "Insufficient Funds"
                    }
                }
            },
            "NotFound404": {
                "type": "object",
                "required": [
                    "message"
                ],
                "properties": {
                    "message": {
                        "type": "string",
                        "description": "A human-readable message providing more details about the error",
                        "example": "Not Found"
                    },
                    "details": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Additional context or information about the error",
                        "example": "The requested domain does not exist."
                    }
                }
            },
            "GenericError501": {
                "type": "object",
                "required": [
                    "message"
                ],
                "properties": {
                    "message": {
                        "type": "string",
                        "description": "A human-readable message providing more details about the error",
                        "example": "Unimplemented"
                    },
                    "details": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Additional context or information about the error",
                        "example": "Requested feature is not yet implemented"
                    }
                }
            },
            "GenericConflict409": {
                "type": "object",
                "description": "A conflict error response.",
                "required": [
                    "message"
                ],
                "properties": {
                    "message": {
                        "type": "string",
                        "description": "A human-readable error message describing the conflict",
                        "example": "Object already exists."
                    },
                    "details": {
                        "type": [
                            "string",
                            "null"
                        ],
                        "description": "Additional context or information about the error",
                        "example": "Cannot create multiple objects under same key."
                    }
                }
            },
            "DNSSEC": {
                "description": "DNSSEC contains all the data required to create a DS record at the registry.",
                "properties": {
                    "algorithm": {
                        "format": "int32",
                        "title": "Algorithm is an integer identifying the algorithm used for signing. Valid values can be found here: https://www.iana.org/assignments/dns-sec-alg-numbers/dns-sec-alg-numbers.xhtml",
                        "type": "integer"
                    },
                    "digest": {
                        "description": "Digest is a digest of the DNSKEY RR that is registered with the registry.",
                        "type": "string",
                        "minLength": 1
                    },
                    "digestType": {
                        "format": "int32",
                        "title": "DigestType is an integer identifying the algorithm used to create the digest. Valid values can be found here: https://www.iana.org/assignments/ds-rr-types/ds-rr-types.xhtml",
                        "type": "integer"
                    },
                    "domainName": {
                        "description": "DomainName is the domain name.",
                        "type": "string",
                        "minLength": 1
                    },
                    "keyTag": {
                        "format": "int32",
                        "title": "KeyTag contains the key tag value of the DNSKEY RR that validates this signature. The algorithm to generate it is here: https://tools.ietf.org/html/rfc4034#appendix-B",
                        "type": "integer"
                    }
                },
                "type": "object",
                "required": [
                    "domainName",
                    "keyTag",
                    "digest",
                    "digestType",
                    "algorithm"
                ]
            },
            "ListDNSSECsResponse": {
                "description": "ListDNSSECsResponse contains the list of DS records at the registry.",
                "properties": {
                    "dnssec": {
                        "description": "Dnssec is the list of registered DNSSEC keys.",
                        "items": {
                            "$ref": "#/components/schemas/DNSSEC"
                        },
                        "type": "array"
                    }
                },
                "type": "object",
                "required": [
                    "dnssec"
                ]
            },
            "CreateDNSSECBody": {
                "description": "DNSSEC contains all the data required to create a DS record at the registry.",
                "properties": {
                    "algorithm": {
                        "format": "int32",
                        "title": "Algorithm is an integer identifying the algorithm used for signing. Valid values can be found here: https://www.iana.org/assignments/dns-sec-alg-numbers/dns-sec-alg-numbers.xhtml",
                        "type": "integer"
                    },
                    "digest": {
                        "description": "Digest is a digest of the DNSKEY RR that is registered with the registry.",
                        "type": "string"
                    },
                    "domainName": {
                        "description": "The name of the domain.",
                        "type": "string"
                    },
                    "digestType": {
                        "format": "int32",
                        "title": "DigestType is an integer identifying the algorithm used to create the digest. Valid values can be found here: https://www.iana.org/assignments/ds-rr-types/ds-rr-types.xhtml",
                        "type": "integer"
                    },
                    "keyTag": {
                        "format": "int32",
                        "title": "KeyTag contains the key tag value of the DNSKEY RR that validates this signature. The algorithm to generate it is here: https://tools.ietf.org/html/rfc4034#appendix-B",
                        "type": "integer"
                    }
                },
                "type": "object"
            },
            "EmailForwarding": {
                "description": "EmailForwarding contains all the information for an email forwarding entry.",
                "properties": {
                    "domainName": {
                        "description": "DomainName is the domain part of the email address to forward.",
                        "type": "string",
                        "example": "example.com",
                        "minLength": 1
                    },
                    "emailBox": {
                        "description": "EmailBox is the user portion of the email address to forward.",
                        "type": "string",
                        "example": "admin",
                        "minLength": 1
                    },
                    "emailTo": {
                        "description": "EmailTo is the entire email address to forward email to.",
                        "type": "string",
                        "example": "webmaster@example.com",
                        "format": "email"
                    }
                },
                "type": "object",
                "required": [
                    "domainName",
                    "emailBox",
                    "emailTo"
                ]
            },
            "ListEmailForwardingsResponse": {
                "description": "ListEmailForwardingsResponse returns the list of email forwarding entries as well as the pagination information.",
                "properties": {
                    "emailForwarding": {
                        "description": "EmailForwarding is the list of forwarded email boxes.",
                        "items": {
                            "$ref": "#/components/schemas/EmailForwarding"
                        },
                        "type": "array"
                    },
                    "lastPage": {
                        "description": "LastPage is the identifier for the final page of results. It is only populated if there is another page of results after the current page.",
                        "format": "int32",
                        "type": "integer"
                    },
                    "nextPage": {
                        "description": "NextPage is the identifier for the next page of results. It is only populated if there is another page of results after the current page.",
                        "format": "int32",
                        "type": "integer"
                    }
                },
                "type": "object",
                "required": [
                    "emailForwarding"
                ]
            },
            "CreateEmailForwardingRequest": {
                "description": "EmailForwarding contains all the information for an email forwarding entry.",
                "properties": {
                    "emailBox": {
                        "description": "EmailBox is the user portion of the email address to forward. If your email is \"admin@example.com\", it would just be \"admin\"",
                        "type": "string",
                        "example": "admin",
                        "minLength": 1
                    },
                    "emailTo": {
                        "description": "EmailTo is the entire email address to forward email to.",
                        "type": "string",
                        "format": "email",
                        "example": "webmaster@example.com",
                        "minLength": 1
                    }
                },
                "type": "object",
                "required": [
                    "emailBox",
                    "emailTo"
                ]
            },
            "EmailForwardingsUpdateEmailForwardingBody": {
                "description": "EmailForwarding contains all the information for an email forwarding entry.",
                "properties": {
                    "emailTo": {
                        "description": "EmailTo is the entire email address to forward email to.",
                        "type": "string"
                    }
                },
                "type": "object"
            },
            "Record": {
                "description": "Record is an individual DNS resource record.",
                "type": "object",
                "properties": {
                    "answer": {
                        "description": "Answer is either the IP address for A or AAAA records; the target for ANAME, CNAME, MX, or NS records; the text for TXT records.\nFor SRV records, answer has the following format: \"{weight} {port} {target}\" e.g. \"1 5061 sip.example.org\".",
                        "type": "string"
                    },
                    "domainName": {
                        "description": "DomainName is the zone that the record belongs to.",
                        "type": "string"
                    },
                    "fqdn": {
                        "description": "FQDN is the Fully Qualified Domain Name. It is the combination of the host and the domain name. It always ends in a \".\". FQDN is ignored in CreateRecord, specify via the Host field instead.",
                        "type": "string",
                        "readOnly": true
                    },
                    "host": {
                        "description": "Host is the hostname relative to the zone: e.g. for a record for blog.example.org, domain would be \"example.org\" and host would be \"blog\".\nAn apex record would be specified by either an empty host \"\" or \"@\".\nA SRV record would be specified by \"_{service}._{protocol}.{host}\": e.g. \"_sip._tcp.phone\" for _sip._tcp.phone.example.org.",
                        "type": [
                            "string",
                            "null"
                        ]
                    },
                    "id": {
                        "description": "Unique record id. Value is ignored on Create, and must match the URI on Update.",
                        "format": "int32",
                        "type": "integer",
                        "readOnly": true
                    },
                    "priority": {
                        "description": "Priority is only required for MX and SRV records, it is ignored for all others.",
                        "format": "int64",
                        "type": "integer"
                    },
                    "ttl": {
                        "description": "TTL is the time this record can be cached for in seconds. name.com allows a minimum TTL of 300, or 5 minutes.",
                        "format": "int64",
                        "type": "integer"
                    },
                    "type": {
                        "description": "Type is one of the following: A, AAAA, ANAME, CNAME, MX, NS, SRV, or TXT.",
                        "type": [
                            "string",
                            "null"
                        ]
                    }
                },
                "required": [
                    "type",
                    "ttl"
                ]
            },
            "ListRecordsResponse": {
                "description": "ListRecordsResponse is the response for the ListRecords function.",
                "properties": {
                    "lastPage": {
                        "description": "LastPage is the identifier for the final page of results. It is only populated if there is another page of results after the current page.",
                        "format": "int32",
                        "type": "integer"
                    },
                    "nextPage": {
                        "description": "NextPage is the identifier for the next page of results. It is only populated if there is another page of results after the current page.",
                        "format": "int32",
                        "type": "integer"
                    },
                    "totalCount": {
                        "description": "TotalCount is total number of results.",
                        "format": "int32",
                        "type": "integer"
                    },
                    "from": {
                        "description": "From specifies starting record number on current page.",
                        "format": "int32",
                        "type": "integer"
                    },
                    "to": {
                        "description": "To specifies ending record number on current page.",
                        "format": "int32",
                        "type": "integer"
                    },
                    "records": {
                        "items": {
                            "$ref": "#/components/schemas/Record"
                        },
                        "title": "Records contains the records in the zone",
                        "type": "array"
                    }
                },
                "type": "object",
                "required": [
                    "records",
                    "to",
                    "from",
                    "totalCount"
                ]
            },
            "DNSCreateRecordBody": {
                "description": "Record is an individual DNS resource record.",
                "type": "object",
                "properties": {
                    "answer": {
                        "description": "Answer is either the IP address for A or AAAA records; the target for ANAME, CNAME, MX, or NS records; the text for TXT records.\nFor SRV records, answer has the following format: \"{weight} {port} {target}\" e.g. \"1 5061 sip.example.org\".",
                        "type": "string",
                        "minLength": 1
                    },
                    "fqdn": {
                        "description": "FQDN is the Fully Qualified Domain Name. It is the combination of the host and the domain name. It always ends in a \".\". FQDN is ignored in CreateRecord, specify via the Host field instead.",
                        "type": "string"
                    },
                    "host": {
                        "description": "Host is the hostname relative to the zone: e.g. for a record for blog.example.org, domain would be \"example.org\" and host would be \"blog\".\nAn apex record would be specified by either an empty host \"\" or \"@\".\nA SRV record would be specified by \"_{service}._{protocol}.{host}\": e.g. \"_sip._tcp.phone\" for _sip._tcp.phone.example.org.",
                        "type": "string"
                    },
                    "id": {
                        "description": "Unique record id. Value is ignored on Create, and must match the URI on Update.",
                        "format": "int32",
                        "type": "integer"
                    },
                    "priority": {
                        "description": "Priority is only required for MX and SRV records, it is ignored for all others.",
                        "format": "int64",
                        "type": "integer"
                    },
                    "ttl": {
                        "description": "TTL is the time this record can be cached for in seconds. name.com allows a minimum TTL of 300, or 5 minutes.",
                        "format": "int64",
                        "type": "integer"
                    },
                    "type": {
                        "description": "Type is one of the following: A, AAAA, ANAME, CNAME, MX, NS, SRV, or TXT.",
                        "type": "string",
                        "enum": [
                            "A",
                            "AAAA",
                            "ANAME",
                            "CNAME",
                            "MX",
                            "NS",
                            "SRV",
                            "TXT"
                        ]
                    }
                },
                "required": [
                    "type",
                    "host",
                    "answer"
                ]
            },
            "DNSUpdateRecordBody": {
                "description": "Record is an individual DNS resource record.",
                "type": "object",
                "properties": {
                    "answer": {
                        "description": "Answer is either the IP address for A or AAAA records; the target for ANAME, CNAME, MX, or NS records; the text for TXT records.\nFor SRV records, answer has the following format: \"{weight} {port} {target}\" e.g. \"1 5061 sip.example.org\".",
                        "type": "string",
                        "minLength": 1
                    },
                    "fqdn": {
                        "description": "FQDN is the Fully Qualified Domain Name. It is the combination of the host and the domain name. It always ends in a \".\". FQDN is ignored in CreateRecord, specify via the Host field instead.",
                        "type": "string"
                    },
                    "host": {
                        "description": "Host is the hostname relative to the zone: e.g. for a record for blog.example.org, domain would be \"example.org\" and host would be \"blog\".\nAn apex record would be specified by either an empty host \"\" or \"@\".\nA SRV record would be specified by \"_{service}._{protocol}.{host}\": e.g. \"_sip._tcp.phone\" for _sip._tcp.phone.example.org.",
                        "type": "string"
                    },
                    "priority": {
                        "description": "Priority is only required for MX and SRV records, it is ignored for all others.",
                        "format": "int64",
                        "type": "integer"
                    },
                    "ttl": {
                        "description": "TTL is the time this record can be cached for in seconds. name.com allows a minimum TTL of 300, or 5 minutes.",
                        "format": "int64",
                        "type": "integer"
                    },
                    "type": {
                        "description": "Type is one of the following: A, AAAA, ANAME, CNAME, MX, NS, SRV, or TXT.",
                        "type": "string",
                        "enum": [
                            "A",
                            "AAAA",
                            "ANAME",
                            "CNAME",
                            "MX",
                            "NS",
                            "SRV",
                            "TXT"
                        ]
                    }
                },
                "required": [
                    "type",
                    "answer"
                ]
            },
            "URLForwarding": {
                "description": "URLForwarding represents a URL forwarding entry, allowing a domain to redirect to another URL using different forwarding methods.",
                "type": "object",
                "required": [
                    "host",
                    "forwardsTo",
                    "type"
                ],
                "properties": {
                    "domainName": {
                        "description": "The domain name (without subdomains) that is being forwarded.",
                        "type": "string",
                        "format": "hostname",
                        "example": "example.org"
                    },
                    "forwardsTo": {
                        "description": "The destination URL to which this hostname will be forwarded.",
                        "type": "string",
                        "format": "uri",
                        "example": "https://destination-site.com"
                    },
                    "host": {
                        "title": "The subdomain portion of the hostname",
                        "description": "The subdomain portion of the hostname that is being forwarded.",
                        "type": "string",
                        "example": "www"
                    },
                    "meta": {
                        "description": "Meta tags to include in the HTML page when using \"masked\" forwarding.\nIgnored for other forwarding types.\nExample: `<meta name='keywords' content='fish, denver, platte'>`\n",
                        "type": [
                            "string",
                            "null"
                        ],
                        "example": "<meta name='keywords' content='website, forwarding, masked'>"
                    },
                    "title": {
                        "description": "The title to be used for the HTML page when using \"masked\" forwarding.\nIgnored for other forwarding types.\n",
                        "type": [
                            "string",
                            "null"
                        ],
                        "example": "Welcome to my forwarded website"
                    },
                    "type": {
                        "description": "The type of URL forwarding. Valid values:\n  - `masked`: Retains the original domain in the address bar, preventing the user from seeing the actual destination URL. Sometimes called iframe forwarding.\n  - `redirect`: Uses a standard HTTP redirect (301), which changes the address bar to the destination URL.\n  - `302`: Uses a temporary HTTP redirect (302), which changes the address bar to the destination URL but indicates the resource is temporarily located elsewhere.\n",
                        "type": "string",
                        "enum": [
                            "masked",
                            "redirect",
                            "302"
                        ],
                        "example": "redirect"
                    }
                }
            },
            "URLForwardingResponse": {
                "description": "URLForwarding represents a URL forwarding entry response, allowing a domain to redirect to another URL using different forwarding methods.",
                "allOf": [
                    {
                        "$ref": "#/components/schemas/URLForwarding"
                    },
                    {
                        "type": "object",
                        "properties": {
                            "host": {
                                "title": "The full hostname",
                                "description": "The complete hostname that is being forwarded (subdomain + domain).",
                                "type": "string",
                                "format": "hostname",
                                "example": "www.example.org"
                            }
                        }
                    }
                ]
            },
            "ListURLForwardingsResponse": {
                "description": "ListURLForwardingsResponse is the response for the ListURLForwardings function.",
                "type": "object",
                "properties": {
                    "lastPage": {
                        "description": "LastPage is the identifier for the final page of results. It is only populated if there is another page of results after the current page.",
                        "format": "int32",
                        "type": [
                            "integer",
                            "null"
                        ],
                        "example": 5,
                        "minimum": 0
                    },
                    "nextPage": {
                        "description": "NextPage is the identifier for the next page of results. It is only populated if there is another page of results after the current page.",
                        "format": "int32",
                        "type": [
                            "integer",
                            "null"
                        ],
                        "example": 2,
                        "minimum": 0
                    },
                    "urlForwarding": {
                        "description": "URLForwarding is the list of URL forwarding entries.",
                        "items": {
                            "$ref": "#/components/schemas/URLForwardingResponse"
                        },
                        "type": "array",
                        "example": [],
                        "minItems": 0
                    }
                },
                "required": [
                    "urlForwarding"
                ]
            },
            "CreateURLForwardingBody": {
                "description": "The request body for creating a new URL forwarding entry.",
                "type": "object",
                "allOf": [
                    {
                        "$ref": "#/components/schemas/URLForwarding"
                    }
                ]
            },
            "UpdateURLForwardingBody": {
                "description": "The request body for updating an existing URL forwarding entry.",
                "allOf": [
                    {
                        "$ref": "#/components/schemas/URLForwarding"
                    },
                    {
                        "type": "object",
                        "properties": {
                            "host": {
                                "readOnly": true
                            },
                            "domainName": {
                                "readOnly": true
                            }
                        }
                    }
                ]
            },
            "VanityNameserver": {
                "description": "VanityNameserver represents a custom nameserver associated with a domain, including its hostname and a list of IP addresses for glue records.",
                "properties": {
                    "domainName": {
                        "description": "DomainName is the root domain for which this vanity nameserver is created. For example, if the hostname is 'ns1.example.com', the domainName would be 'example.com'.",
                        "type": "string",
                        "format": "hostname",
                        "example": "example.com"
                    },
                    "hostname": {
                        "description": "Hostname is the fully qualified domain name (FQDN) of the vanity nameserver. It must be a subdomain of the domain specified in 'domainName'.",
                        "type": "string",
                        "format": "hostname",
                        "example": "ns1.example.com"
                    },
                    "ips": {
                        "description": "IPs is a list of IP addresses that are used for glue records for this vanity nameserver. These should be valid IPv4 or IPv6 addresses.",
                        "type": "array",
                        "items": {
                            "type": "string",
                            "format": "ip"
                        },
                        "example": [
                            "192.168.1.1",
                            "2001:0db8:85a3:0000:0000:8a2e:0370:7334"
                        ],
                        "minItems": 1
                    }
                },
                "type": "object",
                "required": [
                    "domainName",
                    "hostname",
                    "ips"
                ]
            },
            "VanityNameserverResponse": {
                "description": "VanityNameserver response schema with full hostname",
                "allOf": [
                    {
                        "$ref": "#/components/schemas/VanityNameserver"
                    },
                    {
                        "type": "object",
                        "properties": {
                            "hostname": {
                                "description": "Hostname is the fully qualified domain name (FQDN) of the vanity nameserver. It must be a subdomain of the domain specified in 'domainName'.",
                                "type": "string",
                                "format": "hostname",
                                "example": "ns1.example.com"
                            }
                        }
                    }
                ]
            },
            "ListVanityNameserversResponse": {
                "description": "ListVanityNameserversResponse returns the list of vanity nameservers for the domain.",
                "properties": {
                    "lastPage": {
                        "description": "LastPage is the identifier for the final page of results. It is only populated if there is another page of results after the current page. If no further pages exist, this field will be null.",
                        "type": [
                            "integer",
                            "null"
                        ],
                        "format": "int32",
                        "minimum": 1,
                        "example": 5
                    },
                    "nextPage": {
                        "description": "NextPage is the identifier for the next page of results. It is only populated if there is another page of results after the current page. If no further pages exist, this field will be null.",
                        "type": [
                            "integer",
                            "null"
                        ],
                        "format": "int32",
                        "minimum": 1,
                        "example": 2
                    },
                    "vanityNameservers": {
                        "description": "VanityNameservers is the list of vanity nameservers associated with the domain. If no vanity nameservers are configured, this will be an empty array.",
                        "type": "array",
                        "items": {
                            "$ref": "#/components/schemas/VanityNameserverResponse"
                        },
                        "example": []
                    }
                },
                "type": "object",
                "required": [
                    "vanityNameservers"
                ]
            },
            "CreateVanityNameserverBody": {
                "description": "VanityNameserver contains the hostname as well as the list of IP addresses for nameservers.",
                "properties": {
                    "hostname": {
                        "description": "The subdomain portion of the nameserver hostname. The domain portion will be  taken from the URL path. For example, to create 'ns1.example.com', specify 'ns1'  when calling the endpoint for the domain 'example.com'.",
                        "type": "string",
                        "example": "ns1"
                    },
                    "ips": {
                        "description": "IPs is a list of IP addresses that are used for glue records for this nameserver. These should be valid IPv4 or IPv6 addresses.",
                        "type": "array",
                        "items": {
                            "type": "string",
                            "format": "ip"
                        },
                        "example": [
                            "192.168.1.10",
                            "2001:0db8:85a3:0000:0000:8a2e:0370:7334"
                        ],
                        "minItems": 1
                    }
                },
                "type": "object",
                "required": [
                    "hostname",
                    "ips"
                ]
            },
            "UpdateVanityNameserverBody": {
                "description": "UpdateVanityNameserverBody contains the list of IP addresses to update for a vanity nameserver.",
                "properties": {
                    "ips": {
                        "description": "IPs is the updated list of IP addresses to be used for glue records for this vanity nameserver. Providing an empty array will remove all existing IPs.",
                        "type": "array",
                        "items": {
                            "type": "string",
                            "format": "ip"
                        },
                        "example": [
                            "192.168.1.10",
                            "2001:0db8:85a3:0000:0000:8a2e:0370:7334"
                        ],
                        "minItems": 0
                    }
                },
                "type": "object"
            },
            "AuthCodeResponse": {
                "description": "AuthCodeResponse returns the auth code from the GetAuthCodeForDomain funtion.",
                "properties": {
                    "authCode": {
                        "description": "AuthCode is the authorization code needed to transfer a domain to another registrar. If you are storing auth codes, be sure to store them in a secure manner.",
                        "type": "string"
                    }
                },
                "type": "object",
                "required": [
                    "authCode"
                ]
            },
            "PricingResponse": {
                "description": "PricingResponse returns the Pricing related information from the GetPricingForDomain function.",
                "properties": {
                    "premium": {
                        "description": "Premium indicates that this pricing is a premium result and the respective prices must be passed in create, renew or transfer commands.",
                        "type": "boolean"
                    },
                    "purchasePrice": {
                        "description": "PurchasePrice is the price you will pay to register a domain. Can be passed in the CreateDomain request.",
                        "format": "double",
                        "type": "number",
                        "example": 24.99
                    },
                    "renewalPrice": {
                        "description": "RenewalPrice is the price you will pay to renew a domain. Can be passed in the RenewDomain request.",
                        "format": "double",
                        "type": "number",
                        "example": 24.99
                    },
                    "transferPrice": {
                        "description": "TransferPrice is the price you will pay to transfer a domain. Can be passed in the CreateTransfer request. The TransferPrice is always for 1 year regardless of the years input.",
                        "format": "double",
                        "type": "number",
                        "example": 24.99
                    }
                },
                "type": "object",
                "required": [
                    "premium",
                    "purchasePrice",
                    "transferPrice",
                    "renewalPrice"
                ]
            },
            "DomainsPurchasePrivacyBody": {
                "description": "PrivacyRequest passes the domain name as well as the purchase parameters to the PurchasePrivacy function.",
                "properties": {
                    "purchasePrice": {
                        "description": "PurchasePrice is the (prorated) amount you expect to pay.",
                        "format": "double",
                        "type": "number"
                    },
                    "years": {
                        "description": "Years is the number of years you wish to purchase Whois Privacy for. Years defaults to 1 and cannot be more then the domain expiration date.",
                        "format": "int32",
                        "type": "integer",
                        "default": 1
                    }
                },
                "type": "object"
            },
            "PrivacyResponse": {
                "description": "PrivacyResponse contains the updated domain info as well as the order info for the newly purchased Whois Privacy.",
                "properties": {
                    "domain": {
                        "$ref": "#/components/schemas/DomainResponsePayload"
                    },
                    "order": {
                        "description": "Order is an identifier for this purchase.",
                        "format": "int32",
                        "type": "integer"
                    },
                    "totalPaid": {
                        "description": "TotalPaid is the total amount paid, including VAT.",
                        "format": "double",
                        "type": "number",
                        "example": 4.99
                    }
                },
                "type": "object",
                "required": [
                    "order",
                    "totalPaid"
                ]
            },
            "DomainsRenewDomainBody": {
                "description": "RenewDomainRequest passes the domain name and purchase parameters to the RenewDomain function.",
                "properties": {
                    "purchasePrice": {
                        "description": "PurchasePrice is the amount in USD to pay for the domain renewal at the minimum renewal period (typically 1 year). If VAT tax applies, it will also be added automatically.\nPurchasePrice is required if this is a premium domain.",
                        "format": "double",
                        "type": "number",
                        "example": 10.99
                    },
                    "years": {
                        "description": "Years specifies how many years to renew the domain for. Years defaults to the minimum time period (typically 1 year) if not passed and cannot be more than 10.  Some TLDs default to longer periods (e.g. .AI requires a 2 year renewal).",
                        "format": "int32",
                        "type": "integer",
                        "example": 3
                    }
                },
                "type": "object"
            },
            "RenewDomainResponse": {
                "description": "RenewDomainResponse contains the updated domain info as well as the order info for the renewed domain.",
                "properties": {
                    "domain": {
                        "$ref": "#/components/schemas/Domain"
                    },
                    "order": {
                        "format": "int32",
                        "title": "Order is an identifier for this purchase",
                        "type": "integer"
                    },
                    "totalPaid": {
                        "description": "TotalPaid is the total amount paid, including VAT.",
                        "format": "double",
                        "type": "number",
                        "example": 5.95
                    }
                },
                "type": "object"
            },
            "DomainsSetContactsBody": {
                "description": "SetContactsRequest passes the contact info for each role to the SetContacts function.",
                "properties": {
                    "contacts": {
                        "$ref": "#/components/schemas/Contacts"
                    }
                },
                "type": "object"
            },
            "DomainsSetNameserversBody": {
                "description": "SetNameserversRequest passes the list of nameservers to set for the SetNameserver function.",
                "properties": {
                    "nameservers": {
                        "description": "Nameservers is a list of the nameservers to set. Nameservers should already be set up and hosting the zone properly as some registries will verify before allowing the change.",
                        "items": {
                            "type": "string",
                            "example": "ns1.name.com",
                            "minItems": 1
                        },
                        "type": "array"
                    }
                },
                "required": [
                    "nameservers"
                ],
                "type": "object",
                "example": {
                    "nameservers": [
                        "ns1.name.com",
                        "ns2.name.com"
                    ]
                }
            },
            "AvailabilityRequest": {
                "description": "Checks if one or more domain names are available for registration (up to 50 domains). Important: Do not encode the `:` in the path. Use `/core/v1/domains:checkAvailability`, not `/core/v1/domains%3AcheckAvailability`.",
                "properties": {
                    "domainNames": {
                        "description": "DomainNames is the list of domains to check if they are available.",
                        "items": {
                            "type": "string"
                        },
                        "type": "array",
                        "maxItems": 50,
                        "minItems": 1
                    }
                },
                "type": "object",
                "required": [
                    "domainNames"
                ]
            },
            "SearchResult": {
                "description": "SearchResult is returned by the CheckAvailability, Search, and SearchStream functions.",
                "properties": {
                    "domainName": {
                        "description": "DomainName is the punycode encoding of the result domain name.",
                        "type": "string",
                        "example": "example.com"
                    },
                    "premium": {
                        "description": "Premium indicates that this search result is a premium result and the purchase_price needs to be passed to the DomainCreate command. This parameter will only be returned for domains that are purchasable.",
                        "type": "boolean",
                        "example": true
                    },
                    "purchasable": {
                        "description": "Purchasable indicates whether the search result is available for purchase.",
                        "type": "boolean",
                        "example": true
                    },
                    "purchasePrice": {
                        "description": "PurchasePrice is the price for purchasing this domain for the minimum time period (typically 1 year). Purchase_price is always in USD. This parameter will only be returned for domains that are purchasable.",
                        "format": "double",
                        "type": "number",
                        "example": 10.99
                    },
                    "purchaseType": {
                        "description": "PurchaseType indicates what kind of purchase this result is for. It should be passed to the DomainCreate command. This parameter will only be returned for domains that are purchasable.",
                        "type": "string",
                        "example": "registration"
                    },
                    "renewalPrice": {
                        "description": "RenewalPrice is the annual renewal price for this domain as it may be different than the purchase_price. This parameter will only be returned for domains that are purchasable.",
                        "format": "double",
                        "type": "number",
                        "example": 10.99
                    },
                    "sld": {
                        "description": "SLD is first portion of the domain_name.",
                        "type": "string",
                        "example": "example"
                    },
                    "tld": {
                        "description": "TLD is the rest of the domain_name after the SLD.",
                        "type": "string",
                        "example": "com"
                    }
                },
                "type": "object",
                "required": [
                    "domainName",
                    "sld",
                    "tld",
                    "purchasable"
                ]
            },
            "SearchResponse": {
                "description": "SearchResponse returns a list of search results.",
                "properties": {
                    "results": {
                        "description": "Results of the search are returned here, the order should not be relied upon.",
                        "items": {
                            "$ref": "#/components/schemas/SearchResult"
                        },
                        "type": "array"
                    }
                },
                "type": "object"
            },
            "BadGateway502": {
                "type": "object",
                "required": [
                    "message"
                ],
                "properties": {
                    "message": {
                        "type": "string",
                        "description": "A human-readable message providing more details about the error",
                        "example": "Registry Connection Unavailable"
                    }
                }
            },
            "SearchRequest": {
                "description": "SearchRequest is used to specify the search parameters.",
                "properties": {
                    "keyword": {
                        "description": "Keyword is the search term to search for. It can be just a word, or a whole domain name.",
                        "type": "string",
                        "example": "mydomain"
                    },
                    "timeout": {
                        "description": "Timeout is a value in milliseconds on how long to perform the search for. Valid timeouts are between 500ms to 12,000ms. If not specified, timeout defaults to 12,000ms.\nSince some additional processing is performed on the results, a response may take longer then the timeout.",
                        "format": "int32",
                        "type": "integer",
                        "example": 2500
                    },
                    "tldFilter": {
                        "description": "TLDFilter will limit results to only contain the specified TLDs. There is a maximum of 50 TLDs that can be used in this filter",
                        "items": {
                            "type": "string"
                        },
                        "type": "array",
                        "maxItems": 50,
                        "example": [
                            "com",
                            "net",
                            "org"
                        ]
                    }
                },
                "type": "object",
                "required": [
                    "keyword"
                ]
            },
            "HelloResponse": {
                "properties": {
                    "motd": {
                        "description": "Motd is a message of the day. It might provide some useful information.",
                        "type": "string"
                    },
                    "serverName": {
                        "description": "ServerName is an identfier for which server is being accessed.",
                        "type": "string"
                    },
                    "serverTime": {
                        "description": "ServerTime is the current date/time at the server.",
                        "type": "string"
                    },
                    "username": {
                        "description": "Username is the account name you are currently logged into.",
                        "type": "string"
                    }
                },
                "title": "HelloResponse is the response from the HelloFunc command",
                "type": "object",
                "required": [
                    "motd",
                    "serverName",
                    "serverTime",
                    "username"
                ]
            },
            "SubscriptionRecord": {
                "properties": {
                    "active": {
                        "title": "Whether or not the subscription is active",
                        "type": "boolean"
                    },
                    "createDate": {
                        "title": "Date the subscription record was created (Date you subscribed)",
                        "type": "string"
                    },
                    "eventName": {
                        "title": "The name of the event you have subscribed to",
                        "type": "string"
                    },
                    "id": {
                        "format": "int32",
                        "title": "The ID of the event record. Used for updating and canceling",
                        "type": "integer"
                    },
                    "updateDate": {
                        "title": "Date the subscription record was updated (Date you made changes)",
                        "type": [
                            "string",
                            "null"
                        ]
                    },
                    "url": {
                        "title": "The URL we will send a POST request to with the notification message",
                        "type": "string"
                    }
                },
                "required": [
                    "active",
                    "id",
                    "createDate",
                    "eventName",
                    "url",
                    "updateDate"
                ],
                "title": "*\nThe record for each notification you have subscribed to",
                "type": "object"
            },
            "ListSubscribedWebhooksResponse": {
                "properties": {
                    "subscriptions": {
                        "items": {
                            "description": "Array of subscription objects. One for each event you have subscribed to.",
                            "$ref": "#/components/schemas/SubscriptionRecord"
                        },
                        "type": "array"
                    }
                },
                "title": "The response from listing all of the notifications you have subscribed to",
                "type": "object"
            },
            "AvailableWebhooks": {
                "description": "The list of configured webhooks you can subscribe to",
                "type": "string",
                "enum": [
                    "domain.transfer.status_change",
                    "account.credit.balance_change"
                ]
            },
            "SubscribeToNotification": {
                "description": "Request to subscribe to a specific webhook notification",
                "properties": {
                    "eventName": {
                        "$ref": "#/components/schemas/AvailableWebhooks"
                    },
                    "url": {
                        "type": "string",
                        "description": "The URL we will send the notification data to",
                        "example": "https://example.com"
                    },
                    "active": {
                        "type": "boolean",
                        "description": "If the webhook should be active. This allows a webhook to be deactivated in our system. It may be useful to deactivate a webhook if the server that receives the POST request is undergoing scheduled maintenance, for example."
                    }
                },
                "required": [
                    "eventName",
                    "url",
                    "active"
                ]
            },
            "SubscribeToNotificationResponse": {
                "properties": {
                    "subscription": {
                        "$ref": "#/components/schemas/SubscriptionRecord"
                    }
                },
                "title": "Response from subscribing to a notification",
                "type": "object"
            },
            "ModifySubscriptionResponse": {
                "properties": {
                    "subscription": {
                        "$ref": "#/components/schemas/SubscriptionRecord"
                    }
                },
                "type": "object"
            },
            "OrderItem": {
                "description": "OrderItem contains all the order item data.",
                "properties": {
                    "duration": {
                        "description": "Duration is the number of intervals.",
                        "format": "int32",
                        "type": "integer"
                    },
                    "id": {
                        "format": "int32",
                        "type": "integer",
                        "title": "Id is the unique identifier of the order item."
                    },
                    "interval": {
                        "description": "Interval is the  unit of time (\"year\", \"month\"). May be null for items that have no applicable interval.",
                        "type": [
                            "string",
                            "null"
                        ]
                    },
                    "name": {
                        "description": "Name is name of the item ('example.ninja').",
                        "type": [
                            "string",
                            "null"
                        ]
                    },
                    "originalPrice": {
                        "description": "OriginalPrice is the original price of the item before discounts.",
                        "format": "float",
                        "type": [
                            "number",
                            "null"
                        ]
                    },
                    "price": {
                        "description": "Price is the final price of the item.",
                        "format": "float",
                        "type": "number"
                    },
                    "priceNonUsd": {
                        "description": "PriceNonUsd is the price of the item if order has non-usd currency.",
                        "format": "float",
                        "type": "number"
                    },
                    "quantity": {
                        "description": "Quantity is the number of items.",
                        "format": "int32",
                        "type": "integer"
                    },
                    "status": {
                        "description": "Status indicates state of the order ('success', 'failed', 'refunded').",
                        "type": "string"
                    },
                    "taxAmount": {
                        "description": "TaxAmount is the tax charged for this item, if applicable.",
                        "format": "float",
                        "type": [
                            "number",
                            "null"
                        ]
                    },
                    "tld": {
                        "description": "Tld is (optional) tld of domain name, if applicable ('ninja').",
                        "type": [
                            "string",
                            "null"
                        ]
                    },
                    "type": {
                        "description": "Type is type of  the item ('registration', 'whois_privacy').",
                        "type": "string"
                    }
                },
                "type": "object",
                "required": [
                    "duration",
                    "id",
                    "interval",
                    "name",
                    "originalPrice",
                    "price",
                    "quantity",
                    "status",
                    "type"
                ]
            },
            "Order": {
                "description": "Order contains all the data for an order.",
                "properties": {
                    "authAmount": {
                        "description": "AuthAmount is the amount authorized to complete the order purchase.",
                        "format": "float",
                        "type": "number"
                    },
                    "createDate": {
                        "description": "CreateDate is the date the order was placed.",
                        "type": "string"
                    },
                    "currency": {
                        "description": "Currency indicates currency of the order ('USD', 'CNY').",
                        "type": "string"
                    },
                    "currencyRate": {
                        "description": "CurrencyRate is the conversion rate from USD to order's currency.  This field is only populated if order's currency is non-USD.",
                        "format": "float",
                        "type": "number"
                    },
                    "finalAmount": {
                        "description": "FinalAmount is the final amount of the order, after discounts and refunds.",
                        "type": "number",
                        "format": "float"
                    },
                    "id": {
                        "format": "int32",
                        "type": "integer",
                        "title": "Id is the unique identifier of the order."
                    },
                    "orderItems": {
                        "description": "OrderItems is the collection of 1 or more items in the order.",
                        "items": {
                            "$ref": "#/components/schemas/OrderItem"
                        },
                        "type": "array"
                    },
                    "registrar": {
                        "description": "Registrar is registrar with which order is placed.",
                        "type": "string"
                    },
                    "status": {
                        "description": "Status indicates the state of the order ('success', 'failed').",
                        "type": "string"
                    },
                    "totalCapture": {
                        "description": "TotalCapture is the amount captured.",
                        "format": "float",
                        "type": "number",
                        "example": 10.95
                    },
                    "totalRefund": {
                        "description": "TotalRefund is the amount, if any, refunded. Default is 0.00.",
                        "format": "float",
                        "type": "number",
                        "example": 10.95
                    }
                },
                "type": "object"
            },
            "ListOrdersResponse": {
                "description": "ListOrdersResponse is the response from a list request, it contains the paginated list of Orders.",
                "properties": {
                    "lastPage": {
                        "description": "LastPage is the identifier for the final page of results. It is only populated if there is another page of results after the current page.",
                        "format": "int32",
                        "type": "integer"
                    },
                    "nextPage": {
                        "description": "NextPage is the identifier for the next page of results. It is only populated if there is another page of results after the current page.",
                        "format": "int32",
                        "type": "integer"
                    },
                    "totalCount": {
                        "description": "TotalCount is total number of results.",
                        "format": "int32",
                        "type": "integer"
                    },
                    "from": {
                        "description": "From specifies starting record number on current page.",
                        "format": "int32",
                        "type": "integer"
                    },
                    "to": {
                        "description": "To specifies ending record number on current page.",
                        "format": "int32",
                        "type": "integer"
                    },
                    "orders": {
                        "items": {
                            "$ref": "#/components/schemas/Order"
                        },
                        "description": "Orders is the collection of orders, if any, in the requesting account.",
                        "type": "array"
                    },
                    "parentAccountId": {
                        "description": "ParentAccountId field is populated when requesting account has a parent account id.",
                        "format": "int32",
                        "type": "integer"
                    }
                },
                "type": "object",
                "required": [
                    "orders",
                    "to",
                    "from",
                    "totalCount"
                ]
            },
            "Transfer": {
                "description": "Transfer contains all relevant data for a domain transfer to name.com.",
                "type": "object",
                "properties": {
                    "domainName": {
                        "description": "DomainName is the domain to be transfered to name.com.",
                        "type": "string",
                        "example": "example.com"
                    },
                    "email": {
                        "description": "Email is the email address that the approval email was sent to. Not every TLD requries an approval email. This is usually pulled from Whois.",
                        "type": "string",
                        "format": "email",
                        "example": "admin@example.com"
                    },
                    "status": {
                        "description": "The current status of the transfer. Details about statuses can be found in the following Knowledge Base article: <https://www.name.com/support/articles/115012519688-transfer-status-faq>.",
                        "type": "string",
                        "example": "pending_transfer"
                    }
                },
                "required": [
                    "domainName",
                    "status"
                ]
            },
            "ListTransfersResponse": {
                "description": "ListTransfersResponse returns the list of pending transfers as well as the pagination information if relevant.",
                "type": "object",
                "properties": {
                    "lastPage": {
                        "description": "LastPage is the identifier for the final page of results. It is only populated if there is another page of results after the current page.",
                        "format": "int32",
                        "type": "integer"
                    },
                    "nextPage": {
                        "description": "NextPage is the identifier for the next page of results. It is only populated if there is another page of results after the current page.",
                        "format": "int32",
                        "type": "integer"
                    },
                    "totalCount": {
                        "description": "TotalCount is total number of results.",
                        "format": "int32",
                        "type": "integer"
                    },
                    "from": {
                        "description": "From specifies starting record number on current page.",
                        "format": "int32",
                        "type": "integer"
                    },
                    "to": {
                        "description": "To specifies ending record number on current page.",
                        "format": "int32",
                        "type": "integer"
                    },
                    "transfers": {
                        "items": {
                            "$ref": "#/components/schemas/Transfer"
                        },
                        "description": "Transfers is a list of pending transfers",
                        "type": "array"
                    }
                },
                "required": [
                    "transfers",
                    "to",
                    "from",
                    "totalCount"
                ]
            },
            "CreateTransferRequest": {
                "description": "CreateTransferRequest passes the required transfer info to the CreateTransfer function.",
                "properties": {
                    "authCode": {
                        "description": "AuthCode is the authorization code for the transfer. Not all TLDs require authorization codes, but most do.",
                        "type": "string",
                        "example": "ABC123",
                        "minLength": 1
                    },
                    "domainName": {
                        "description": "DomainName is the domain you want to transfer to name.com.",
                        "type": "string",
                        "example": "example.com",
                        "minLength": 1
                    },
                    "privacyEnabled": {
                        "description": "PrivacyEnabled is a flag on whether to purchase Whois Privacy with the transfer.",
                        "type": "boolean",
                        "example": true
                    },
                    "purchasePrice": {
                        "description": "PurchasePrice is the amount to pay for the transfer of the domain. If privacy_enabled is set, the regular price for Whois Privacy will be added automatically. If VAT tax applies, it will also be added automatically.\nPurchasePrice is required if the domain to transfer is a premium domain.",
                        "format": "double",
                        "type": "number",
                        "example": 12.99
                    }
                },
                "type": "object",
                "required": [
                    "domainName",
                    "authCode"
                ]
            },
            "CreateTransferResponse": {
                "description": "CreateTransferResponse returns the newly created transfer resource as well as the order information.",
                "properties": {
                    "order": {
                        "description": "Order is an identifier for this purchase.",
                        "format": "int32",
                        "type": "integer",
                        "example": 12345
                    },
                    "totalPaid": {
                        "description": "TotalPaid is the total amount paid, including VAT and Whois Privacy.",
                        "format": "double",
                        "type": "number",
                        "example": 12.99
                    },
                    "transfer": {
                        "$ref": "#/components/schemas/Transfer"
                    }
                },
                "type": "object",
                "required": [
                    "order",
                    "totalPaid",
                    "transfer"
                ]
            },
            "ResellerTldInfo": {
                "description": "General information about a TLD and it's various requirements. This is not a comprehensive list of all information related to a TLD.",
                "type": "object",
                "properties": {
                    "tld": {
                        "description": "The TLD this information relates to.",
                        "type": "string",
                        "example": ".fr"
                    },
                    "ccTld": {
                        "description": "Whether the TLD is a Country Code TLD.",
                        "type": "boolean",
                        "example": true
                    },
                    "supportsTransferLock": {
                        "description": "Whether the TLD supports implementing a Transfer Lock.",
                        "type": "boolean",
                        "example": true
                    },
                    "supportsDnssec": {
                        "description": "Whether the TLD supports DNSSEC.",
                        "type": "boolean",
                        "example": true
                    },
                    "supportsPremium": {
                        "description": "Whether there are premium domains for this TLD.",
                        "type": "boolean",
                        "example": true
                    },
                    "expirationGracePeriod": {
                        "description": "The number of days you have to renew your domain after it has expired, but before it is removed from your account.",
                        "type": "number",
                        "format": "int32",
                        "example": 25
                    },
                    "allowedRegistrationYears": {
                        "description": "The years that a domain is allowed to be registered for.",
                        "type": "array",
                        "items": {
                            "type": "number"
                        },
                        "example": [
                            1,
                            3,
                            5,
                            8,
                            10
                        ]
                    },
                    "idnLanguages": {
                        "description": "The IND Languages that the TLD supports (if any).",
                        "type": "object",
                        "additionalProperties": {
                            "type": "string"
                        },
                        "example": {
                            "DE": "German",
                            "DK": "Danish",
                            "ES": "Spanish",
                            "IT": "Italian",
                            "JP": "Japanese"
                        }
                    }
                },
                "required": [
                    "tld",
                    "ccTld",
                    "supportsTransferLock",
                    "supportsDnssec",
                    "supportsPremium",
                    "expirationGracePeriod",
                    "idnLanguages",
                    "allowedRegistrationYears"
                ]
            },
            "RequirementField": {
                "description": "A field definition for TLD registration requirements, including validation rules, conditional logic, and nested field structures.",
                "type": "object",
                "required": [
                    "type",
                    "required"
                ],
                "properties": {
                    "description": {
                        "description": "A detailed description of what this field is for and any specific requirements or constraints.",
                        "type": "string",
                        "example": "First name of registrant"
                    },
                    "type": {
                        "description": "The requirement type of this field. Each requirement type has different information.\n\nPossible values and their details:\n\n  - **`string`**: These are open string fields that cannot be submitted as empty. They will always have a label. A description is optional as the label may convey all of the required information the user would need to submit.\n      Note: Some string fields may have a required format (i.e. date format of YYYY/MM/DD). The format will be listed in the \"validation\" parameter if required.\n      Example TLDs: abogado, law, com.br (and more)\n\n  - **`notice`**: These field types will just have a description, and contain information that must be displayed to the user prior to registration. There is no data that will be required to be submitted, so all notice type fields will have a \"required\" value of `false`.\n      Example TLDs: at (notice only), ca (1 notice field)\n\n  - **`acknowledgement`**: These field types will have a description, label and value. The description must be displayed to the user, the label is the required label for the acknowledgement, and the value is what must be submitted.\n      Example TLDs: security, ngo, music (and more)\n\n  - **`enum`**: The field types have a list of predefined options that the user must choose from in order to submit. Only the values returned in the \"options\" array will be allowed, or the request will fail validation. Options MAY include dependent fields, as some registries required additional information depending on what was chosen for the \"parent\" option. All dependent fields will follow the same field patterns as the parent fields.\n      Options: These are the predefined options for the enum type fields. They will always have a label and a value. The value is what must be submitted. The options MAY include a description, but will mostly only have a label parameter.\n      Note: There may be a single option returned for an enum. This is because that is the ONLY OPTION ALLOWED by the registry.\n      Example TLDs with simple lists: ca, es (and more)\n      Example TLDs with dependent fields: fr, se, com.br\n\n  - **`boolean`**: Boolean fields for simple true/false acknowledgements or selections.\n      Example TLDs: security\n",
                        "enum": [
                            "string",
                            "notice",
                            "acknowledgement",
                            "enum",
                            "boolean"
                        ],
                        "example": "string"
                    },
                    "required": {
                        "description": "Whether this field is mandatory for domain registration. If true, the field must be provided.",
                        "oneOf": [
                            {
                                "type": "boolean",
                                "example": true
                            },
                            {
                                "type": "string",
                                "example": "true"
                            }
                        ],
                        "example": true
                    },
                    "label": {
                        "description": "A user-friendly label for this field that can be used in UI forms.",
                        "type": "string",
                        "example": "First Name"
                    },
                    "validation": {
                        "description": "Validation rule to apply to this field. Common validations include 'valid_email', 'valid_phone', etc.",
                        "type": [
                            "string",
                            "null"
                        ],
                        "example": "valid_email"
                    },
                    "options": {
                        "description": "For fields with predefined choices, this can be either an array of complex option objects, a simple array of string values, or null if no options are available.",
                        "oneOf": [
                            {
                                "type": "array",
                                "items": {
                                    "$ref": "#/components/schemas/RequirementFieldOption"
                                },
                                "minItems": 0
                            },
                            {
                                "type": "array",
                                "items": {
                                    "type": "string"
                                },
                                "minItems": 0,
                                "example": [
                                    "English",
                                    "French"
                                ]
                            },
                            {
                                "type": "null"
                            }
                        ]
                    },
                    "required_when": {
                        "description": "For conditional fields, specifies when this field becomes required (e.g., when a parent option has a specific value).",
                        "type": [
                            "string",
                            "null"
                        ],
                        "example": "FR"
                    },
                    "fields": {
                        "description": "For complex fields or when options are selected, contains nested field definitions that become relevant.",
                        "type": [
                            "object",
                            "null"
                        ],
                        "additionalProperties": {
                            "$ref": "#/components/schemas/RequirementField"
                        }
                    },
                    "value": {
                        "description": "For acknowledgement fields, this is the value that must be submitted when the user acknowledges the requirement.",
                        "type": [
                            "string",
                            "null"
                        ],
                        "example": "accepted"
                    }
                }
            },
            "RequirementFieldOption": {
                "description": "An option within a field that has predefined choices, including the option value, label, and any nested fields that become relevant when this option is selected.",
                "type": "object",
                "required": [
                    "value"
                ],
                "properties": {
                    "value": {
                        "description": "The actual value of this option. This is what must be submitted when this option is selected.",
                        "type": "string",
                        "example": "no"
                    },
                    "label": {
                        "description": "A user-friendly label for this option that can be displayed in UI forms.",
                        "type": "string",
                        "example": "I am an individual"
                    },
                    "fields": {
                        "description": "When this option is selected, these nested fields become relevant and may be required. This allows for conditional field logic.",
                        "type": [
                            "object",
                            "null"
                        ],
                        "additionalProperties": {
                            "$ref": "#/components/schemas/RequirementField"
                        },
                        "example": {
                            "X-FR-BIRTHDATE": {
                                "description": "DOB in format yy/mm/dd",
                                "type": "string",
                                "required": true
                            },
                            "X-FR-BIRTHPLACE": {
                                "required": true,
                                "description": "Nation of Birth",
                                "type": "enum",
                                "options": [
                                    "FR",
                                    "GB",
                                    "USA"
                                ]
                            }
                        }
                    }
                }
            },
            "Requirement": {
                "description": "Requirement defines the registration requirements for a specific TLD, including required fields, validation rules, and conditional logic.",
                "type": "object",
                "properties": {
                    "description": {
                        "description": "A detailed description of the registration requirements for this TLD, including eligibility criteria, restrictions, and important notes.",
                        "type": "string",
                        "example": "Required fields to register an .fr domain"
                    },
                    "fields": {
                        "description": "An object containing all required and optional fields for domain registration, with their validation rules and conditional logic.",
                        "type": "object",
                        "additionalProperties": {
                            "$ref": "#/components/schemas/RequirementField"
                        }
                    }
                }
            },
            "GetRequirementResponse": {
                "description": "GetRequirementResponse has TLD Info and registration requirements for the specified TLD. The requirements field will always be present but may be an empty object when no specific requirements exist for the TLD.",
                "type": "object",
                "properties": {
                    "tldInfo": {
                        "description": "General information about a specific TLD. These are not registration requirements, but contain useful information for domain reseller and domain registrants in general.",
                        "$ref": "#/components/schemas/ResellerTldInfo"
                    },
                    "requirements": {
                        "description": "The registration requirements for this TLD, including required fields, validation rules, and conditional logic. This field will always be present but may be an empty object when no specific requirements exist for the TLD.",
                        "$ref": "#/components/schemas/Requirement"
                    }
                },
                "required": [
                    "requirements",
                    "tldInfo"
                ]
            },
            "TldPriceListEntry": {
                "description": "The pricing for an individual TLD.\n\nPlease note that if `null` is returned for any of the prices, it means that particular product is unavailable at name.com.\n\nFor example, if `registrationPrice` returns as `null` in the response, it means that name.com is not currently accepting registrations for that TLD.\n",
                "properties": {
                    "tld": {
                        "description": "The TLD the pricing applies to. For IDN TLDs, this will be the unicode representation of the TLD.",
                        "type": "string",
                        "example": "com"
                    },
                    "duration": {
                        "description": "The number of years this pricing is for",
                        "type": "number",
                        "format": "int32",
                        "example": 1
                    },
                    "registrationPrice": {
                        "description": "This your account level price in US Dollars (USD) and is the price you pay for non-premium registrations. It includes applicable rebates, promotions and/or sales.",
                        "type": [
                            "number",
                            "null"
                        ],
                        "format": "double",
                        "example": 9.99
                    },
                    "registrationOriginalPrice": {
                        "description": "Price in US Dollars (USD) before any rebates, promotions and/or sales when registering non-premium domains.",
                        "type": [
                            "number",
                            "null"
                        ],
                        "format": "double",
                        "example": 11.99
                    },
                    "renewalPrice": {
                        "description": "This your account level price in US Dollars (USD) and is the price you pay for renewals. It includes applicable rebates, promotions and/or sales.",
                        "type": [
                            "number",
                            "null"
                        ],
                        "format": "double",
                        "example": 9.99
                    },
                    "domainRestorationPrice": {
                        "description": "This your account level price in US Dollars (USD) and is the price you pay for domain restorations. It includes applicable rebates, promotions and/or sales.",
                        "type": [
                            "number",
                            "null"
                        ],
                        "format": "double",
                        "example": 120.99
                    },
                    "transferInPrice": {
                        "description": "This your account level price in US Dollars (USD) and is the price you pay for transferring a domain to management at name.com. It includes applicable rebates, promotions and/or sales.",
                        "type": [
                            "number",
                            "null"
                        ],
                        "format": "double",
                        "example": 19.99
                    }
                },
                "required": [
                    "tld",
                    "duration",
                    "registrationPrice",
                    "registrationOriginalPrice",
                    "renewalPrice",
                    "domainRestorationPrice",
                    "transferInPrice"
                ]
            },
            "TldPriceListResponse": {
                "properties": {
                    "lastPage": {
                        "description": "LastPage is the identifier for the final page of results. It is only populated if there is another page of results after the current page.",
                        "format": "int32",
                        "type": "integer"
                    },
                    "nextPage": {
                        "description": "NextPage is the identifier for the next page of results. It is only populated if there is another page of results after the current page.",
                        "format": "int32",
                        "type": [
                            "integer",
                            "null"
                        ]
                    },
                    "totalCount": {
                        "description": "TotalCount is total number of results.",
                        "format": "int32",
                        "type": "integer"
                    },
                    "from": {
                        "description": "From specifies starting record number on current page.",
                        "format": "int32",
                        "type": "integer"
                    },
                    "to": {
                        "description": "To specifies ending record number on current page.",
                        "format": "int32",
                        "type": "integer"
                    },
                    "pricing": {
                        "type": "array",
                        "items": {
                            "$ref": "#/components/schemas/TldPriceListEntry"
                        }
                    }
                },
                "type": "object",
                "required": [
                    "lastPage",
                    "nextPage",
                    "totalCount",
                    "from",
                    "to",
                    "pricing"
                ]
            },
            "DomainTransferStatusChange": {
                "type": "object",
                "properties": {
                    "eventName": {
                        "type": "string",
                        "description": "The name of the subscription event"
                    },
                    "domainName": {
                        "type": "string",
                        "description": "The domain that the transfer status has changed for"
                    },
                    "status": {
                        "type": "string",
                        "description": "The updated status of the domain transfer. The transfer status will be one of the following values:\n- **canceled:** The transfer has been canceled by the user.\n- **canceled_pending_refund**: The transfer has been canceled by the user, and a refund for the price is being processed.\n- **completed**: The transfer has completed.\n- **failed**: The transfer has failed, and will not be retried.\n- **pending**: The transfer has been requested, and is pending.\n- **pending_insert**: The transfer has completed and the domain will soon be inserted into the account.\n- **pending_new_auth_code**: A new authcode is required to complete the transfer.\n- **pending_transfer**: The transfer has been requested, and is pending.\n- **pending_unlock**: The domain to be transferred is currently in a locked state at the losing registrar, and will begin processing once the lock has been removed.\n- **rejected**: The transfer has been rejected at the losing registrar and will not be retried.\n- **submitting_transfer**: The transfer has been initiated and will soon be submitted to the registry.\n"
                    }
                },
                "required": [
                    "eventName",
                    "domainName"
                ]
            },
            "AccountCreditBalanceChange": {
                "type": "object",
                "properties": {
                    "eventName": {
                        "type": "string",
                        "description": "The name of the subscription event"
                    },
                    "accountId": {
                        "type": "number",
                        "format": "int64",
                        "description": "The account ID the subscription is for"
                    },
                    "balance": {
                        "type": "number",
                        "format": "double",
                        "description": "The remaining balance of account credit"
                    }
                }
            }
        }
    }
};
