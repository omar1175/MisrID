# API Documentation - Foreigner Digital ID and Government Services Platform

> Base URL: `https://api.yourplatform.com/v1`
> Auth: Bearer JWT token in the `Authorization` header, except public endpoints.
> Content-Type: `application/json`, unless the endpoint explicitly uses `multipart/form-data`.
> Date format: ISO 8601, for example `2026-01-15T10:30:00Z`.
> Database: MongoDB. All `_id` values are MongoDB ObjectId strings.

---

## Table of Contents

1. API Conventions
2. Auth and Account Access
3. User Profile and Digital Identity Onboarding
4. Services Catalog
5. AI Legal Assistant and RAG
6. Applications
7. Application Documents and AI Verification
8. Human Review and Escalation
9. Payments
10. Booking, Government Offices, and Appointments
11. Notifications
12. Complaints and Support
13. Admin Users and Roles
14. Legal Sources and Vector Indexing
15. Audit Logs
16. MongoDB Collections Summary
17. Recommended Indexes
18. Status Flows
19. Common Error Codes

---

## 1. API Conventions

### Standard Success Response

```json
{
  "success": true,
  "data": {}
}
```

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address"
      }
    ]
  }
}
```

### Pagination Response

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "total": 125,
      "page": 1,
      "limit": 20,
      "totalPages": 7
    }
  }
}
```

### Common Headers

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
Accept-Language: en
```

### Common Query Parameters

| Parameter | Type | Description |
|---|---:|---|
| `page` | number | Page number. Default is `1`. |
| `limit` | number | Page size. Default is `20`. |
| `search` | string | Keyword search. |
| `sortBy` | string | Sort field. |
| `sortOrder` | string | `asc` or `desc`. |

---

## 2. Auth and Account Access

### `POST /auth/register`

Creates a new user account for a foreign resident or visitor and sends an email verification OTP.

Public endpoint.

**Request**

```json
{
  "firstName": "Ahmed",
  "lastName": "Hassan",
  "email": "ahmed@example.com",
  "phoneNumber": "+201012345678",
  "password": "StrongPass123!",
  "preferredLanguage": "en"
}
```

**Response `201`**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "firstName": "Ahmed",
      "lastName": "Hassan",
      "email": "ahmed@example.com",
      "phoneNumber": "+201012345678",
      "emailVerified": false,
      "preferredLanguage": "en",
      "accountStatus": "active",
      "roles": ["foreigner"],
      "onboardingStatus": "profile_required",
      "createdAt": "2026-01-15T10:00:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh-token-value"
  }
}
```

---

### `POST /auth/login`

Public endpoint.

**Request**

```json
{
  "email": "ahmed@example.com",
  "password": "StrongPass123!"
}
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "firstName": "Ahmed",
      "lastName": "Hassan",
      "email": "ahmed@example.com",
      "emailVerified": true,
      "accountStatus": "active",
      "roles": ["foreigner"],
      "onboardingStatus": "completed"
    },
    "accessToken": "access-token-value",
    "refreshToken": "refresh-token-value"
  }
}
```

---

### `POST /auth/refresh-token`

Public endpoint.

**Request**

```json
{
  "refreshToken": "refresh-token-value"
}
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "accessToken": "new-access-token-value",
    "refreshToken": "new-refresh-token-value"
  }
}
```

---

### `POST /auth/logout`

Auth required.

**Request**

```json
{
  "refreshToken": "refresh-token-value"
}
```

**Response `200`**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### `POST /auth/otp/send`

Sends an email verification OTP to the authenticated user's email address.

Auth required. Email verification is not required for this endpoint.

**Request**

```json
{
  "email": "ahmed@example.com"
}
```

The `email` field is optional. If it is sent, it must match the authenticated user's email address.

**Response `200`**

```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "expiresInSeconds": 600
  }
}
```

---

### `POST /auth/otp/verify`

Verifies an email OTP and marks the user's email as verified.

Auth required. Email verification is not required for this endpoint.

**Request**

```json
{
  "email": "ahmed@example.com",
  "otpCode": "123456"
}
```

The `email` field is optional. If it is sent, it must match the authenticated user's email address.

**Response `200`**

```json
{
  "success": true,
  "data": {
    "emailVerified": true,
    "verifiedAt": "2026-01-15T10:05:00Z"
  }
}
```

---

### `POST /auth/forgot-password`

Public endpoint.

**Request**

```json
{
  "email": "ahmed@example.com"
}
```

**Response `200`**

```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

### `POST /auth/reset-password`

Public endpoint.

**Request**

```json
{
  "token": "reset-token-value",
  "newPassword": "NewStrongPass456!"
}
```

**Response `200`**

```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

## 3. User Profile and Digital Identity Onboarding

### `GET /users/me`

Returns the current user account.

Auth required.

**Response `200`**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "firstName": "Ahmed",
    "lastName": "Hassan",
    "email": "ahmed@example.com",
    "phoneNumber": "+201012345678",
    "emailVerified": true,
    "preferredLanguage": "en",
    "profileImageUrl": "https://storage.example.com/profiles/ahmed.jpg",
    "accountStatus": "active",
    "roles": ["foreigner"],
    "onboardingStatus": "completed",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-16T12:00:00Z"
  }
}
```

---

### `PATCH /users/me`

Updates non-sensitive account fields.

Auth required.

**Request**

```json
{
  "firstName": "Ahmed",
  "lastName": "Mohamed",
  "phoneNumber": "+201098765432",
  "preferredLanguage": "en"
}
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "firstName": "Ahmed",
    "lastName": "Mohamed",
    "phoneNumber": "+201098765432",
    "preferredLanguage": "en",
    "updatedAt": "2026-01-16T12:00:00Z"
  }
}
```

---

### `POST /users/me/profile-image`

Uploads or replaces the profile image.

Auth required.

**Request `multipart/form-data`**

```text
image: <file>
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "profileImageUrl": "https://storage.example.com/profiles/ahmed-new.jpg"
  }
}
```

---

### `GET /profiles/me`

Returns the current user's sensitive digital identity profile.

Auth required.

Sensitive values are masked in normal responses.

**Response `200`**

```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
    "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
    "passportNumberMasked": "A123****",
    "currentNationality": "SA",
    "entryDate": "2025-11-10",
    "currentResidencyType": "tourist_visa",
    "currentResidencyExpiryDate": "2026-02-10",
    "address": {
      "country": "EG",
      "city": "Minya",
      "area": "New Minya",
      "street": "Example Street",
      "buildingNo": "12"
    },
    "profileStatus": "complete",
    "riskLevel": "low",
    "createdAt": "2026-01-15T10:10:00Z",
    "updatedAt": "2026-01-16T09:00:00Z"
  }
}
```

---

### `POST /profiles/me`

Completes the onboarding profile.

Auth required.

The backend must encrypt or hash sensitive identifiers such as passport number.

**Request**

```json
{
  "passportNumber": "A12345678",
  "currentNationality": "SA",
  "dateOfBirth": "1993-05-15",
  "gender": "male",
  "entryDate": "2025-11-10",
  "currentResidencyType": "tourist_visa",
  "currentResidencyExpiryDate": "2026-02-10",
  "address": {
    "country": "EG",
    "city": "Minya",
    "area": "New Minya",
    "street": "Example Street",
    "buildingNo": "12",
    "latitude": 28.0871,
    "longitude": 30.7618
  },
  "emergencyContact": {
    "name": "Omar Hassan",
    "phoneNumber": "+201111111111",
    "relationship": "friend"
  }
}
```

**Response `201`**

```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
    "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
    "passportNumberMasked": "A123****",
    "currentNationality": "SA",
    "entryDate": "2025-11-10",
    "currentResidencyType": "tourist_visa",
    "profileStatus": "complete",
    "onboardingStatus": "completed",
    "createdAt": "2026-01-15T10:10:00Z"
  }
}
```

---

### `PATCH /profiles/me`

Updates the user's sensitive profile.

Auth required.

**Request**

```json
{
  "currentResidencyType": "temporary_residence",
  "currentResidencyExpiryDate": "2026-12-31",
  "address": {
    "country": "EG",
    "city": "Cairo",
    "area": "Nasr City",
    "street": "Example Street",
    "buildingNo": "20"
  }
}
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
    "currentResidencyType": "temporary_residence",
    "currentResidencyExpiryDate": "2026-12-31",
    "updatedAt": "2026-01-17T08:00:00Z"
  }
}
```

---

## 4. Services Catalog

### `GET /service-categories`

Returns all public service categories.

Public endpoint.

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "_id": "65b1c2d3e4f5a6b7c8d9e0f1",
      "categoryName": "Residency Services",
      "slug": "residency-services",
      "isActive": true
    },
    {
      "_id": "65b1c2d3e4f5a6b7c8d9e0f2",
      "categoryName": "Driving and Traffic Services",
      "slug": "driving-and-traffic-services",
      "isActive": true
    }
  ]
}
```

---

### `POST /service-categories`

Creates a service category.

Auth required. Admin only.

**Request**

```json
{
  "categoryName": "Residency Services",
  "slug": "residency-services",
  "description": "Residency renewal and related services",
  "isActive": true
}
```

**Response `201`**

```json
{
  "success": true,
  "data": {
    "_id": "65b1c2d3e4f5a6b7c8d9e0f1",
    "categoryName": "Residency Services",
    "slug": "residency-services",
    "isActive": true,
    "createdAt": "2026-01-15T11:00:00Z"
  }
}
```

---

### `GET /services`

Returns government services available on the platform.

Public endpoint.

**Query Params**

```text
categoryId=65b1c2d3e4f5a6b7c8d9e0f1&isActive=true&search=residence&page=1&limit=20
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "65b2c3d4e5f6a7b8c9d0e1f2",
        "categoryId": "65b1c2d3e4f5a6b7c8d9e0f1",
        "serviceName": "Tourist Residence Renewal",
        "slug": "tourist-residence-renewal",
        "description": "Renew a tourist residence permit.",
        "estimatedDays": 7,
        "governmentFee": 500,
        "platformFee": 100,
        "currency": "EGP",
        "requiresAppointment": true,
        "isActive": true,
        "requiredDocuments": [
          {
            "documentType": "passport",
            "isMandatory": true,
            "description": "Valid passport image"
          },
          {
            "documentType": "rental_contract",
            "isMandatory": true,
            "description": "Valid rental contract"
          }
        ]
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

---

### `GET /services/:serviceId`

Returns one service and its requirements.

Public endpoint.

**Response `200`**

```json
{
  "success": true,
  "data": {
    "_id": "65b2c3d4e5f6a7b8c9d0e1f2",
    "categoryId": "65b1c2d3e4f5a6b7c8d9e0f1",
    "category": {
      "categoryName": "Residency Services"
    },
    "serviceName": "Tourist Residence Renewal",
    "slug": "tourist-residence-renewal",
    "description": "Renew a tourist residence permit.",
    "estimatedDays": 7,
    "governmentFee": 500,
    "platformFee": 100,
    "currency": "EGP",
    "requiresAppointment": true,
    "competentOfficeType": "passport_office",
    "isActive": true,
    "requiredDocuments": [
      {
        "documentType": "passport",
        "isMandatory": true,
        "validationRules": {
          "mustBeReadable": true,
          "mustBeUnexpired": true,
          "mustMatchProfile": true
        }
      },
      {
        "documentType": "rental_contract",
        "isMandatory": true,
        "validationRules": {
          "mustBeReadable": true,
          "mustBeUnexpired": true
        }
      }
    ]
  }
}
```

---

### `POST /services`

Creates a government service.

Auth required. Admin only.

**Request**

```json
{
  "categoryId": "65b1c2d3e4f5a6b7c8d9e0f1",
  "serviceName": "Foreign Driving License Exchange",
  "slug": "foreign-driving-license-exchange",
  "description": "Apply to exchange a foreign driving license.",
  "estimatedDays": 10,
  "governmentFee": 700,
  "platformFee": 150,
  "currency": "EGP",
  "requiresAppointment": true,
  "competentOfficeType": "traffic_unit",
  "isActive": true,
  "requiredDocuments": [
    {
      "documentType": "passport",
      "isMandatory": true,
      "description": "Valid passport image"
    },
    {
      "documentType": "foreign_driving_license",
      "isMandatory": true,
      "description": "Valid foreign driving license"
    },
    {
      "documentType": "medical_certificate",
      "isMandatory": true,
      "description": "Medical certificate"
    }
  ]
}
```

**Response `201`**

```json
{
  "success": true,
  "data": {
    "_id": "65b2c3d4e5f6a7b8c9d0e1f3",
    "serviceName": "Foreign Driving License Exchange",
    "slug": "foreign-driving-license-exchange",
    "isActive": true,
    "createdAt": "2026-01-15T11:30:00Z"
  }
}
```

---

### `PATCH /services/:serviceId`

Updates a government service.

Auth required. Admin only.

**Request**

```json
{
  "estimatedDays": 8,
  "governmentFee": 750,
  "platformFee": 150,
  "isActive": true
}
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "_id": "65b2c3d4e5f6a7b8c9d0e1f3",
    "estimatedDays": 8,
    "governmentFee": 750,
    "platformFee": 150,
    "isActive": true,
    "updatedAt": "2026-01-16T10:00:00Z"
  }
}
```

---

## 5. AI Legal Assistant and RAG

### `POST /ai/conversations`

Starts a new AI conversation.

Auth required.

**Request**

```json
{
  "channel": "web",
  "language": "en"
}
```

**Response `201`**

```json
{
  "success": true,
  "data": {
    "_id": "65c1d2e3f4a5b6c7d8e9f0a1",
    "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
    "channel": "web",
    "language": "en",
    "startedAt": "2026-01-15T12:00:00Z"
  }
}
```

---

### `POST /ai/conversations/:conversationId/messages`

Sends a user message to the AI assistant and returns an evidence-based answer with retrieved legal context.

Auth required.

**Request**

```json
{
  "messageText": "Can I drive in Egypt using my Saudi driving license?",
  "inputType": "text",
  "language": "en"
}
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "userMessage": {
      "_id": "65c2d3e4f5a6b7c8d9e0f1a2",
      "conversationId": "65c1d2e3f4a5b6c7d8e9f0a1",
      "senderType": "user",
      "messageText": "Can I drive in Egypt using my Saudi driving license?",
      "inputType": "text",
      "createdAt": "2026-01-15T12:01:00Z"
    },
    "assistantMessage": {
      "_id": "65c2d3e4f5a6b7c8d9e0f1a3",
      "conversationId": "65c1d2e3f4a5b6c7d8e9f0a1",
      "senderType": "assistant",
      "messageText": "You may need to meet specific conditions before driving in Egypt with a foreign license. The platform can help you check eligibility and start the required service.",
      "answerConfidence": 0.91,
      "retrievals": [
        {
          "legalChunkId": "65d1e2f3a4b5c6d7e8f9a0b1",
          "sourceId": "65d0e1f2a3b4c5d6e7f8a9b0",
          "sourceTitle": "Traffic Regulations Reference",
          "articleRef": "Article 12",
          "similarityScore": 0.93,
          "rankPosition": 1,
          "sourceUrl": "https://example.com/legal-source"
        }
      ],
      "suggestedActions": [
        {
          "type": "start_service",
          "label": "Start service now",
          "serviceId": "65b2c3d4e5f6a7b8c9d0e1f3",
          "serviceName": "Foreign Driving License Exchange"
        }
      ],
      "createdAt": "2026-01-15T12:01:03Z"
    }
  }
}
```

---

### `POST /ai/conversations/:conversationId/voice-messages`

Uploads a voice message, transcribes it, and returns an AI response.

Auth required.

**Request `multipart/form-data`**

```text
voiceFile: <audio_file>
language: en
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "transcript": "I want to renew my tourist residence.",
    "userMessage": {
      "_id": "65c2d3e4f5a6b7c8d9e0f1a4",
      "senderType": "user",
      "inputType": "voice",
      "messageText": "I want to renew my tourist residence.",
      "createdAt": "2026-01-15T12:05:00Z"
    },
    "assistantMessage": {
      "_id": "65c2d3e4f5a6b7c8d9e0f1a5",
      "senderType": "assistant",
      "messageText": "You can start a tourist residence renewal application. The required documents are passport and rental contract.",
      "suggestedActions": [
        {
          "type": "start_service",
          "label": "Start service now",
          "serviceId": "65b2c3d4e5f6a7b8c9d0e1f2"
        }
      ],
      "createdAt": "2026-01-15T12:05:04Z"
    }
  }
}
```

---

### `GET /ai/conversations`

Returns the current user's AI conversations.

Auth required.

**Query Params**

```text
page=1&limit=20&channel=web
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "65c1d2e3f4a5b6c7d8e9f0a1",
        "channel": "web",
        "language": "en",
        "startedAt": "2026-01-15T12:00:00Z",
        "endedAt": null,
        "messageCount": 4,
        "lastMessageAt": "2026-01-15T12:05:04Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

---

### `GET /ai/conversations/:conversationId/messages`

Returns messages for one conversation.

Auth required.

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "_id": "65c2d3e4f5a6b7c8d9e0f1a2",
      "senderType": "user",
      "messageText": "Can I drive in Egypt using my Saudi driving license?",
      "inputType": "text",
      "createdAt": "2026-01-15T12:01:00Z"
    },
    {
      "_id": "65c2d3e4f5a6b7c8d9e0f1a3",
      "senderType": "assistant",
      "messageText": "You may need to meet specific conditions before driving in Egypt with a foreign license.",
      "answerConfidence": 0.91,
      "retrievals": [
        {
          "legalChunkId": "65d1e2f3a4b5c6d7e8f9a0b1",
          "sourceTitle": "Traffic Regulations Reference",
          "articleRef": "Article 12",
          "similarityScore": 0.93
        }
      ],
      "createdAt": "2026-01-15T12:01:03Z"
    }
  ]
}
```

---

### `PATCH /ai/conversations/:conversationId/close`

Closes a conversation.

Auth required.

**Response `200`**

```json
{
  "success": true,
  "data": {
    "_id": "65c1d2e3f4a5b6c7d8e9f0a1",
    "endedAt": "2026-01-15T12:30:00Z"
  }
}
```

---

## 6. Applications

### `POST /applications`

Creates a new service application. This can be created from the service page or from an AI suggested action.

Auth required.

**Request**

```json
{
  "serviceId": "65b2c3d4e5f6a7b8c9d0e1f2",
  "sourceConversationId": "65c1d2e3f4a5b6c7d8e9f0a1",
  "sourceMessageId": "65c2d3e4f5a6b7c8d9e0f1a3",
  "notes": "I want to complete the process as soon as possible."
}
```

**Response `201`**

```json
{
  "success": true,
  "data": {
    "_id": "65e1f2a3b4c5d6e7f8a9b0c1",
    "applicationNumber": "APP-2026-000001",
    "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
    "profileId": "65a1b2c3d4e5f6a7b8c9d0e1",
    "serviceId": "65b2c3d4e5f6a7b8c9d0e1f2",
    "service": {
      "serviceName": "Tourist Residence Renewal",
      "governmentFee": 500,
      "platformFee": 100,
      "currency": "EGP"
    },
    "status": "pending_documents",
    "currentStep": "document_upload",
    "requiredDocuments": [
      {
        "documentType": "passport",
        "isMandatory": true,
        "status": "missing"
      },
      {
        "documentType": "rental_contract",
        "isMandatory": true,
        "status": "missing"
      }
    ],
    "submittedDocuments": [],
    "statusHistory": [
      {
        "fromStatus": null,
        "toStatus": "pending_documents",
        "changedByUserId": "64f1a2b3c4d5e6f7a8b9c0d1",
        "reason": "Application created",
        "createdAt": "2026-01-15T13:00:00Z"
      }
    ],
    "createdAt": "2026-01-15T13:00:00Z"
  }
}
```

---

### `GET /applications`

Returns applications for the current user.

Auth required.

**Query Params**

```text
page=1&limit=10&status=pending_documents&serviceId=65b2c3d4e5f6a7b8c9d0e1f2
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "65e1f2a3b4c5d6e7f8a9b0c1",
        "applicationNumber": "APP-2026-000001",
        "service": {
          "serviceName": "Tourist Residence Renewal",
          "estimatedDays": 7
        },
        "status": "pending_documents",
        "currentStep": "document_upload",
        "progressPercent": 20,
        "createdAt": "2026-01-15T13:00:00Z",
        "updatedAt": "2026-01-15T13:00:00Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

### `GET /applications/:applicationId`

Returns application details.

Auth required.

**Response `200`**

```json
{
  "success": true,
  "data": {
    "_id": "65e1f2a3b4c5d6e7f8a9b0c1",
    "applicationNumber": "APP-2026-000001",
    "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
    "profileId": "65a1b2c3d4e5f6a7b8c9d0e1",
    "service": {
      "_id": "65b2c3d4e5f6a7b8c9d0e1f2",
      "serviceName": "Tourist Residence Renewal",
      "estimatedDays": 7,
      "governmentFee": 500,
      "platformFee": 100,
      "currency": "EGP"
    },
    "status": "under_review",
    "currentStep": "human_review",
    "aiVerificationSummary": {
      "overallStatus": "passed",
      "overallScore": 0.98,
      "matchedProfile": true,
      "issuesCount": 0,
      "completedAt": "2026-01-15T13:15:00Z"
    },
    "submittedDocuments": [
      {
        "_id": "65e2f3a4b5c6d7e8f9a0b1c2",
        "documentType": "passport",
        "fileUrl": "https://storage.example.com/applications/passport.jpg",
        "status": "verified",
        "aiValidation": {
          "ocrStatus": "completed",
          "confidenceScore": 0.99,
          "matchesProfile": true,
          "expiryDate": "2030-01-01",
          "rejectionReason": null
        },
        "uploadedAt": "2026-01-15T13:05:00Z"
      }
    ],
    "adminReview": {
      "reviewedByAdminId": "65f1a2b3c4d5e6f7a8b9c0d1",
      "decision": "approved",
      "notes": "AI verification is accepted.",
      "reviewedAt": "2026-01-15T14:00:00Z"
    },
    "paymentSummary": {
      "paymentId": "6601b2c3d4e5f6a7b8c9d0e1",
      "status": "pending",
      "totalAmount": 600,
      "currency": "EGP"
    },
    "appointmentSummary": null,
    "createdAt": "2026-01-15T13:00:00Z",
    "updatedAt": "2026-01-15T14:00:00Z"
  }
}
```

---

### `PATCH /applications/:applicationId/cancel`

Cancels an application if its current status allows cancellation.

Auth required.

**Request**

```json
{
  "reason": "I no longer need this service."
}
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "_id": "65e1f2a3b4c5d6e7f8a9b0c1",
    "status": "cancelled",
    "cancelledAt": "2026-01-15T15:00:00Z"
  }
}
```

---

### `GET /applications/admin/all`

Returns all applications for the admin dashboard.

Auth required. Admin or reviewer only.

**Query Params**

```text
page=1&limit=20&status=under_review&serviceId=65b2c3d4e5f6a7b8c9d0e1f2&city=Minya&riskLevel=low&fromDate=2026-01-01&toDate=2026-01-31
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "65e1f2a3b4c5d6e7f8a9b0c1",
        "applicationNumber": "APP-2026-000001",
        "user": {
          "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
          "firstName": "Ahmed",
          "lastName": "Hassan",
          "email": "ahmed@example.com"
        },
        "profile": {
          "currentNationality": "SA",
          "city": "Minya",
          "riskLevel": "low"
        },
        "service": {
          "serviceName": "Tourist Residence Renewal"
        },
        "status": "under_review",
        "currentStep": "human_review",
        "aiVerificationSummary": {
          "overallStatus": "passed",
          "overallScore": 0.98,
          "issuesCount": 0
        },
        "createdAt": "2026-01-15T13:00:00Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

---

## 7. Application Documents and AI Verification

### `POST /applications/:applicationId/documents`

Uploads a document for an application and starts OCR and validation.

Auth required.

**Request `multipart/form-data`**

```text
documentType: passport
file: <image_or_pdf_file>
```

**Response `201`**

```json
{
  "success": true,
  "data": {
    "_id": "65e2f3a4b5c6d7e8f9a0b1c2",
    "applicationId": "65e1f2a3b4c5d6e7f8a9b0c1",
    "documentType": "passport",
    "fileUrl": "https://storage.example.com/applications/passport.jpg",
    "status": "pending_ai_verification",
    "aiValidation": {
      "ocrStatus": "queued",
      "confidenceScore": null,
      "matchesProfile": null,
      "rejectionReason": null
    },
    "uploadedAt": "2026-01-15T13:05:00Z"
  }
}
```

---

### `GET /applications/:applicationId/documents`

Returns application documents.

Auth required.

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "_id": "65e2f3a4b5c6d7e8f9a0b1c2",
      "documentType": "passport",
      "fileUrl": "https://storage.example.com/applications/passport.jpg",
      "status": "verified",
      "aiValidation": {
        "ocrStatus": "completed",
        "extractedFields": {
          "fullName": "Ahmed Hassan",
          "passportNumberMasked": "A123****",
          "nationality": "SA",
          "expiryDate": "2030-01-01"
        },
        "confidenceScore": 0.99,
        "matchesProfile": true,
        "validationResult": "verified",
        "rejectionReason": null,
        "completedAt": "2026-01-15T13:15:00Z"
      },
      "uploadedAt": "2026-01-15T13:05:00Z"
    }
  ]
}
```

---

### `GET /applications/:applicationId/documents/:documentId`

Returns one application document.

Auth required.

**Response `200`**

```json
{
  "success": true,
  "data": {
    "_id": "65e2f3a4b5c6d7e8f9a0b1c2",
    "applicationId": "65e1f2a3b4c5d6e7f8a9b0c1",
    "documentType": "passport",
    "fileUrl": "https://storage.example.com/applications/passport.jpg",
    "status": "verified",
    "aiValidation": {
      "ocrStatus": "completed",
      "ocrTextPreview": "PASSPORT AHMED HASSAN...",
      "extractedFields": {
        "fullName": "Ahmed Hassan",
        "passportNumberMasked": "A123****",
        "nationality": "SA",
        "expiryDate": "2030-01-01"
      },
      "confidenceScore": 0.99,
      "matchesProfile": true,
      "validationChecks": [
        {
          "checkName": "document_readability",
          "status": "passed",
          "score": 0.99
        },
        {
          "checkName": "expiry_date_valid",
          "status": "passed",
          "score": 1
        },
        {
          "checkName": "profile_name_match",
          "status": "passed",
          "score": 0.98
        }
      ],
      "validationResult": "verified",
      "rejectionReason": null,
      "completedAt": "2026-01-15T13:15:00Z"
    },
    "uploadedAt": "2026-01-15T13:05:00Z"
  }
}
```

---

### `POST /applications/:applicationId/documents/:documentId/reprocess`

Re-runs OCR and validation for a document.

Auth required. Admin or document owner only.

**Request**

```json
{
  "reason": "User uploaded a clearer file."
}
```

**Response `202`**

```json
{
  "success": true,
  "data": {
    "documentId": "65e2f3a4b5c6d7e8f9a0b1c2",
    "status": "pending_ai_verification",
    "jobId": "job_01HZY7J8D4N5"
  }
}
```

---

### `GET /applications/:applicationId/ai-report`

Returns the AI verification report for an application.

Auth required. Admin, reviewer, or application owner.

**Response `200`**

```json
{
  "success": true,
  "data": {
    "applicationId": "65e1f2a3b4c5d6e7f8a9b0c1",
    "overallStatus": "passed",
    "overallScore": 0.98,
    "matchedProfile": true,
    "issues": [],
    "documents": [
      {
        "documentId": "65e2f3a4b5c6d7e8f9a0b1c2",
        "documentType": "passport",
        "status": "verified",
        "confidenceScore": 0.99,
        "checks": [
          {
            "checkName": "document_readability",
            "status": "passed",
            "score": 0.99
          },
          {
            "checkName": "profile_match",
            "status": "passed",
            "score": 0.98
          }
        ]
      }
    ],
    "completedAt": "2026-01-15T13:15:00Z"
  }
}
```

---

### `PATCH /applications/:applicationId/documents/:documentId/admin-review`

Allows an admin to override or confirm a document decision.

Auth required. Admin or reviewer only.

**Request**

```json
{
  "status": "verified",
  "comments": "Document reviewed and accepted.",
  "overrideAiDecision": false
}
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "documentId": "65e2f3a4b5c6d7e8f9a0b1c2",
    "status": "verified",
    "reviewedByAdminId": "65f1a2b3c4d5e6f7a8b9c0d1",
    "reviewedAt": "2026-01-15T14:00:00Z"
  }
}
```

---

## 8. Human Review and Escalation

### `PATCH /applications/:applicationId/admin/decision`

Final human decision after AI verification.

Auth required. Admin or reviewer only.

**Request**

```json
{
  "decision": "approve",
  "notes": "All documents are valid and AI verification score is high."
}
```

**Allowed `decision` values**

```text
approve
reject
escalate
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "_id": "65e1f2a3b4c5d6e7f8a9b0c1",
    "status": "pending_payment",
    "currentStep": "payment",
    "adminReview": {
      "reviewedByAdminId": "65f1a2b3c4d5e6f7a8b9c0d1",
      "decision": "approve",
      "notes": "All documents are valid and AI verification score is high.",
      "reviewedAt": "2026-01-15T14:00:00Z"
    },
    "updatedAt": "2026-01-15T14:00:00Z"
  }
}
```

---

### `POST /applications/:applicationId/escalations`

Creates an escalation record for a legally sensitive or unclear case.

Auth required. Admin or reviewer only.

**Request**

```json
{
  "reason": "Complex legal status requires senior review.",
  "priority": "high",
  "assignedToAdminId": "65f1a2b3c4d5e6f7a8b9c0d2"
}
```

**Response `201`**

```json
{
  "success": true,
  "data": {
    "_id": "65f9a0b1c2d3e4f5a6b7c8d9",
    "applicationId": "65e1f2a3b4c5d6e7f8a9b0c1",
    "reason": "Complex legal status requires senior review.",
    "priority": "high",
    "status": "open",
    "assignedToAdminId": "65f1a2b3c4d5e6f7a8b9c0d2",
    "createdAt": "2026-01-15T14:10:00Z"
  }
}
```

---

### `PATCH /escalations/:escalationId`

Updates an escalation.

Auth required. Admin or reviewer only.

**Request**

```json
{
  "status": "resolved",
  "resolutionNote": "Senior reviewer confirmed the application can proceed."
}
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "_id": "65f9a0b1c2d3e4f5a6b7c8d9",
    "status": "resolved",
    "resolutionNote": "Senior reviewer confirmed the application can proceed.",
    "resolvedAt": "2026-01-15T15:00:00Z"
  }
}
```

---

## 9. Payments

### `POST /applications/:applicationId/payments`

Creates a payment attempt for an approved application.

Auth required.

**Request**

```json
{
  "paymentGateway": "paymob",
  "currency": "EGP",
  "returnUrl": "https://app.example.com/applications/65e1f2a3b4c5d6e7f8a9b0c1/payment-result"
}
```

**Response `201`**

```json
{
  "success": true,
  "data": {
    "_id": "6601b2c3d4e5f6a7b8c9d0e1",
    "applicationId": "65e1f2a3b4c5d6e7f8a9b0c1",
    "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
    "governmentFeeAmount": 500,
    "platformFeeAmount": 100,
    "totalAmount": 600,
    "currency": "EGP",
    "paymentGateway": "paymob",
    "transactionRef": "PMB-2026-000001",
    "status": "pending",
    "paymentUrl": "https://payment.example.com/pay/token",
    "createdAt": "2026-01-15T14:05:00Z"
  }
}
```

---

### `GET /applications/:applicationId/payments`

Returns payment attempts for an application.

Auth required.

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "_id": "6601b2c3d4e5f6a7b8c9d0e1",
      "applicationId": "65e1f2a3b4c5d6e7f8a9b0c1",
      "governmentFeeAmount": 500,
      "platformFeeAmount": 100,
      "totalAmount": 600,
      "currency": "EGP",
      "paymentGateway": "paymob",
      "transactionRef": "PMB-2026-000001",
      "status": "paid",
      "paidAt": "2026-01-15T14:10:00Z"
    }
  ]
}
```

---

### `GET /payments/:paymentId`

Returns one payment.

Auth required.

**Response `200`**

```json
{
  "success": true,
  "data": {
    "_id": "6601b2c3d4e5f6a7b8c9d0e1",
    "applicationId": "65e1f2a3b4c5d6e7f8a9b0c1",
    "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
    "governmentFeeAmount": 500,
    "platformFeeAmount": 100,
    "totalAmount": 600,
    "currency": "EGP",
    "paymentGateway": "paymob",
    "transactionRef": "PMB-2026-000001",
    "status": "paid",
    "gatewayResponse": {
      "providerStatus": "success",
      "providerTransactionId": "provider-123"
    },
    "paidAt": "2026-01-15T14:10:00Z",
    "createdAt": "2026-01-15T14:05:00Z"
  }
}
```

---

### `POST /payments/webhook`

Receives payment gateway events.

Public endpoint. Must be secured by signature verification.

**Request**

```json
{
  "transactionRef": "PMB-2026-000001",
  "providerTransactionId": "provider-123",
  "status": "success",
  "amount": 600,
  "currency": "EGP",
  "signature": "sha256-hmac-signature"
}
```

**Response `200`**

```json
{
  "success": true,
  "message": "Webhook received"
}
```

---

### `POST /payments/:paymentId/refund`

Creates a refund request.

Auth required. Admin only.

**Request**

```json
{
  "amount": 600,
  "reason": "Application cancelled after payment."
}
```

**Response `202`**

```json
{
  "success": true,
  "data": {
    "paymentId": "6601b2c3d4e5f6a7b8c9d0e1",
    "refundStatus": "pending",
    "refundRef": "REF-2026-000001"
  }
}
```

---

## 10. Booking, Government Offices, and Appointments

### `GET /gov-offices`

Returns government offices.

Public endpoint.

**Query Params**

```text
city=Minya&officeType=passport_office&serviceId=65b2c3d4e5f6a7b8c9d0e1f2
```

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "_id": "6611c2d3e4f5a6b7c8d9e0f1",
      "officeName": "Minya Passport Office",
      "officeType": "passport_office",
      "city": "Minya",
      "address": "Example Government Complex, Minya",
      "latitude": 28.0871,
      "longitude": 30.7618,
      "supportedServiceIds": ["65b2c3d4e5f6a7b8c9d0e1f2"],
      "isActive": true
    }
  ]
}
```

---

### `POST /gov-offices`

Creates a government office.

Auth required. Admin only.

**Request**

```json
{
  "officeName": "Minya Passport Office",
  "officeType": "passport_office",
  "city": "Minya",
  "address": "Example Government Complex, Minya",
  "latitude": 28.0871,
  "longitude": 30.7618,
  "supportedServiceIds": ["65b2c3d4e5f6a7b8c9d0e1f2"],
  "isActive": true
}
```

**Response `201`**

```json
{
  "success": true,
  "data": {
    "_id": "6611c2d3e4f5a6b7c8d9e0f1",
    "officeName": "Minya Passport Office",
    "officeType": "passport_office",
    "city": "Minya",
    "isActive": true,
    "createdAt": "2026-01-15T15:00:00Z"
  }
}
```

---

### `GET /gov-offices/:officeId/slots`

Returns available appointment slots for an office.

Public endpoint.

**Query Params**

```text
serviceId=65b2c3d4e5f6a7b8c9d0e1f2&fromDate=2026-01-20&toDate=2026-01-30
```

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "_id": "6612d3e4f5a6b7c8d9e0f1a2",
      "govOfficeId": "6611c2d3e4f5a6b7c8d9e0f1",
      "serviceId": "65b2c3d4e5f6a7b8c9d0e1f2",
      "slotDateTime": "2026-01-22T09:00:00Z",
      "capacity": 10,
      "bookedCount": 3,
      "availableSpots": 7,
      "isAvailable": true
    }
  ]
}
```

---

### `POST /gov-offices/:officeId/slots`

Creates appointment slots.

Auth required. Admin only.

**Request**

```json
{
  "serviceId": "65b2c3d4e5f6a7b8c9d0e1f2",
  "slots": [
    {
      "slotDateTime": "2026-01-22T09:00:00Z",
      "capacity": 10
    },
    {
      "slotDateTime": "2026-01-22T10:00:00Z",
      "capacity": 10
    }
  ]
}
```

**Response `201`**

```json
{
  "success": true,
  "data": {
    "created": 2,
    "slots": [
      {
        "_id": "6612d3e4f5a6b7c8d9e0f1a2",
        "slotDateTime": "2026-01-22T09:00:00Z",
        "capacity": 10,
        "bookedCount": 0,
        "isAvailable": true
      }
    ]
  }
}
```

---

### `POST /applications/:applicationId/booking/auto`

Runs the booking agent after successful payment. The agent selects the nearest eligible office and books a slot.

Auth required.

**Request**

```json
{
  "preferredDateFrom": "2026-01-22",
  "preferredDateTo": "2026-01-30",
  "preferredCity": "Minya"
}
```

**Response `201`**

```json
{
  "success": true,
  "data": {
    "appointment": {
      "_id": "6613e4f5a6b7c8d9e0f1a2b3",
      "applicationId": "65e1f2a3b4c5d6e7f8a9b0c1",
      "slotId": "6612d3e4f5a6b7c8d9e0f1a2",
      "govOfficeId": "6611c2d3e4f5a6b7c8d9e0f1",
      "appointmentDate": "2026-01-22T09:00:00Z",
      "status": "scheduled",
      "qrCodeUrl": "https://storage.example.com/qrcodes/appointment-001.png",
      "instructions": [
        "Arrive 15 minutes before the appointment time.",
        "Bring the original passport and uploaded documents.",
        "Show the QR code at the reception desk."
      ]
    },
    "application": {
      "_id": "65e1f2a3b4c5d6e7f8a9b0c1",
      "status": "completed",
      "currentStep": "appointment_scheduled"
    }
  }
}
```

---

### `POST /applications/:applicationId/appointments`

Books a specific slot manually.

Auth required.

**Request**

```json
{
  "slotId": "6612d3e4f5a6b7c8d9e0f1a2"
}
```

**Response `201`**

```json
{
  "success": true,
  "data": {
    "_id": "6613e4f5a6b7c8d9e0f1a2b3",
    "applicationId": "65e1f2a3b4c5d6e7f8a9b0c1",
    "slotId": "6612d3e4f5a6b7c8d9e0f1a2",
    "govOfficeId": "6611c2d3e4f5a6b7c8d9e0f1",
    "govOffice": {
      "officeName": "Minya Passport Office",
      "address": "Example Government Complex, Minya"
    },
    "appointmentDate": "2026-01-22T09:00:00Z",
    "qrCodeUrl": "https://storage.example.com/qrcodes/appointment-001.png",
    "status": "scheduled"
  }
}
```

---

### `GET /applications/:applicationId/appointments`

Returns appointment details for an application.

Auth required.

**Response `200`**

```json
{
  "success": true,
  "data": {
    "_id": "6613e4f5a6b7c8d9e0f1a2b3",
    "applicationId": "65e1f2a3b4c5d6e7f8a9b0c1",
    "appointmentDate": "2026-01-22T09:00:00Z",
    "status": "scheduled",
    "qrCodeUrl": "https://storage.example.com/qrcodes/appointment-001.png",
    "instructions": [
      "Arrive 15 minutes before the appointment time.",
      "Bring the original passport and uploaded documents.",
      "Show the QR code at the reception desk."
    ],
    "govOffice": {
      "officeName": "Minya Passport Office",
      "officeType": "passport_office",
      "city": "Minya",
      "address": "Example Government Complex, Minya",
      "latitude": 28.0871,
      "longitude": 30.7618
    }
  }
}
```

---

### `PATCH /applications/:applicationId/appointments/:appointmentId`

Reschedules or cancels an appointment.

Auth required.

**Request**

```json
{
  "action": "reschedule",
  "newSlotId": "6612d3e4f5a6b7c8d9e0f1a5",
  "reason": "The selected time is no longer suitable."
}
```

**Allowed `action` values**

```text
reschedule
cancel
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "_id": "6613e4f5a6b7c8d9e0f1a2b3",
    "appointmentDate": "2026-01-24T11:00:00Z",
    "status": "rescheduled",
    "qrCodeUrl": "https://storage.example.com/qrcodes/appointment-001.png"
  }
}
```

---

## 11. Notifications

### `GET /notifications`

Returns notifications for the current user.

Auth required.

**Query Params**

```text
page=1&limit=20&isRead=false&type=application_update
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "6621d2e3f4a5b6c7d8e9f0a1",
        "title": "Document verified",
        "message": "Your passport document has been verified successfully.",
        "type": "document_update",
        "channel": "in_app",
        "deliveryStatus": "sent",
        "isRead": false,
        "relatedEntity": {
          "entityType": "application",
          "entityId": "65e1f2a3b4c5d6e7f8a9b0c1"
        },
        "createdAt": "2026-01-15T13:15:00Z"
      }
    ],
    "unreadCount": 3,
    "pagination": {
      "total": 10,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

---

### `PATCH /notifications/:notificationId/read`

Marks a notification as read.

Auth required.

**Response `200`**

```json
{
  "success": true,
  "data": {
    "_id": "6621d2e3f4a5b6c7d8e9f0a1",
    "isRead": true,
    "readAt": "2026-01-15T16:00:00Z"
  }
}
```

---

### `PATCH /notifications/read-all`

Marks all notifications as read.

Auth required.

**Response `200`**

```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## 12. Complaints and Support

### `POST /complaints`

Creates a complaint or support ticket.

Auth required.

**Request**

```json
{
  "relatedApplicationId": "65e1f2a3b4c5d6e7f8a9b0c1",
  "title": "Delayed processing",
  "description": "My application has been under review for a long time."
}
```

**Response `201`**

```json
{
  "success": true,
  "data": {
    "_id": "6631e2f3a4b5c6d7e8f9a0b1",
    "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
    "relatedApplicationId": "65e1f2a3b4c5d6e7f8a9b0c1",
    "title": "Delayed processing",
    "description": "My application has been under review for a long time.",
    "status": "open",
    "createdAt": "2026-01-15T16:30:00Z"
  }
}
```

---

### `GET /complaints`

Returns complaints for the current user.

Auth required.

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "_id": "6631e2f3a4b5c6d7e8f9a0b1",
      "title": "Delayed processing",
      "status": "open",
      "createdAt": "2026-01-15T16:30:00Z",
      "relatedApplication": {
        "applicationNumber": "APP-2026-000001",
        "serviceName": "Tourist Residence Renewal"
      }
    }
  ]
}
```

---

### `GET /complaints/admin/all`

Returns all complaints for admins.

Auth required. Admin only.

**Query Params**

```text
page=1&limit=20&status=open&assignedToAdminId=65f1a2b3c4d5e6f7a8b9c0d1
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "6631e2f3a4b5c6d7e8f9a0b1",
        "user": {
          "firstName": "Ahmed",
          "lastName": "Hassan",
          "email": "ahmed@example.com"
        },
        "title": "Delayed processing",
        "status": "open",
        "createdAt": "2026-01-15T16:30:00Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

---

### `PATCH /complaints/:complaintId`

Updates complaint status.

Auth required. Admin only.

**Request**

```json
{
  "status": "resolved",
  "assignedToAdminId": "65f1a2b3c4d5e6f7a8b9c0d1",
  "resolutionNote": "The issue has been resolved."
}
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "_id": "6631e2f3a4b5c6d7e8f9a0b1",
    "status": "resolved",
    "assignedToAdminId": "65f1a2b3c4d5e6f7a8b9c0d1",
    "resolutionNote": "The issue has been resolved.",
    "updatedAt": "2026-01-16T09:00:00Z"
  }
}
```

---

## 13. Admin Users and Roles

### `GET /users`

Returns platform users.

Auth required. Admin only.

**Query Params**

```text
page=1&limit=20&status=active&role=foreigner&search=ahmed
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
        "firstName": "Ahmed",
        "lastName": "Hassan",
        "email": "ahmed@example.com",
        "phoneNumber": "+201012345678",
        "accountStatus": "active",
        "roles": ["foreigner"],
        "onboardingStatus": "completed",
        "createdAt": "2026-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

---

### `PATCH /users/:userId/status`

Updates a user account status.

Auth required. Admin only.

**Request**

```json
{
  "accountStatus": "suspended",
  "reason": "Suspicious activity detected."
}
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "accountStatus": "suspended",
    "updatedAt": "2026-01-16T10:00:00Z"
  }
}
```

---

### `PATCH /users/:userId/roles`

Replaces user roles.

Auth required. Admin only.

**Request**

```json
{
  "roles": ["foreigner", "reviewer"]
}
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "roles": ["foreigner", "reviewer"],
    "updatedAt": "2026-01-16T10:10:00Z"
  }
}
```

---

### `PATCH /users/:userId/admin-profile`

Creates or updates the admin profile embedded in the user document.

Auth required. Super admin only.

**Request**

```json
{
  "department": "Residency Review",
  "adminLevel": "reviewer",
  "permissions": [
    "applications.read",
    "applications.review",
    "documents.review"
  ]
}
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
    "roles": ["reviewer"],
    "adminProfile": {
      "department": "Residency Review",
      "adminLevel": "reviewer",
      "permissions": [
        "applications.read",
        "applications.review",
        "documents.review"
      ]
    },
    "updatedAt": "2026-01-16T10:20:00Z"
  }
}
```

---

## 14. Legal Sources and Vector Indexing

### `GET /legal-sources`

Returns legal sources.

Auth required. Admin only.

**Query Params**

```text
page=1&limit=20&lawCategory=traffic&status=indexed
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "65d0e1f2a3b4c5d6e7f8a9b0",
        "title": "Traffic Regulations Reference",
        "lawCategory": "traffic",
        "issuingAuthority": "Ministry of Interior",
        "sourceUrl": "https://example.com/legal-source",
        "effectiveDate": "2025-01-01",
        "version": "1.0",
        "status": "indexed",
        "chunksCount": 120,
        "createdAt": "2026-01-10T09:00:00Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

---

### `POST /legal-sources`

Uploads a legal source and starts chunking and vector indexing.

Auth required. Admin only.

**Request `multipart/form-data`**

```text
title: Traffic Regulations Reference
lawCategory: traffic
issuingAuthority: Ministry of Interior
sourceUrl: https://example.com/legal-source
effectiveDate: 2025-01-01
version: 1.0
documentFile: <pdf_file>
```

**Response `202`**

```json
{
  "success": true,
  "data": {
    "_id": "65d0e1f2a3b4c5d6e7f8a9b0",
    "title": "Traffic Regulations Reference",
    "status": "processing",
    "indexingJobId": "job_01HZVECTOR001",
    "createdAt": "2026-01-10T09:00:00Z"
  }
}
```

---

### `GET /legal-sources/:sourceId/chunks`

Returns chunks for a legal source.

Auth required. Admin only.

**Query Params**

```text
page=1&limit=50
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "65d1e2f3a4b5c6d7e8f9a0b1",
        "legalSourceId": "65d0e1f2a3b4c5d6e7f8a9b0",
        "chunkTextPreview": "Foreign driving license requirements and restrictions...",
        "articleRef": "Article 12",
        "chunkIndex": 1,
        "embeddingId": "vec_traffic_000001",
        "vectorStoreName": "legal_sources_prod"
      }
    ],
    "pagination": {
      "total": 120,
      "page": 1,
      "limit": 50,
      "totalPages": 3
    }
  }
}
```

---

### `POST /legal-sources/:sourceId/reindex`

Rebuilds chunks and vector embeddings for a legal source.

Auth required. Admin only.

**Request**

```json
{
  "reason": "Legal source was updated."
}
```

**Response `202`**

```json
{
  "success": true,
  "data": {
    "sourceId": "65d0e1f2a3b4c5d6e7f8a9b0",
    "status": "processing",
    "indexingJobId": "job_01HZVECTOR002"
  }
}
```

---

## 15. Audit Logs

### `GET /audit-logs`

Returns audit logs.

Auth required. Admin only.

**Query Params**

```text
entityType=application&entityId=65e1f2a3b4c5d6e7f8a9b0c1&actorUserId=65f1a2b3c4d5e6f7a8b9c0d1&action=status_change&fromDate=2026-01-01&toDate=2026-01-31&page=1&limit=50
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "6641f2a3b4c5d6e7f8a9b0c1",
        "entityType": "application",
        "entityId": "65e1f2a3b4c5d6e7f8a9b0c1",
        "actorUserId": "65f1a2b3c4d5e6f7a8b9c0d1",
        "actorRole": "reviewer",
        "action": "status_change",
        "previousState": {
          "status": "under_review"
        },
        "newState": {
          "status": "pending_payment"
        },
        "ipAddress": "192.0.2.10",
        "userAgent": "Mozilla/5.0",
        "createdAt": "2026-01-15T14:00:00Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 50,
      "totalPages": 1
    }
  }
}
```

---

## 16. MongoDB Collections Summary

### `users`

Stores account data, login identity, roles, and optional admin profile.

```json
{
  "_id": "ObjectId",
  "firstName": "String",
  "lastName": "String",
  "email": "String",
  "phoneNumber": "String",
  "passwordHash": "String",
  "emailVerified": "Boolean",
  "emailVerifiedAt": "Date",
  "preferredLanguage": "String",
  "profileImageUrl": "String",
  "accountStatus": "String",
  "roles": ["String"],
  "adminProfile": {
    "department": "String",
    "adminLevel": "String",
    "permissions": ["String"]
  },
  "onboardingStatus": "String",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### `profiles`

Stores sensitive foreigner identity profile data.

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "passportNumberEncrypted": "String",
  "passportNumberHash": "String",
  "passportNumberMasked": "String",
  "currentNationality": "String",
  "dateOfBirth": "Date",
  "gender": "String",
  "entryDate": "Date",
  "currentResidencyType": "String",
  "currentResidencyExpiryDate": "Date",
  "address": "Object",
  "emergencyContact": "Object",
  "profileStatus": "String",
  "riskLevel": "String",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### `services`

Stores government service definitions and embedded required document rules.

```json
{
  "_id": "ObjectId",
  "categoryId": "ObjectId",
  "serviceName": "String",
  "slug": "String",
  "description": "String",
  "estimatedDays": "Number",
  "governmentFee": "Number",
  "platformFee": "Number",
  "currency": "String",
  "requiresAppointment": "Boolean",
  "competentOfficeType": "String",
  "isActive": "Boolean",
  "requiredDocuments": [
    {
      "documentType": "String",
      "isMandatory": "Boolean",
      "description": "String",
      "validationRules": "Object"
    }
  ],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### `applications`

Main workflow collection. Stores embedded documents, status history, AI summary, admin review, and summaries for payment and appointment.

```json
{
  "_id": "ObjectId",
  "applicationNumber": "String",
  "userId": "ObjectId",
  "profileId": "ObjectId",
  "serviceId": "ObjectId",
  "status": "String",
  "currentStep": "String",
  "sourceConversationId": "ObjectId",
  "sourceMessageId": "ObjectId",
  "requiredDocuments": ["Object"],
  "submittedDocuments": ["Object"],
  "aiVerificationSummary": "Object",
  "adminReview": "Object",
  "paymentSummary": "Object",
  "appointmentSummary": "Object",
  "statusHistory": ["Object"],
  "notes": "String",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### `payments`

Stores payment attempts. One application can have multiple payment records.

```json
{
  "_id": "ObjectId",
  "applicationId": "ObjectId",
  "userId": "ObjectId",
  "governmentFeeAmount": "Number",
  "platformFeeAmount": "Number",
  "totalAmount": "Number",
  "currency": "String",
  "paymentGateway": "String",
  "transactionRef": "String",
  "status": "String",
  "gatewayResponse": "Object",
  "failureReason": "String",
  "paidAt": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### `appointments`

Stores booked appointments.

```json
{
  "_id": "ObjectId",
  "applicationId": "ObjectId",
  "userId": "ObjectId",
  "slotId": "ObjectId",
  "govOfficeId": "ObjectId",
  "appointmentDate": "Date",
  "qrCodeUrl": "String",
  "instructions": ["String"],
  "status": "String",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### `appointment_slots`

Stores available capacity for government offices.

```json
{
  "_id": "ObjectId",
  "govOfficeId": "ObjectId",
  "serviceId": "ObjectId",
  "slotDateTime": "Date",
  "capacity": "Number",
  "bookedCount": "Number",
  "isAvailable": "Boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### `ai_conversations`

Stores chat sessions.

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "channel": "String",
  "language": "String",
  "startedAt": "Date",
  "endedAt": "Date",
  "lastMessageAt": "Date"
}
```

### `ai_messages`

Stores chat messages and embedded RAG retrievals.

```json
{
  "_id": "ObjectId",
  "conversationId": "ObjectId",
  "userId": "ObjectId",
  "senderType": "String",
  "messageText": "String",
  "inputType": "String",
  "answerConfidence": "Number",
  "retrievals": ["Object"],
  "suggestedActions": ["Object"],
  "createdAt": "Date"
}
```

### `legal_sources`

Stores legal source metadata.

```json
{
  "_id": "ObjectId",
  "title": "String",
  "lawCategory": "String",
  "issuingAuthority": "String",
  "sourceUrl": "String",
  "effectiveDate": "Date",
  "version": "String",
  "status": "String",
  "chunksCount": "Number",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### `legal_chunks`

Stores text chunks and vector index references.

```json
{
  "_id": "ObjectId",
  "legalSourceId": "ObjectId",
  "chunkText": "String",
  "articleRef": "String",
  "chunkIndex": "Number",
  "embeddingId": "String",
  "vectorStoreName": "String",
  "createdAt": "Date"
}
```

---

## 17. Recommended Indexes

```javascript
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ phoneNumber: 1 }, { unique: true });
db.users.createIndex({ roles: 1, accountStatus: 1 });

db.profiles.createIndex({ userId: 1 }, { unique: true });
db.profiles.createIndex({ passportNumberHash: 1 }, { unique: true });
db.profiles.createIndex({ currentNationality: 1 });
db.profiles.createIndex({ "address.city": 1 });

db.services.createIndex({ slug: 1 }, { unique: true });
db.services.createIndex({ categoryId: 1, isActive: 1 });
db.services.createIndex({ serviceName: "text", description: "text" });

db.applications.createIndex({ applicationNumber: 1 }, { unique: true });
db.applications.createIndex({ userId: 1, createdAt: -1 });
db.applications.createIndex({ serviceId: 1, status: 1 });
db.applications.createIndex({ status: 1, currentStep: 1 });
db.applications.createIndex({ "submittedDocuments.status": 1 });
db.applications.createIndex({ "aiVerificationSummary.overallStatus": 1 });

db.payments.createIndex({ transactionRef: 1 }, { unique: true });
db.payments.createIndex({ applicationId: 1, createdAt: -1 });
db.payments.createIndex({ userId: 1, status: 1 });

db.gov_offices.createIndex({ city: 1, officeType: 1 });
db.gov_offices.createIndex({ location: "2dsphere" });

db.appointment_slots.createIndex({ govOfficeId: 1, serviceId: 1, slotDateTime: 1 });
db.appointment_slots.createIndex({ slotDateTime: 1, isAvailable: 1 });

db.appointments.createIndex({ applicationId: 1 }, { unique: true });
db.appointments.createIndex({ userId: 1, appointmentDate: -1 });
db.appointments.createIndex({ slotId: 1 });

db.ai_conversations.createIndex({ userId: 1, startedAt: -1 });
db.ai_messages.createIndex({ conversationId: 1, createdAt: 1 });

db.legal_sources.createIndex({ lawCategory: 1, status: 1 });
db.legal_chunks.createIndex({ legalSourceId: 1, chunkIndex: 1 });

db.notifications.createIndex({ userId: 1, isRead: 1, createdAt: -1 });
db.audit_logs.createIndex({ entityType: 1, entityId: 1, createdAt: -1 });
db.audit_logs.createIndex({ actorUserId: 1, createdAt: -1 });
```

---

## 18. Status Flows

### Application Status

```text
pending_documents -> ai_document_verification -> under_review -> pending_payment -> booking -> completed
pending_documents -> cancelled
ai_document_verification -> pending_documents
under_review -> rejected
under_review -> escalated -> under_review
pending_payment -> payment_failed -> pending_payment
booking -> completed
```

### Document Status

```text
pending_ai_verification -> verified
pending_ai_verification -> rejected
rejected -> pending_ai_verification
verified -> admin_overridden
```

### Payment Status

```text
pending -> paid
pending -> failed
paid -> refunded
```

### Appointment Status

```text
scheduled -> completed
scheduled -> cancelled
scheduled -> rescheduled -> scheduled
```

### Escalation Status

```text
open -> in_progress -> resolved
open -> closed
```

### Complaint Status

```text
open -> in_progress -> resolved -> closed
```

---

## 19. Common Error Codes

| Code | Meaning |
|---|---|
| `VALIDATION_ERROR` | Required field is missing or invalid. |
| `UNAUTHORIZED` | Missing or invalid access token. |
| `FORBIDDEN` | User does not have enough permissions. |
| `NOT_FOUND` | Resource was not found. |
| `DUPLICATE_ENTRY` | Resource already exists. |
| `PROFILE_REQUIRED` | User must complete the digital identity profile first. |
| `EMAIL_NOT_VERIFIED` | Email address must be verified first. |
| `INVALID_OBJECT_ID` | MongoDB ObjectId value is invalid. |
| `DOCUMENT_EXPIRED` | Uploaded document is expired. |
| `DOCUMENT_UNREADABLE` | OCR could not read the uploaded document. |
| `DOCUMENT_PROFILE_MISMATCH` | Extracted document data does not match the user profile. |
| `AI_VERIFICATION_PENDING` | AI verification has not completed yet. |
| `HUMAN_REVIEW_REQUIRED` | Human review is required before proceeding. |
| `INVALID_STATUS_TRANSITION` | The requested status transition is not allowed. |
| `PAYMENT_REQUIRED` | Payment is required before booking. |
| `PAYMENT_FAILED` | Payment gateway returned a failed status. |
| `SLOT_FULL` | Selected appointment slot is full. |
| `NO_ELIGIBLE_OFFICE_FOUND` | Booking agent could not find an eligible government office. |
| `APPLICATION_NOT_CANCELLABLE` | Application cannot be cancelled in its current status. |
| `RATE_LIMITED` | Too many requests. |
| `INTERNAL_SERVER_ERROR` | Unexpected server error. |

---

## Notes for Backend Implementation

- Store sensitive passport data encrypted or hashed. Never return raw passport numbers in normal API responses.
- Use atomic updates or transactions for appointment slot booking to prevent overbooking.
- Use signed URLs for private document files when possible.
- Verify payment webhook signatures before updating payment status.
- Store AI retrieval citations with every assistant answer for traceability.
- Use audit logs for every admin action, status change, document decision, payment update, and booking action.
- The vector store can be MongoDB Atlas Vector Search, Pinecone, Milvus, Qdrant, or another supported vector database.
