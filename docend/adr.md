# ADR-001: Adopt a Metadata-Driven Modular Monolith Architecture

**Status:** Accepted

**Date:** 2026-07-18

**Authors:** Platform Team

---

# Title

Adopt a **Metadata-Driven Low-Code Platform** using **Next.js**, **MongoDB**, and a **Modular Monolith Architecture**.

---

# Context

The goal is to build a platform that enables users to create enterprise business applications without writing application-specific code.

The platform should support:

* Dynamic Form Builder
* Dynamic UI
* Workflow Engine
* Role Based Access Control (RBAC)
* Menu Builder
* Theme Builder
* Notification Engine
* Audit Trail
* Multi-tenancy
* JSON-based metadata
* Runtime rendering

Unlike traditional applications, every application is generated from metadata stored in the database.

Example:

```
Metadata

↓

Runtime Engine

↓

Business Application
```

The platform should eventually support multiple business domains such as:

* HR
* CRM
* Trade Finance
* Procurement
* Vendor Management
* Asset Management
* Compliance
* Customer Onboarding

without changing the platform source code.

---

# Problem Statement

Traditional enterprise applications duplicate significant amounts of code:

* Forms
* CRUD operations
* Permissions
* Menus
* Validation
* Workflows
* Dashboards

Every new application repeats the same implementation.

The objective is to eliminate repetitive development by introducing a metadata-driven runtime.

---

# Decision

The platform will be implemented as a **Metadata-Driven Modular Monolith**.

Technology stack:

## Frontend

* Next.js 16
* React 19
* TypeScript
* Tailwind CSS
* shadcn/ui

## Backend

* Next.js Route Handlers
* Server Actions

## Database

* MongoDB

## ORM

* Prisma

## Authentication

* Auth.js

---

# Architectural Principles

## 1. Metadata First

Nothing should be hardcoded.

Everything is metadata.

Example:

```
Application

↓

Pages

↓

Sections

↓

Components

↓

Fields

↓

Workflow

↓

Permissions

↓

Menus

↓

Theme
```

---

## 2. Runtime Rendering

Runtime loads metadata.

```
MongoDB

↓

Metadata Engine

↓

Renderer

↓

React Components

↓

Application
```

No page should contain application-specific code.

---

## 3. Configuration over Code

Business applications should be configured instead of developed.

Examples:

* New Form
* New Workflow
* New Menu
* New Dashboard
* New Theme

must require metadata changes only.

---

## 4. Modular Monolith

The platform will remain a single deployable application.

```
Platform

├── Auth
├── Users
├── Tenant
├── Metadata
├── Runtime
├── Forms
├── Workflow
├── RBAC
├── Menu
├── Theme
├── Notification
├── Audit
└── Settings
```

Each module owns:

* Domain
* Application
* Infrastructure
* Presentation

No direct cross-module database access.

Communication occurs through services or domain events.

---

# Metadata Model

```
Application

    Pages

        Sections

            Components

                Fields
```

Each Application represents one business solution.

Example:

```
HR

CRM

Trade Finance

Asset Management
```

---

# Database Strategy

MongoDB is selected because metadata is hierarchical and document-oriented.

## Embedded Metadata

```
Application

    Pages

        Sections

            Components

                Fields

    Menus

    Theme

    Workflow Definitions
```

These objects are versioned together.

## Separate Collections

Operational data remains independent.

Collections:

* users
* submissions
* workflowInstances
* auditLogs
* notifications
* files

Reason:

These collections grow independently and have different query patterns.

---

# Runtime Architecture

```
Request

↓

Authentication

↓

Tenant Resolution

↓

Metadata Loader

↓

Permission Evaluation

↓

Workflow Resolution

↓

Theme Resolution

↓

Renderer

↓

React UI
```

---

# Core Engines

The platform consists of reusable engines.

## Metadata Engine

Responsible for:

* Applications
* Pages
* Components
* Layouts
* Menus
* Themes

---

## Runtime Engine

Responsible for:

* Rendering pages
* Loading metadata
* Dynamic navigation
* Component resolution

---

## Form Engine

Responsible for:

* Rendering controls
* Validation
* Conditional visibility
* Submission

---

## Workflow Engine

Responsible for:

* States
* Transitions
* Approvals
* History

---

## RBAC Engine

Responsible for:

* Roles
* Permissions
* Authorization

---

## Notification Engine

Responsible for:

* In-app notifications
* Email
* Future integrations

---

## Audit Engine

Responsible for:

* Entity history
* User actions
* Before/After snapshots

---

# Design Principles

The platform follows:

* SOLID
* DRY
* KISS
* Composition over inheritance
* Configuration over customization

---

# Coding Principles

* TypeScript only
* Strict typing
* No `any`
* Maximum 300 lines per file
* Feature-based modules
* Server Components by default
* Zod validation
* Repository pattern
* Service layer
* Reusable UI components

---

# Versioning

Metadata is immutable.

Changes create new versions.

```
Application

Version 1

↓

Version 2

↓

Version 3
```

Running applications continue using their published version until upgraded.

---

# Security

Security is enforced at multiple layers.

* Authentication
* Tenant isolation
* RBAC
* Component visibility
* API authorization
* Audit logging

---

# Non-Goals (Version 1)

The following features are intentionally excluded:

* Microservices
* Kubernetes
* BPMN Engine
* Drag-and-drop Workflow Designer
* Marketplace
* AI-generated Applications
* Plugin Marketplace
* Event Sourcing
* CQRS

These may be considered in future ADRs if justified.

---

# Consequences

## Positive

* High reuse across applications.
* Faster development of business solutions.
* Centralized runtime and security.
* Simplified maintenance with a single deployment.
* Well-suited to MongoDB's document model.
* Easier for a solo engineer to develop and operate.

## Negative

* Runtime engine becomes a critical component.
* Metadata schema must be carefully designed to avoid breaking changes.
* Dynamic rendering is more complex to debug than static applications.
* Requires strong metadata validation and versioning.

---

# Future ADRs

Planned architecture decisions include:

* ADR-002: Metadata Schema Design
* ADR-003: Runtime Rendering Engine
* ADR-004: Form Engine Architecture
* ADR-005: Workflow Engine
* ADR-006: RBAC Model
* ADR-007: Multi-Tenant Strategy
* ADR-008: Versioning Strategy
* ADR-009: Audit & Event Model
* ADR-010: Builder Studio Architecture

## Recommendation

Treat these ADRs as living documents. For a platform of this size, writing **one ADR per major architectural decision** (database model, renderer, workflow engine, RBAC, versioning, multi-tenancy, etc.) will help you avoid revisiting the same design questions months later and provide a clear rationale for future changes.
