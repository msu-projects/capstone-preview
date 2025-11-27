# Activity Diagram Creation Guide for Draw.io

This documentation describes the patterns, conventions, and best practices used in creating activity diagrams for the Note-Taking App project using Draw.io.

---

## Table of Contents

1. [Overview](#overview)
2. [File Naming Convention](#file-naming-convention)
3. [Diagram Structure](#diagram-structure)
4. [Swimlane Configuration](#swimlane-configuration)
5. [Shape Elements](#shape-elements)
6. [Color Scheme](#color-scheme)
7. [Wording Conventions](#wording-conventions)
8. [Flow Patterns](#flow-patterns)
9. [Edge Labels](#edge-labels)
10. [Common Patterns](#common-patterns)
11. [Step-by-Step Creation Guide](#step-by-step-creation-guide)

---

## Overview

The activity diagrams in this project follow UML 2.0 standards with a three-tier architecture representation using swimlanes. Each diagram represents a complete user workflow from initiation to completion, showing interactions between the frontend, backend, and database layers.

---

## File Naming Convention

Files follow a numbered naming pattern:

```
{number}-{feature-name}.drawio
```

**Examples:**

- `1-create-note.drawio`
- `2-edit-note.drawio`
- `6-user-registration.drawio`
- `10-admin-add-user.drawio`

**Rules:**

- Use lowercase with hyphens for multi-word names
- Number prefix indicates the order/priority of the workflow
- Keep names concise but descriptive

---

## Diagram Structure

### Diagram ID Naming

Each diagram has a unique ID that describes its purpose:

```xml
<diagram id="CreateNoteActivity" name="Page-1">
<diagram id="UserRegistrationActivity" name="Page-1">
<diagram id="AdminDeleteUserActivity" name="Page-1">
```

**Pattern:** `{FeatureName}Activity`

### Page Configuration

Standard page settings:

- **Grid Size:** 10
- **Page Width:** 850 (or larger for complex diagrams)
- **Page Height:** 1100-1400 (varies by complexity)
- **Grid/Guides:** Enabled
- **Tooltips/Connections:** Enabled

---

## Swimlane Configuration

### Three-Tier Architecture

All diagrams use three vertical swimlanes representing the application architecture:

| Lane Position | Name                  | Purpose                               |
| ------------- | --------------------- | ------------------------------------- |
| Left          | Svelte Frontend       | User interface actions and displays   |
| Middle        | SvelteKit Backend     | Server-side processing and validation |
| Right         | MongoDB / File System | Data persistence operations           |

### Swimlane Naming Variations

**Standard User Diagrams:**

- `Svelte Frontend`
- `SvelteKit Backend`
- `MongoDB`

**Admin Diagrams:**

- `Svelte Frontend (Admin)`
- `SvelteKit Backend`
- `MongoDB`

**File Operations:**

- `Svelte Frontend`
- `SvelteKit Backend`
- `File System` or `MongoDB + FileSystem`

### Swimlane Style Configuration

```xml
style="swimlane;startSize=40;fillColor=#f8cecc;strokeColor=#b85450;"
```

| Swimlane          | Fill Color               | Stroke Color            |
| ----------------- | ------------------------ | ----------------------- |
| Svelte Frontend   | `#f8cecc` (Light Red)    | `#b85450` (Dark Red)    |
| SvelteKit Backend | `#ffe6cc` (Light Orange) | `#d79b00` (Dark Orange) |
| MongoDB           | `#d5e8d4` (Light Green)  | `#82b366` (Dark Green)  |

### Swimlane Dimensions

- **Start Size (Header):** 40px
- **Width:** 230-330px (varies by content)
- **Height:** 500-1350px (based on flow complexity)

---

## Shape Elements

### 1. Start State (Initial Node)

```xml
style="ellipse;html=1;shape=startState;fillColor=#000000;strokeColor=#ff0000;"
```

- **Shape:** Filled black ellipse
- **Size:** 30x30 pixels
- **Stroke Color:** Red (`#ff0000`)
- **Position:** Top of the Frontend swimlane

### 2. End State (Final Node)

```xml
style="ellipse;html=1;shape=endState;fillColor=#000000;strokeColor=#ff0000;"
```

- **Shape:** Filled black ellipse with inner circle
- **Size:** 30x30 pixels
- **Stroke Color:** Red (`#ff0000`)
- **Position:** At each termination point

**Note:** A diagram may have multiple end states for different flow outcomes (success, cancel, error).

### 3. Action/Activity Nodes

```xml
style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;"
```

**Standard Action (Blue):**

- **Fill Color:** `#dae8fc` (Light Blue)
- **Stroke Color:** `#6c8ebf` (Dark Blue)
- **Size:** Typically 120x40 or 120x50 pixels
- **Corner Radius:** Rounded

### 4. Decision Nodes (Diamond)

```xml
style="rhombus;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;"
```

- **Shape:** Diamond/Rhombus
- **Fill Color:** `#fff2cc` (Light Yellow)
- **Stroke Color:** `#d6b656` (Dark Yellow)
- **Size:** 75-100x50-66 pixels
- **Text:** Question format (e.g., "Is valid?", "User action?")

### 5. Success/Positive Actions

```xml
style="whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;rounded=1;"
```

- **Fill Color:** `#d5e8d4` (Light Green)
- **Stroke Color:** `#82b366` (Dark Green)
- **Usage:** Success messages, successful completions, positive outcomes

### 6. Error/Negative Actions

```xml
style="whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;rounded=1;"
```

- **Fill Color:** `#f8cecc` (Light Red)
- **Stroke Color:** `#b85450` (Dark Red)
- **Usage:** Error displays, validation failures, access denied

---

## Color Scheme

### Complete Color Reference

| Element Type    | Fill Color | Stroke Color | Usage                       |
| --------------- | ---------- | ------------ | --------------------------- |
| Standard Action | `#dae8fc`  | `#6c8ebf`    | Regular actions, operations |
| Decision        | `#fff2cc`  | `#d6b656`    | Conditional branching       |
| Success         | `#d5e8d4`  | `#82b366`    | Positive outcomes           |
| Error           | `#f8cecc`  | `#b85450`    | Negative outcomes           |
| Start/End State | `#000000`  | `#ff0000`    | Flow boundaries             |
| Frontend Lane   | `#f8cecc`  | `#b85450`    | UI layer                    |
| Backend Lane    | `#ffe6cc`  | `#d79b00`    | Server layer                |
| Database Lane   | `#d5e8d4`  | `#82b366`    | Data layer                  |

---

## Wording Conventions

### Action Node Text Patterns

**Frontend Actions (User-initiated):**

```
Click "{Button Name}" Button
Navigate to {route}
Enter {Field1}, {Field2}, {Field3}
Type {Action}
Select & Upload {Items}
```

**Examples:**

- `Click "Create Note" Button`
- `Navigate to /register`
- `Enter Username, Email, Password`
- `Type Search Query`
- `Select & Upload Image Files`

**Frontend Display Actions:**

```
Show {Component/Form Name}
Display {Message Type}
Display "{Specific Message}"
```

**Examples:**

- `Show Note Editor`
- `Show Registration Form`
- `Display Success`
- `Display Validation Error`
- `Display "No Notes Found"`

**Backend Actions:**

```
Receive {Request Type} Request
Validate {Data Type} (Server-Side)
Check {Condition}
Verify {Item}
Hash Password
Create Session Token
Set Session Cookie
Generate {Item}
```

**Examples:**

- `Receive Toggle Request`
- `Validate Data (Server-Side)`
- `Check Admin Authorization`
- `Verify Credentials`

**Backend Response Actions:**

```
Return {Response Type} Response
Return {Error Type} Error
```

**Examples:**

- `Return Success Response`
- `Return Validation Error`
- `Return Unauthorized Error`

**Database Actions:**

```
Insert {Document} Document
Update {Document} Document
Delete {Document} Document
Find {Entity} by {Field}
Find {Entity} By ID And Owner ID
```

**Examples:**

- `Insert Note Document`
- `Update User Document`
- `Find User by Username`
- `Find Note By ID And Owner ID`

### Decision Node Text Patterns

Always phrase as questions:

```
{Subject} action?
Is {condition}?
Is valid?
Has {result}?
Are {items} valid?
```

**Examples:**

- `User action?`
- `Admin action?`
- `Is Found?`
- `Is valid?`
- `Is Public?`
- `Is Admin?`
- `Has results?`
- `Are credentials valid?`

---

## Edge Labels

### Transition Labels

Labels describe what data or action triggers the transition:

**Data Flow Labels:**

```
{Data Type} Data
{Field Name}
{Item} Received
{Action} Request
```

**Examples:**

- `Note Data`
- `User ID`
- `Registration Data`
- `Web Form Received`
- `Delete Request (Note ID)`

**Decision Branch Labels:**

| Branch Type     | Labels Used                                                      |
| --------------- | ---------------------------------------------------------------- |
| Positive        | `Yes`, `Save`, `Submit`, `Confirm`, `Create User`, `Update User` |
| Negative        | `No`, `Cancel`                                                   |
| Retry           | `Retry`                                                          |
| Specific Action | `Upload Image`, `Delete Image`                                   |

**Response Labels:**

```
Success Sent
Success Response
Send {Error Type} Error
Return {Result}
Document Created
```

---

## Flow Patterns

### 1. Standard CRUD Flow

```
Start → User Action → Display Form → Enter Data → Decision (Save/Cancel)
    ├─ Cancel → End
    └─ Save → Submit Data → [Backend] Validate → Decision (Valid?)
        ├─ No → Display Error → Retry Loop
        └─ Yes → [Database] Persist → Return Success → Display Success → End
```

### 2. Authentication Flow

```
Start → Navigate to Auth Page → Show Form → Enter Credentials → Decision (Submit/Cancel)
    ├─ Cancel → End
    └─ Submit → [Backend] Validate → Decision (Valid?)
        ├─ No → Display Validation Error → Retry
        └─ Yes → [Backend] Verify/Hash → Create Session → [Database] Store
            → Return Success → Display Success → Redirect → End
```

### 3. Admin Authorization Flow

```
Start → Navigate to Admin Page → User Action → Submit Request
    → [Backend] Check Admin Authorization → Decision (Is Admin?)
        ├─ No → Display Unauthorized Error → End
        └─ Yes → Continue with Operation...
```

### 4. Search/Filter Flow

```
Start → Navigate to List → Show List with Search → Enter Query → Submit Search
    → [Backend] Process → [Database] Find → Decision (Has Results?)
        ├─ No → Display "No Results" → End
        └─ Yes → Display Filtered Results → End
```

### 5. Cascade Delete Flow

```
Start → Confirm Delete → [Backend] Check Authorization → Decision (Authorized?)
    ├─ No → Display Error → End
    └─ Yes → [Database] Find Related Items → Delete Related Items
        → Delete Main Item → Return Success → Update UI → End
```

---

## Common Patterns

### Retry Loop Pattern

When validation fails, create a loop back to the input step:

```
[Error Display] → Edge with "Retry" label → [Input Step]
```

**Edge Configuration:**

- Exit from error node (typically top or side)
- Enter input node from side (left)
- Use waypoints if needed for clean routing

### Multiple End States

Use multiple end states for:

1. **Cancel action** - Positioned to the side of the decision
2. **Error termination** - After unrecoverable errors
3. **Success completion** - At the bottom of the success flow

### Cross-Swimlane Connections

When connecting across swimlanes:

- Use horizontal edges for clear data flow
- Add descriptive labels to edges
- Align nodes vertically where possible

---

## Step-by-Step Creation Guide

### Step 1: Set Up the Canvas

1. Create new Draw.io diagram
2. Set diagram ID: `{FeatureName}Activity`
3. Configure page size (850x1100 minimum)

### Step 2: Create Swimlanes

1. Insert three swimlanes
2. Apply appropriate colors:
   - Frontend: `fillColor=#f8cecc;strokeColor=#b85450`
   - Backend: `fillColor=#ffe6cc;strokeColor=#d79b00`
   - Database: `fillColor=#d5e8d4;strokeColor=#82b366`
3. Set header startSize to 40
4. Adjust widths based on content

### Step 3: Place Start Node

1. Add start state (black circle) at top of Frontend lane
2. Size: 30x30 pixels
3. Connect to first action with red arrow

### Step 4: Build Frontend Flow

1. Add action nodes for user interactions
2. Use decision diamonds for user choices
3. Add display/feedback nodes
4. Connect with edges and labels

### Step 5: Build Backend Flow

1. Add request reception nodes
2. Add validation steps
3. Add authorization checks (if applicable)
4. Add business logic operations
5. Connect with Frontend via horizontal edges

### Step 6: Build Database Flow

1. Add data persistence operations
2. Add query operations
3. Connect with Backend via horizontal edges
4. Return results to Backend

### Step 7: Add Response Flow

1. Connect Backend responses to Frontend
2. Add success/error display nodes
3. Add redirects or UI updates

### Step 8: Place End Nodes

1. Add end states at each termination point
2. Ensure all paths lead to an end state
3. Size: 30x30 pixels

### Step 9: Add Labels and Polish

1. Add edge labels for all transitions
2. Align nodes for clean appearance
3. Use waypoints to avoid crossing lines
4. Review and test all paths

---

## Checklist for Review

- [ ] All paths start from a start node
- [ ] All paths end at an end node
- [ ] Decision nodes have at least two outgoing edges with labels
- [ ] All edges crossing swimlanes have descriptive labels
- [ ] Color scheme is consistent
- [ ] Wording follows established patterns
- [ ] Error cases are handled with retry or termination
- [ ] Success cases display feedback before ending

---

## Examples Reference

| Diagram              | Key Patterns Demonstrated               |
| -------------------- | --------------------------------------- |
| 1-create-note        | Basic CRUD, validation retry loop       |
| 2-edit-note          | Data fetching, update flow              |
| 3-share-note         | Toggle visibility, conditional paths    |
| 4-view-shared-note   | Public access, simple validation        |
| 5-delete-note        | Confirmation dialog, cascade delete     |
| 6-user-registration  | Form validation, session creation       |
| 7-user-login         | Authentication, credential verification |
| 8-search-notes       | Search/filter, empty results handling   |
| 9-manage-images      | Multiple actions (upload/delete)        |
| 10-admin-add-user    | Admin authorization check               |
| 11-admin-update-user | Data fetch + update flow                |
| 12-admin-delete-user | Cascade delete with authorization       |

---

_Last Updated: November 2025_
