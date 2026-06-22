# API Documentation — Government Services Platform

> **Base URL:** `https://api.yourplatform.com/v1`
> **Auth:** Bearer JWT token in `Authorization` header (except login/register)
> **Content-Type:** `application/json`
> **Date format:** ISO 8601 — `2025-01-15T10:30:00Z`

---

## Table of Contents

1. [Auth](#1-auth)
2. [Users](#2-users)
3. [Identity Documents](#3-identity-documents)
4. [Roles & Admins](#4-roles--admins)
5. [Service Categories & Government Services](#5-service-categories--government-services)
6. [Service Requests](#6-service-requests)
7. [Request Documents](#7-request-documents)
8. [Payments](#8-payments)
9. [Appointments & Gov Offices](#9-appointments--gov-offices)
10. [Complaints](#10-complaints)
11. [Notifications](#11-notifications)
12. [AI Assistant (RAG)](#12-ai-assistant-rag)
13. [Audit Logs](#13-audit-logs)
14. [Common Responses](#14-common-responses)

---

## 1. Auth

### `POST /auth/register`

تسجيل مستخدم جديد.

**Request**
```json
{
  "firstName": "Ahmed",
  "lastName": "Hassan",
  "email": "ahmed@example.com",
  "phoneNumber": "+201012345678",
  "password": "StrongPass123!",
  "nationality": "EG",
  "dateOfBirth": "1990-05-15",
  "gender": "male",
  "preferredLanguage": "ar"
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
      "nationality": "EG",
      "dateOfBirth": "1990-05-15",
      "gender": "male",
      "preferredLanguage": "ar",
      "accountStatus": "active",
      "createdAt": "2025-01-15T10:00:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
  }
}
```

---

### `POST /auth/login`

تسجيل الدخول.

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
      "accountStatus": "active",
      "preferredLanguage": "ar"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
  }
}
```

---

### `POST /auth/refresh-token`

تجديد الـ access token.

**Request**
```json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
}
```

**Response `200`**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "bmV3UmVmcmVzaFRva2Vu..."
  }
}
```

---

### `POST /auth/logout`

🔒 **Auth required**

**Request** _(body فاضي)_

**Response `200`**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### `POST /auth/forgot-password`

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

**Request**
```json
{
  "token": "reset-token-from-email",
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

## 2. Users

### `GET /users/me`

🔒 **Auth required**

الحصول على بيانات المستخدم الحالي.

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
    "nationality": "EG",
    "dateOfBirth": "1990-05-15",
    "gender": "male",
    "preferredLanguage": "ar",
    "profileImageUrl": "https://storage.example.com/profiles/ahmed.jpg",
    "accountStatus": "active",
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-06-01T08:00:00Z"
  }
}
```

---

### `PATCH /users/me`

🔒 **Auth required**

تعديل بيانات المستخدم (partial update).

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
    "email": "ahmed@example.com",
    "phoneNumber": "+201098765432",
    "preferredLanguage": "en",
    "updatedAt": "2025-06-15T12:00:00Z"
  }
}
```

---

### `POST /users/me/profile-image`

🔒 **Auth required**

رفع صورة البروفايل.

**Request** `multipart/form-data`
```
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

### `PATCH /users/me/change-password`

🔒 **Auth required**

**Request**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}
```

**Response `200`**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### `GET /users` _(Admin only)_

🔒 **Auth required — Admin**

قائمة المستخدمين مع pagination وفلترة.

**Query Params**
```
page=1&limit=20&status=active&search=ahmed&nationality=EG
```

**Response `200`**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
        "firstName": "Ahmed",
        "lastName": "Hassan",
        "email": "ahmed@example.com",
        "accountStatus": "active",
        "nationality": "EG",
        "createdAt": "2025-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "totalPages": 8
    }
  }
}
```

---

### `PATCH /users/:userId/status` _(Admin only)_

🔒 **Auth required — Admin**

تغيير حالة المستخدم (تفعيل / إيقاف).

**Request**
```json
{
  "status": "suspended",
  "reason": "Violation of terms"
}
```

**Response `200`**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "accountStatus": "suspended"
  }
}
```

---

## 3. Identity Documents

### `POST /identity-documents`

🔒 **Auth required**

رفع وثيقة هوية جديدة.

**Request** `multipart/form-data`
```
documentType: national_id          (national_id | passport | birth_certificate | driving_license)
documentNumber: 29005151234567
issueDate: 2020-01-01
expiryDate: 2030-01-01
documentFile: <file>
```

**Response `201`**
```json
{
  "success": true,
  "data": {
    "_id": "64f2b3c4d5e6f7a8b9c0d2e3",
    "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
    "documentType": "national_id",
    "documentNumber": "29005151234567",
    "issueDate": "2020-01-01",
    "expiryDate": "2030-01-01",
    "documentFileUrl": "https://storage.example.com/docs/id-123.jpg",
    "verificationStatus": "pending",
    "createdAt": "2025-06-15T10:00:00Z"
  }
}
```

---

### `GET /identity-documents`

🔒 **Auth required**

الحصول على كل وثائق المستخدم الحالي.

**Response `200`**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f2b3c4d5e6f7a8b9c0d2e3",
      "documentType": "national_id",
      "documentNumber": "29005151234567",
      "issueDate": "2020-01-01",
      "expiryDate": "2030-01-01",
      "documentFileUrl": "https://storage.example.com/docs/id-123.jpg",
      "verificationStatus": "verified",
      "createdAt": "2025-06-15T10:00:00Z",
      "verification": {
        "confidenceScore": 0.97,
        "matchesProfile": true,
        "verificationResult": "approved",
        "verifiedAt": "2025-06-15T10:05:00Z"
      }
    }
  ]
}
```

---

### `GET /identity-documents/:documentId`

🔒 **Auth required**

**Response `200`**
```json
{
  "success": true,
  "data": {
    "_id": "64f2b3c4d5e6f7a8b9c0d2e3",
    "documentType": "national_id",
    "documentNumber": "29005151234567",
    "issueDate": "2020-01-01",
    "expiryDate": "2030-01-01",
    "documentFileUrl": "https://storage.example.com/docs/id-123.jpg",
    "verificationStatus": "verified",
    "createdAt": "2025-06-15T10:00:00Z",
    "verification": {
      "_id": "64f3c4d5e6f7a8b9c0d3e4f5",
      "ocrText": "AHMED HASSAN MOHAMED ...",
      "extractedFields": {
        "name": "Ahmed Hassan Mohamed",
        "nationalId": "29005151234567",
        "dateOfBirth": "1990-05-15",
        "expiryDate": "2030-01-01"
      },
      "confidenceScore": 0.97,
      "matchesProfile": true,
      "verificationResult": "approved",
      "notes": null,
      "verifiedAt": "2025-06-15T10:05:00Z"
    }
  }
}
```

---

### `DELETE /identity-documents/:documentId`

🔒 **Auth required**

حذف وثيقة (فقط لو مش مربوطة بطلب نشط).

**Response `200`**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

---

### `POST /identity-documents/:documentId/verify` _(Admin only)_

🔒 **Auth required — Admin**

مراجعة ووثيقة يدوياً.

**Request**
```json
{
  "verificationResult": "approved",
  "notes": "Document is clear and matches profile"
}
```

**Response `200`**
```json
{
  "success": true,
  "data": {
    "documentId": "64f2b3c4d5e6f7a8b9c0d2e3",
    "verificationResult": "approved",
    "verifiedAt": "2025-06-15T11:00:00Z"
  }
}
```

---

## 4. Roles & Admins

### `GET /roles` _(Admin only)_

🔒 **Auth required — Admin**

**Response `200`**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f4d5e6f7a8b9c0d4e5f6a7",
      "roleName": "admin",
      "description": "Full system access"
    },
    {
      "_id": "64f4d5e6f7a8b9c0d4e5f6a8",
      "roleName": "reviewer",
      "description": "Can review and approve service requests"
    },
    {
      "_id": "64f4d5e6f7a8b9c0d4e5f6a9",
      "roleName": "citizen",
      "description": "Regular platform user"
    }
  ]
}
```

---

### `POST /users/:userId/roles` _(Admin only)_

🔒 **Auth required — Admin**

تعيين دور لمستخدم.

**Request**
```json
{
  "roleId": "64f4d5e6f7a8b9c0d4e5f6a8"
}
```

**Response `201`**
```json
{
  "success": true,
  "data": {
    "_id": "64f5e6f7a8b9c0d5e6f7a8b9",
    "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
    "roleId": "64f4d5e6f7a8b9c0d4e5f6a8",
    "assignedAt": "2025-06-15T12:00:00Z"
  }
}
```

---

### `DELETE /users/:userId/roles/:roleId` _(Admin only)_

🔒 **Auth required — Admin**

**Response `200`**
```json
{
  "success": true,
  "message": "Role removed from user"
}
```

---

### `GET /admins` _(Admin only)_

🔒 **Auth required — Admin**

**Response `200`**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f6f7a8b9c0d6e7f8a9b0c1",
      "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
      "user": {
        "firstName": "Sara",
        "lastName": "Ali",
        "email": "sara@gov.eg"
      },
      "department": "Civil Affairs",
      "adminLevel": "supervisor"
    }
  ]
}
```

---

### `POST /admins` _(Admin only)_

🔒 **Auth required — Admin**

ترقية مستخدم لـ admin.

**Request**
```json
{
  "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
  "department": "Civil Affairs",
  "adminLevel": "reviewer"
}
```

**Response `201`**
```json
{
  "success": true,
  "data": {
    "_id": "64f6f7a8b9c0d6e7f8a9b0c1",
    "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
    "department": "Civil Affairs",
    "adminLevel": "reviewer"
  }
}
```

---

## 5. Service Categories & Government Services

### `GET /service-categories`

الحصول على كل التصنيفات.

**Response `200`**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f7a8b9c0d7e8f9a0b1c2d3",
      "categoryName": "Civil Status"
    },
    {
      "_id": "64f7a8b9c0d7e8f9a0b1c2d4",
      "categoryName": "Driving & Vehicles"
    },
    {
      "_id": "64f7a8b9c0d7e8f9a0b1c2d5",
      "categoryName": "Business Registration"
    }
  ]
}
```

---

### `POST /service-categories` _(Admin only)_

🔒 **Auth required — Admin**

**Request**
```json
{
  "categoryName": "Real Estate"
}
```

**Response `201`**
```json
{
  "success": true,
  "data": {
    "_id": "64f7a8b9c0d7e8f9a0b1c2d6",
    "categoryName": "Real Estate"
  }
}
```

---

### `GET /government-services`

الحصول على كل الخدمات مع فلترة.

**Query Params**
```
categoryId=64f7a8b9c0d7e8f9a0b1c2d3&isActive=true&search=passport
```

**Response `200`**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8b9c0d8e9f0a1b2c3d4e5",
      "categoryId": "64f7a8b9c0d7e8f9a0b1c2d3",
      "category": {
        "categoryName": "Civil Status"
      },
      "serviceName": "Passport Renewal",
      "description": "Renew your Egyptian passport",
      "estimatedDays": 7,
      "governmentFee": 300,
      "platformFee": 50,
      "availableOnline": true,
      "isActive": true,
      "requiredDocuments": [
        {
          "_id": "64f9c0d1e2f3a4b5c6d7e8f9",
          "documentType": "national_id",
          "isMandatory": true
        },
        {
          "_id": "64f9c0d1e2f3a4b5c6d7e8fa",
          "documentType": "old_passport",
          "isMandatory": false
        }
      ]
    }
  ]
}
```

---

### `GET /government-services/:serviceId`

**Response `200`**
```json
{
  "success": true,
  "data": {
    "_id": "64f8b9c0d8e9f0a1b2c3d4e5",
    "categoryId": "64f7a8b9c0d7e8f9a0b1c2d3",
    "category": { "categoryName": "Civil Status" },
    "serviceName": "Passport Renewal",
    "description": "Renew your Egyptian passport",
    "estimatedDays": 7,
    "governmentFee": 300,
    "platformFee": 50,
    "availableOnline": true,
    "isActive": true,
    "requiredDocuments": [
      {
        "_id": "64f9c0d1e2f3a4b5c6d7e8f9",
        "documentType": "national_id",
        "isMandatory": true
      }
    ]
  }
}
```

---

### `POST /government-services` _(Admin only)_

🔒 **Auth required — Admin**

**Request**
```json
{
  "categoryId": "64f7a8b9c0d7e8f9a0b1c2d3",
  "serviceName": "Birth Certificate Copy",
  "description": "Get a copy of your birth certificate",
  "estimatedDays": 3,
  "governmentFee": 50,
  "platformFee": 20,
  "availableOnline": true,
  "isActive": true,
  "requiredDocuments": [
    { "documentType": "national_id", "isMandatory": true }
  ]
}
```

**Response `201`**
```json
{
  "success": true,
  "data": {
    "_id": "64fab1c2d3e4f5a6b7c8d9e0",
    "serviceName": "Birth Certificate Copy",
    "estimatedDays": 3,
    "governmentFee": 50,
    "platformFee": 20,
    "availableOnline": true,
    "isActive": true,
    "requiredDocuments": [
      {
        "_id": "64fab1c2d3e4f5a6b7c8d9e1",
        "documentType": "national_id",
        "isMandatory": true
      }
    ]
  }
}
```

---

### `PATCH /government-services/:serviceId` _(Admin only)_

🔒 **Auth required — Admin**

**Request**
```json
{
  "governmentFee": 350,
  "estimatedDays": 5,
  "isActive": false
}
```

**Response `200`**
```json
{
  "success": true,
  "data": {
    "_id": "64f8b9c0d8e9f0a1b2c3d4e5",
    "governmentFee": 350,
    "estimatedDays": 5,
    "isActive": false,
    "updatedAt": "2025-06-15T14:00:00Z"
  }
}
```

---

## 6. Service Requests

### `POST /service-requests`

🔒 **Auth required**

إنشاء طلب خدمة جديد.

**Request**
```json
{
  "serviceId": "64f8b9c0d8e9f0a1b2c3d4e5",
  "documentIds": [
    "64f2b3c4d5e6f7a8b9c0d2e3"
  ],
  "notes": "Urgent — travelling next month"
}
```

**Response `201`**
```json
{
  "success": true,
  "data": {
    "_id": "64fbc2d3e4f5a6b7c8d9e0f1",
    "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
    "serviceId": "64f8b9c0d8e9f0a1b2c3d4e5",
    "service": {
      "serviceName": "Passport Renewal",
      "estimatedDays": 7,
      "governmentFee": 300,
      "platformFee": 50
    },
    "status": "pending",
    "currentStep": "document_review",
    "aiMatchScore": 0.94,
    "submissionDate": "2025-06-15T10:00:00Z",
    "completionDate": null,
    "rejectionReason": null,
    "notes": "Urgent — travelling next month",
    "documents": [
      {
        "_id": "64fbc2d3e4f5a6b7c8d9e0f2",
        "documentId": "64f2b3c4d5e6f7a8b9c0d2e3",
        "documentType": "national_id",
        "isApproved": null,
        "comments": null
      }
    ]
  }
}
```

---

### `GET /service-requests`

🔒 **Auth required**

الحصول على طلبات المستخدم الحالي.

**Query Params**
```
page=1&limit=10&status=pending&serviceId=64f8b9c0d8e9f0a1b2c3d4e5
```

**Response `200`**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "_id": "64fbc2d3e4f5a6b7c8d9e0f1",
        "service": {
          "serviceName": "Passport Renewal",
          "estimatedDays": 7
        },
        "status": "pending",
        "currentStep": "document_review",
        "aiMatchScore": 0.94,
        "submissionDate": "2025-06-15T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

### `GET /service-requests/:requestId`

🔒 **Auth required**

**Response `200`**
```json
{
  "success": true,
  "data": {
    "_id": "64fbc2d3e4f5a6b7c8d9e0f1",
    "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
    "service": {
      "_id": "64f8b9c0d8e9f0a1b2c3d4e5",
      "serviceName": "Passport Renewal",
      "estimatedDays": 7,
      "governmentFee": 300,
      "platformFee": 50
    },
    "reviewedByAdmin": {
      "_id": "64f6f7a8b9c0d6e7f8a9b0c1",
      "user": { "firstName": "Sara", "lastName": "Ali" },
      "department": "Civil Affairs"
    },
    "status": "under_review",
    "currentStep": "admin_review",
    "aiMatchScore": 0.94,
    "submissionDate": "2025-06-15T10:00:00Z",
    "completionDate": null,
    "rejectionReason": null,
    "notes": "Urgent — travelling next month",
    "documents": [
      {
        "_id": "64fbc2d3e4f5a6b7c8d9e0f2",
        "document": {
          "_id": "64f2b3c4d5e6f7a8b9c0d2e3",
          "documentType": "national_id",
          "documentNumber": "29005151234567",
          "verificationStatus": "verified"
        },
        "isApproved": true,
        "comments": "Document verified successfully"
      }
    ],
    "payment": {
      "status": "paid",
      "governmentFeeAmount": 300,
      "platformFeeAmount": 50,
      "paidAt": "2025-06-15T10:30:00Z"
    },
    "appointment": {
      "appointmentDate": "2025-06-22T09:00:00Z",
      "status": "scheduled",
      "govOffice": {
        "officeName": "Cairo Civil Status Office",
        "address": "5 Tahrir Square, Cairo"
      }
    }
  }
}
```

---

### `GET /service-requests/admin/all` _(Admin only)_

🔒 **Auth required — Admin**

كل الطلبات مع فلترة متقدمة.

**Query Params**
```
page=1&limit=20&status=pending&serviceId=...&userId=...&fromDate=2025-01-01&toDate=2025-06-30
```

**Response `200`**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "_id": "64fbc2d3e4f5a6b7c8d9e0f1",
        "user": {
          "firstName": "Ahmed",
          "lastName": "Hassan",
          "email": "ahmed@example.com"
        },
        "service": { "serviceName": "Passport Renewal" },
        "status": "pending",
        "aiMatchScore": 0.94,
        "submissionDate": "2025-06-15T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 300,
      "page": 1,
      "limit": 20,
      "totalPages": 15
    }
  }
}
```

---

### `PATCH /service-requests/:requestId/status` _(Admin only)_

🔒 **Auth required — Admin**

تغيير حالة الطلب.

**Request**
```json
{
  "status": "approved",
  "notes": "All documents verified. Request approved."
}
```

> `status` enum: `pending` | `under_review` | `approved` | `rejected` | `completed` | `cancelled`

**Response `200`**
```json
{
  "success": true,
  "data": {
    "_id": "64fbc2d3e4f5a6b7c8d9e0f1",
    "status": "approved",
    "reviewedByAdminId": "64f6f7a8b9c0d6e7f8a9b0c1",
    "currentStep": "payment",
    "updatedAt": "2025-06-16T09:00:00Z"
  }
}
```

---

### `PATCH /service-requests/:requestId/reject` _(Admin only)_

🔒 **Auth required — Admin**

**Request**
```json
{
  "rejectionReason": "Expired national ID. Please upload a valid document."
}
```

**Response `200`**
```json
{
  "success": true,
  "data": {
    "_id": "64fbc2d3e4f5a6b7c8d9e0f1",
    "status": "rejected",
    "rejectionReason": "Expired national ID. Please upload a valid document.",
    "updatedAt": "2025-06-16T09:00:00Z"
  }
}
```

---

### `DELETE /service-requests/:requestId`

🔒 **Auth required**

إلغاء طلب (فقط لو `status = pending`).

**Response `200`**
```json
{
  "success": true,
  "message": "Request cancelled successfully"
}
```

---

## 7. Request Documents

### `POST /service-requests/:requestId/documents`

🔒 **Auth required**

إضافة وثيقة لطلب موجود.

**Request**
```json
{
  "documentId": "64f2b3c4d5e6f7a8b9c0d2e3"
}
```

**Response `201`**
```json
{
  "success": true,
  "data": {
    "_id": "64fcd3e4f5a6b7c8d9e0f1a2",
    "requestId": "64fbc2d3e4f5a6b7c8d9e0f1",
    "documentId": "64f2b3c4d5e6f7a8b9c0d2e3",
    "isApproved": null,
    "comments": null
  }
}
```

---

### `PATCH /service-requests/:requestId/documents/:docId` _(Admin only)_

🔒 **Auth required — Admin**

مراجعة وثيقة ضمن طلب.

**Request**
```json
{
  "isApproved": true,
  "comments": "Document is clear and valid"
}
```

**Response `200`**
```json
{
  "success": true,
  "data": {
    "_id": "64fcd3e4f5a6b7c8d9e0f1a2",
    "isApproved": true,
    "comments": "Document is clear and valid"
  }
}
```

---

## 8. Payments

### `POST /service-requests/:requestId/payments`

🔒 **Auth required**

إنشاء عملية دفع لطلب.

**Request**
```json
{
  "paymentGateway": "paymob",
  "currency": "EGP"
}
```

**Response `201`**
```json
{
  "success": true,
  "data": {
    "_id": "64fde4f5a6b7c8d9e0f1a2b3",
    "requestId": "64fbc2d3e4f5a6b7c8d9e0f1",
    "governmentFeeAmount": 300,
    "platformFeeAmount": 50,
    "currency": "EGP",
    "paymentGateway": "paymob",
    "transactionRef": "PMB-2025-0012345",
    "status": "pending",
    "paymentUrl": "https://accept.paymob.com/api/acceptance/iframes/123456?payment_token=xyz"
  }
}
```

---

### `GET /service-requests/:requestId/payments`

🔒 **Auth required**

الحصول على تفاصيل الدفع لطلب معين.

**Response `200`**
```json
{
  "success": true,
  "data": {
    "_id": "64fde4f5a6b7c8d9e0f1a2b3",
    "requestId": "64fbc2d3e4f5a6b7c8d9e0f1",
    "governmentFeeAmount": 300,
    "platformFeeAmount": 50,
    "currency": "EGP",
    "paymentGateway": "paymob",
    "transactionRef": "PMB-2025-0012345",
    "status": "paid",
    "paidAt": "2025-06-15T10:30:00Z"
  }
}
```

---

### `POST /payments/webhook`

Webhook من بوابة الدفع (لا يحتاج auth — بيتأمن بـ signature).

**Request** _(من Paymob/Fawry/غيره)_
```json
{
  "transactionRef": "PMB-2025-0012345",
  "status": "success",
  "amount": 350,
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

## 9. Appointments & Gov Offices

### `GET /gov-offices`

قائمة المكاتب الحكومية.

**Query Params**
```
city=Cairo&officeType=passport&serviceId=64f8b9c0d8e9f0a1b2c3d4e5
```

**Response `200`**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64fef5a6b7c8d9e0f1a2b3c4",
      "officeName": "Cairo Civil Status Office",
      "officeType": "civil_status",
      "city": "Cairo",
      "address": "5 Tahrir Square, Cairo",
      "latitude": 30.0444,
      "longitude": 31.2357
    }
  ]
}
```

---

### `GET /gov-offices/:officeId/slots`

الحصول على المواعيد المتاحة لمكتب معين.

**Query Params**
```
serviceId=64f8b9c0d8e9f0a1b2c3d4e5&fromDate=2025-06-20&toDate=2025-06-27
```

**Response `200`**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64ff06b7c8d9e0f1a2b3c4d5",
      "govOfficeId": "64fef5a6b7c8d9e0f1a2b3c4",
      "serviceId": "64f8b9c0d8e9f0a1b2c3d4e5",
      "slotDateTime": "2025-06-22T09:00:00Z",
      "capacity": 10,
      "bookedCount": 3,
      "availableSpots": 7
    },
    {
      "_id": "64ff06b7c8d9e0f1a2b3c4d6",
      "govOfficeId": "64fef5a6b7c8d9e0f1a2b3c4",
      "serviceId": "64f8b9c0d8e9f0a1b2c3d4e5",
      "slotDateTime": "2025-06-22T10:00:00Z",
      "capacity": 10,
      "bookedCount": 10,
      "availableSpots": 0
    }
  ]
}
```

---

### `POST /service-requests/:requestId/appointments`

🔒 **Auth required**

حجز موعد لطلب.

**Request**
```json
{
  "slotId": "64ff06b7c8d9e0f1a2b3c4d5"
}
```

**Response `201`**
```json
{
  "success": true,
  "data": {
    "_id": "65000718c9e0f1a2b3c4d5e6",
    "requestId": "64fbc2d3e4f5a6b7c8d9e0f1",
    "slotId": "64ff06b7c8d9e0f1a2b3c4d5",
    "govOfficeId": "64fef5a6b7c8d9e0f1a2b3c4",
    "govOffice": {
      "officeName": "Cairo Civil Status Office",
      "address": "5 Tahrir Square, Cairo"
    },
    "appointmentDate": "2025-06-22T09:00:00Z",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
    "status": "scheduled",
    "notes": null
  }
}
```

---

### `GET /service-requests/:requestId/appointments`

🔒 **Auth required**

**Response `200`**
```json
{
  "success": true,
  "data": {
    "_id": "65000718c9e0f1a2b3c4d5e6",
    "appointmentDate": "2025-06-22T09:00:00Z",
    "status": "scheduled",
    "qrCode": "data:image/png;base64,...",
    "govOffice": {
      "officeName": "Cairo Civil Status Office",
      "officeType": "civil_status",
      "city": "Cairo",
      "address": "5 Tahrir Square, Cairo",
      "latitude": 30.0444,
      "longitude": 31.2357
    }
  }
}
```

---

### `PATCH /service-requests/:requestId/appointments/:appointmentId`

🔒 **Auth required**

إعادة جدولة أو إلغاء موعد.

**Request**
```json
{
  "action": "reschedule",
  "newSlotId": "64ff06b7c8d9e0f1a2b3c4d7"
}
```

> `action` enum: `reschedule` | `cancel`

**Response `200`**
```json
{
  "success": true,
  "data": {
    "_id": "65000718c9e0f1a2b3c4d5e6",
    "appointmentDate": "2025-06-24T11:00:00Z",
    "status": "rescheduled",
    "qrCode": "data:image/png;base64,..."
  }
}
```

---

### `POST /gov-offices` _(Admin only)_

🔒 **Auth required — Admin**

إضافة مكتب حكومي جديد.

**Request**
```json
{
  "officeName": "Alexandria Passport Office",
  "officeType": "passport",
  "city": "Alexandria",
  "address": "10 Corniche Road, Alexandria",
  "latitude": 31.2001,
  "longitude": 29.9187
}
```

**Response `201`**
```json
{
  "success": true,
  "data": {
    "_id": "65011829d0f1a2b3c4d5e6f7",
    "officeName": "Alexandria Passport Office",
    "officeType": "passport",
    "city": "Alexandria",
    "address": "10 Corniche Road, Alexandria",
    "latitude": 31.2001,
    "longitude": 29.9187
  }
}
```

---

### `POST /gov-offices/:officeId/slots` _(Admin only)_

🔒 **Auth required — Admin**

إضافة slot مواعيد لمكتب.

**Request**
```json
{
  "serviceId": "64f8b9c0d8e9f0a1b2c3d4e5",
  "slots": [
    { "slotDateTime": "2025-07-01T09:00:00Z", "capacity": 10 },
    { "slotDateTime": "2025-07-01T10:00:00Z", "capacity": 10 },
    { "slotDateTime": "2025-07-01T11:00:00Z", "capacity": 10 }
  ]
}
```

**Response `201`**
```json
{
  "success": true,
  "data": {
    "created": 3,
    "slots": [
      {
        "_id": "65022930e1f2a3b4c5d6e7f8",
        "slotDateTime": "2025-07-01T09:00:00Z",
        "capacity": 10,
        "bookedCount": 0
      }
    ]
  }
}
```

---

## 10. Complaints

### `POST /complaints`

🔒 **Auth required**

تقديم شكوى.

**Request**
```json
{
  "relatedRequestId": "64fbc2d3e4f5a6b7c8d9e0f1",
  "title": "Delayed processing",
  "description": "My request has been pending for 14 days without any update."
}
```

**Response `201`**
```json
{
  "success": true,
  "data": {
    "_id": "6503303af2a3b4c5d6e7f8a9",
    "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
    "relatedRequestId": "64fbc2d3e4f5a6b7c8d9e0f1",
    "title": "Delayed processing",
    "description": "My request has been pending for 14 days without any update.",
    "status": "open",
    "createdAt": "2025-06-15T15:00:00Z"
  }
}
```

---

### `GET /complaints`

🔒 **Auth required**

شكاوى المستخدم الحالي.

**Response `200`**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6503303af2a3b4c5d6e7f8a9",
      "title": "Delayed processing",
      "status": "open",
      "createdAt": "2025-06-15T15:00:00Z",
      "relatedRequest": {
        "service": { "serviceName": "Passport Renewal" }
      }
    }
  ]
}
```

---

### `GET /complaints/admin/all` _(Admin only)_

🔒 **Auth required — Admin**

**Query Params**
```
page=1&limit=20&status=open
```

**Response `200`**
```json
{
  "success": true,
  "data": {
    "complaints": [
      {
        "_id": "6503303af2a3b4c5d6e7f8a9",
        "user": { "firstName": "Ahmed", "email": "ahmed@example.com" },
        "title": "Delayed processing",
        "status": "open",
        "createdAt": "2025-06-15T15:00:00Z"
      }
    ],
    "pagination": { "total": 45, "page": 1, "limit": 20, "totalPages": 3 }
  }
}
```

---

### `PATCH /complaints/:complaintId` _(Admin only)_

🔒 **Auth required — Admin**

تحديث حالة الشكوى وتعيين المسؤول.

**Request**
```json
{
  "status": "resolved",
  "assignedToAdminId": "64f6f7a8b9c0d6e7f8a9b0c1",
  "resolutionNote": "Issue has been escalated and resolved. Apologies for the delay."
}
```

> `status` enum: `open` | `in_progress` | `resolved` | `closed`

**Response `200`**
```json
{
  "success": true,
  "data": {
    "_id": "6503303af2a3b4c5d6e7f8a9",
    "status": "resolved",
    "assignedToAdminId": "64f6f7a8b9c0d6e7f8a9b0c1",
    "resolutionNote": "Issue has been escalated and resolved. Apologies for the delay.",
    "updatedAt": "2025-06-16T10:00:00Z"
  }
}
```

---

## 11. Notifications

### `GET /notifications`

🔒 **Auth required**

**Query Params**
```
page=1&limit=20&isRead=false
```

**Response `200`**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "6504413be3a4b5c6d7e8f9a0",
        "title": "Request Approved",
        "message": "Your Passport Renewal request has been approved. Please proceed to payment.",
        "type": "request_update",
        "isRead": false,
        "createdAt": "2025-06-16T09:00:00Z"
      }
    ],
    "unreadCount": 3,
    "pagination": { "total": 12, "page": 1, "limit": 20, "totalPages": 1 }
  }
}
```

---

### `PATCH /notifications/:notificationId/read`

🔒 **Auth required**

تعليم إشعار كمقروء.

**Response `200`**
```json
{
  "success": true,
  "data": {
    "_id": "6504413be3a4b5c6d7e8f9a0",
    "isRead": true
  }
}
```

---

### `PATCH /notifications/read-all`

🔒 **Auth required**

تعليم كل الإشعارات كمقروءة.

**Response `200`**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## 12. AI Assistant (RAG)

### `POST /ai/conversations`

🔒 **Auth required**

بدء محادثة جديدة مع المساعد الذكي.

**Request**
```json
{
  "channel": "web"
}
```

> `channel` enum: `web` | `mobile` | `whatsapp`

**Response `201`**
```json
{
  "success": true,
  "data": {
    "_id": "6505524cc4b5d6e7f8a9b0c1",
    "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
    "channel": "web",
    "startedAt": "2025-06-15T16:00:00Z"
  }
}
```

---

### `POST /ai/conversations/:conversationId/messages`

🔒 **Auth required**

إرسال رسالة للمساعد والحصول على الرد.

**Request**
```json
{
  "messageText": "ما هي المستندات المطلوبة لتجديد جواز السفر؟",
  "inputType": "text"
}
```

> `inputType` enum: `text` | `voice`

**Response `200`**
```json
{
  "success": true,
  "data": {
    "userMessage": {
      "_id": "6506635dd5c6e7f8a9b0c1d2",
      "senderType": "user",
      "messageText": "ما هي المستندات المطلوبة لتجديد جواز السفر؟",
      "createdAt": "2025-06-15T16:01:00Z"
    },
    "assistantMessage": {
      "_id": "6506635dd5c6e7f8a9b0c1d3",
      "senderType": "assistant",
      "messageText": "لتجديد جواز السفر المصري، تحتاج إلى: 1) بطاقة الرقم القومي السارية. 2) جواز السفر القديم (إن وجد). 3) إيصال سداد رسوم التجديد (300 جنيه مصري). ويستغرق التجديد عادةً من 5 إلى 7 أيام عمل.",
      "retrievals": [
        {
          "legalChunkId": "6507746ee6d7f8a9b0c1d2e3",
          "chunkText": "وفقاً للقانون رقم 97 لسنة 1959 وتعديلاته...",
          "articleRef": "المادة 5",
          "similarityScore": 0.92,
          "source": {
            "title": "قانون جوازات السفر المصرية",
            "lawCategory": "Civil Status",
            "issuingAuthority": "وزارة الداخلية"
          }
        }
      ],
      "createdAt": "2025-06-15T16:01:02Z"
    }
  }
}
```

---

### `GET /ai/conversations`

🔒 **Auth required**

محادثات المستخدم السابقة.

**Response `200`**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6505524cc4b5d6e7f8a9b0c1",
      "channel": "web",
      "startedAt": "2025-06-15T16:00:00Z",
      "endedAt": "2025-06-15T16:10:00Z",
      "messageCount": 6
    }
  ]
}
```

---

### `GET /ai/conversations/:conversationId/messages`

🔒 **Auth required**

رسائل محادثة معينة.

**Response `200`**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6506635dd5c6e7f8a9b0c1d2",
      "senderType": "user",
      "messageText": "ما هي المستندات المطلوبة لتجديد جواز السفر؟",
      "inputType": "text",
      "createdAt": "2025-06-15T16:01:00Z"
    },
    {
      "_id": "6506635dd5c6e7f8a9b0c1d3",
      "senderType": "assistant",
      "messageText": "لتجديد جواز السفر المصري، تحتاج إلى...",
      "createdAt": "2025-06-15T16:01:02Z"
    }
  ]
}
```

---

### `DELETE /ai/conversations/:conversationId`

🔒 **Auth required**

إنهاء وحذف محادثة.

**Response `200`**
```json
{
  "success": true,
  "message": "Conversation ended"
}
```

---

### `GET /legal-sources` _(Admin only)_

🔒 **Auth required — Admin**

**Response `200`**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6508857ff7e8a9b0c1d2e3f4",
      "title": "قانون جوازات السفر المصرية",
      "lawCategory": "Civil Status",
      "issuingAuthority": "وزارة الداخلية",
      "sourceUrl": "https://manshurat.org/node/14356",
      "effectiveDate": "1959-01-01",
      "version": "1.4",
      "chunksCount": 48
    }
  ]
}
```

---

### `POST /legal-sources` _(Admin only)_

🔒 **Auth required — Admin**

إضافة مصدر قانوني جديد وتقسيمه إلى chunks.

**Request** `multipart/form-data`
```
title: قانون الأحوال المدنية
lawCategory: Civil Status
issuingAuthority: وزارة الداخلية
sourceUrl: https://example.com/law
effectiveDate: 2025-01-01
version: 1.0
documentFile: <pdf_file>
```

**Response `201`**
```json
{
  "success": true,
  "data": {
    "_id": "6509968000f1a2b3c4d5e6f7",
    "title": "قانون الأحوال المدنية",
    "chunksCreated": 65,
    "status": "processing"
  }
}
```

---

## 13. Audit Logs

### `GET /audit-logs` _(Admin only)_

🔒 **Auth required — Admin**

**Query Params**
```
requestId=64fbc2d3e4f5a6b7c8d9e0f1&actorId=64f6f7a8b9c0d6e7f8a9b0c1&action=status_change&fromDate=2025-06-01&toDate=2025-06-30&page=1&limit=50
```

**Response `200`**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "_id": "650aa79111a2b3c4d5e6f7a8",
        "requestId": "64fbc2d3e4f5a6b7c8d9e0f1",
        "actor": {
          "_id": "64f6f7a8b9c0d6e7f8a9b0c1",
          "type": "admin",
          "name": "Sara Ali",
          "email": "sara@gov.eg"
        },
        "action": "status_change",
        "previousState": { "status": "pending" },
        "newState": { "status": "under_review" },
        "createdAt": "2025-06-16T09:00:00Z"
      }
    ],
    "pagination": {
      "total": 28,
      "page": 1,
      "limit": 50,
      "totalPages": 1
    }
  }
}
```

---

## 14. Common Responses

### Success wrapper
```json
{
  "success": true,
  "data": { }
}
```

### Error wrapper
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "email", "message": "Must be a valid email address" }
    ]
  }
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | OK |
| `201` | Created |
| `400` | Bad Request — validation error |
| `401` | Unauthorized — missing or invalid token |
| `403` | Forbidden — insufficient permissions |
| `404` | Not Found |
| `409` | Conflict — duplicate resource |
| `422` | Unprocessable Entity |
| `429` | Too Many Requests |
| `500` | Internal Server Error |

### Error Codes

| Code | Meaning |
|------|---------|
| `VALIDATION_ERROR` | حقل مطلوب أو قيمة غير صحيحة |
| `UNAUTHORIZED` | توكن غير موجود أو منتهي الصلاحية |
| `FORBIDDEN` | صلاحيات غير كافية |
| `NOT_FOUND` | المورد غير موجود |
| `DUPLICATE_ENTRY` | البيانات موجودة مسبقاً (مثل email مكرر) |
| `DOCUMENT_EXPIRED` | الوثيقة منتهية الصلاحية |
| `SLOT_FULL` | الموعد مكتمل |
| `INVALID_STATUS_TRANSITION` | تغيير حالة غير مسموح |
| `PAYMENT_FAILED` | فشل عملية الدفع |
| `REQUEST_NOT_CANCELLABLE` | الطلب لا يمكن إلغاؤه في حالته الحالية |

---

## Appendix — Status Flows

### Service Request Status
```
pending → under_review → approved → completed
                       ↘ rejected
pending → cancelled
```

### Appointment Status
```
scheduled → completed
          → cancelled
          → rescheduled → scheduled
```

### Payment Status
```
pending → paid
        → failed
        → refunded
```

### Complaint Status
```
open → in_progress → resolved → closed
```

### Identity Document Verification Status
```
pending → verified
        → rejected
```
