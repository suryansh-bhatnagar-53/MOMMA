# M.O.M.M.A. --- My Online Mentor and Model Architect

> **From project idea to a customized AI bot that evolves with the
> project.**

M.O.M.M.A. is an AI-powered project workspace that helps users create
project-specific AI assistants without designing every instruction from
scratch. Users provide project context, MOMMA analyzes it, identifies
knowledge gaps, asks targeted interview questions, builds a structured
understanding, and generates a customized bot that can be tested,
exported, and updated as the project evolves.

This README documents the product vision, planning phases, MVP scope,
architecture, adaptive interview system, implementation roadmap,
technology direction, quality requirements, and future plans.

------------------------------------------------------------------------

## Table of Contents

1.  [Project Overview](#1-project-overview)
2.  [Problem and Vision](#2-problem-and-vision)
3.  [Product Principles](#3-product-principles)
4.  [Current Development Status](#4-current-development-status)
5.  [End-to-End User Journey](#5-end-to-end-user-journey)
6.  [Nine Planning Phases](#6-nine-planning-phases)
7.  [MVP Scope](#7-mvp-scope)
8.  [MVP Implementation Roadmap](#8-mvp-implementation-roadmap)
9.  [Adaptive Interview System](#9-adaptive-interview-system)
10. [Project Knowledge and Bot
    Generation](#10-project-knowledge-and-bot-generation)
11. [System Architecture](#11-system-architecture)
12. [Core Data Model](#12-core-data-model)
13. [Technology Stack](#13-technology-stack)
14. [Security and Privacy](#14-security-and-privacy)
15. [UX Principles](#15-ux-principles)
16. [Testing and Acceptance
    Criteria](#16-testing-and-acceptance-criteria)
17. [Team Workflow](#17-team-workflow)
18. [Hackathon Demo Plan](#18-hackathon-demo-plan)
19. [Future Roadmap](#19-future-roadmap)
20. [Scope Control](#20-scope-control)
21. [Development Workflow](#21-development-workflow)
22. [Open Decisions](#22-open-decisions)
23. [Success Criteria](#23-success-criteria)
24. [Suggested Repository Structure](#24-suggested-repository-structure)

------------------------------------------------------------------------

## 1. Project Overview

-   **Product:** M.O.M.M.A.
-   **Full form:** My Online Mentor and Model Architect
-   **Category:** AI-powered project-aware bot creation workspace
-   **Initial platform:** Web application
-   **Initial users:** Students, developers, and freelancers
-   **Immediate goal:** Deliver a reliable MVP suitable for a hackathon
    demonstration
-   **Long-term direction:** A platform for creating, managing,
    evolving, and eventually sharing project-specific AI bots

### Core promise

> MOMMA understands your project through context and intelligent
> interviews, then generates and evolves a customized AI bot---so you do
> not have to start from scratch every time.

MOMMA is not intended to be only a one-time prompt generator. Its
defining idea is to maintain an understanding of a project and use that
understanding to guide bot creation and future updates.

## 2. Problem and Vision

### Problem statement

Developers and other users often need to repeatedly collect project
details, write AI instructions, configure behavior, test outputs, and
update prompts whenever requirements change. This process is repetitive,
time-consuming, and difficult for people without prompt-engineering
experience.

MOMMA reduces this friction through a guided workflow:

1.  Collect project information.
2.  Analyze the information already available.
3.  Identify missing or conflicting details.
4.  Ask relevant questions.
5.  Build a structured project specification.
6.  Generate a customized bot.
7.  Preserve project state so future updates do not require starting
    over.

### Value proposition

-   **Time savings:** Reduce repeated manual bot setup.
-   **Guided creation:** Help users who do not know what information a
    bot needs.
-   **Context awareness:** Generate a bot around the user's actual
    project.
-   **Consistency:** Use structured project knowledge rather than only
    the original prompt.
-   **Reusability:** Preserve project information and generated
    versions.
-   **Adaptability:** Ask targeted questions when requirements change.
-   **User control:** Let users review, correct, and approve MOMMA's
    understanding.

### Long-term vision

MOMMA may grow to support reusable templates, public bots,
collaboration, APIs, developer integrations, and additional bot types.
These are future possibilities, not requirements for the initial MVP.

## 3. Product Principles

1.  **User-first:** Build around the user's goal, not technology for its
    own sake.
2.  **MVP first:** Deliver a complete small product before expanding.
3.  **Knowledge before generation:** Understand the project before
    generating its bot.
4.  **Project knowledge is central:** The bot is generated from a
    structured understanding.
5.  **User control:** Users can inspect and correct important decisions.
6.  **Project integrity:** Identify conflicts and outdated assumptions.
7.  **Project isolation:** Do not automatically merge knowledge across
    unrelated projects.
8.  **Saved state matters:** Distinguish confirmed state from temporary
    edits.
9.  **Context-aware evolution:** Revisit affected areas when
    requirements change.
10. **Simple architecture:** Avoid unnecessary infrastructure in the
    MVP.
11. **Deployment awareness:** Plan for deployment and secrets management
    early.
12. **Build the product while building the developer:** Prefer
    maintainable technologies that support future learning.

## 4. Current Development Status

The project owner has reported the following as completed.

### Completed

-   [x] Landing page.
-   [x] Login / Sign Up system.

### Landing page content implemented

-   M.O.M.M.A. branding and tagline.
-   Hero section: "Stop Rebuilding AI Assistants. Start Building Your
    Project."
-   Five-step overview: Your Project → Project Context → MOMMA
    Understands → MOMMA Interviews You → Customized Bot.
-   Navigation for How It Works, Under the Hood, FAQ, Log In, and Get
    Started.
-   Interactive MOMMA chat concept and suggested questions.
-   Example flows for an e-commerce store and a personal blog/portfolio.
-   Project knowledge visualization: goals, requirements, constraints,
    and bot responsibilities.
-   FAQ content covering interviews, prompt engineering, and project
    changes.

### Next priorities

-   [ ] Project dashboard and workspace.
-   [ ] Create, save, open, and manage projects.
-   [ ] Project context submission.
-   [ ] File upload and supported document extraction.
-   [ ] Project analysis and editable report.
-   [ ] Adaptive interview.
-   [ ] Structured Project Knowledge.
-   [ ] Customized bot generation.
-   [ ] Bot testing interface.
-   [ ] Bot configuration export/download.
-   [ ] Simplified versioning and project updates.
-   [ ] End-to-end testing and demo preparation.

**Status rule:** A feature is complete only when it is implemented and
tested. Showing it on the landing page does not mean its underlying
functionality exists.

## 5. End-to-End User Journey

``` text
Landing Page
    |
    v
Sign Up / Log In
    |
    v
Dashboard
    |
    v
Create Project
    |
    v
Provide Context + Optional Files
    |
    v
MOMMA Analyzes Context
    |
    v
Analysis Report: Facts, Gaps, Assumptions
    |
    v
User Reviews and Corrects Understanding
    |
    v
Adaptive Interview
    |
    v
Confirm Project Knowledge
    |
    v
Generate Customized Bot
    |
    v
Test Bot in Chat
    |
    v
Export / Download Configuration
    |
    v
Add New Requirements
    |
    v
Targeted Follow-up + New Version
```

## 6. Nine Planning Phases

These are the original product-planning stages, completed or developed
before and alongside implementation.

### Phase 1 --- Start From Your Goal

Define why MOMMA exists, who it serves, the problem it solves, and what
makes it valuable.

**Deliverable:** Problem statement, target audience, product goal, and
value proposition.

### Phase 2 --- Define User Capabilities

Define features, user actions, guardrails, privacy expectations, and
what users should and should not be able to do.

**Deliverable:** User-capability and feature specification.

### Phase 3 --- Design Data Models

Identify the core entities and relationships before finalizing database
implementation.

Core concepts include User, Project, Project Knowledge, Uploaded
Resource, Interview Session, Interview Message, and Bot Version.

**Deliverable:** Conceptual data model and ownership relationships.

### Phase 4 --- Build an MVP

Identify the smallest complete version that proves the product's central
value. Separate essential features from deferred ideas.

**Deliverable:** MVP scope, non-goals, and success criteria.

### Phase 5 --- Draw a Basic Wireframe

Define screens, navigation, and the complete user journey before
implementation.

Core screens: Landing Page, Authentication, Dashboard, Project
Workspace, Analysis Report, Interview, Project Knowledge Review, Bot
Test Chat, and Version History.

**Deliverable:** Wireframe and user flow.

### Phase 6 --- Think About the Future

Plan future users, features, integrations, deployment, and architecture
without overengineering the current version.

**Deliverable:** Future roadmap and separation of MVP scope from later
ideas.

### Phase 7 --- Define Project Components

Define the responsibilities of the frontend, backend, database, AI
services, file processing, authentication, and bot management.

**Deliverable:** High-level system architecture.

### Phase 8 --- Choose the Technology Stack

Choose technologies after understanding the product, favoring a simple
and maintainable stack.

**Planned stack:** React, Python, FastAPI, MySQL, SQLAlchemy,
email/password authentication with OTP, and local file storage for
initial development.

**Deliverable:** Technology decisions and their rationale.

### Phase 9 --- Overall Development Workflow

Build incrementally: project skeleton, persistence, backend, frontend,
AI integration, testing, iterations, and deployment.

**Deliverable:** An implementation sequence made of testable increments.

## 7. MVP Scope

### Required capabilities

-   User registration and login.
-   Project creation and persistence.
-   Project context input.
-   At least one genuinely supported file-processing path.
-   Context analysis and an editable report.
-   Adaptive interview with saved answers.
-   Structured Project Knowledge.
-   Customized bot generation.
-   Bot test chat.
-   Configuration export or download.
-   Basic error handling and project isolation.

### Strong differentiators

-   Show identified knowledge gaps.
-   Distinguish known facts, assumptions, and unresolved questions.
-   Ask meaningful follow-ups.
-   Resume an interrupted interview.
-   Demonstrate a project change producing a new version.
-   Preserve the previous version.

### Explicitly deferred unless the core MVP is complete

-   Voice bots and image-generation bots.
-   Public marketplace and community profiles.
-   Multi-user collaboration.
-   Multi-agent orchestration.
-   Multiple AI-provider selection.
-   Full GitHub synchronization.
-   Automatic production deployment.
-   Billing, enterprise controls, and mobile applications.

## 8. MVP Implementation Roadmap

### Phase 1 --- Project Workspace

**Goal:** Let authenticated users manage projects.

-   Dashboard.
-   Create project.
-   Project name, description, goal, and status.
-   Open, update, and delete projects.
-   Persist data across refreshes.
-   Enforce project ownership.

**Acceptance criterion:** A user can create a project, leave, and reopen
it with saved information intact.

### Phase 2 --- Context Collection

**Goal:** Accept project information in useful formats.

-   Free-text project brief.
-   Optional uploads.
-   File type and size validation.
-   Clear upload and processing status.
-   Extract text from supported documents.
-   Associate resources with the correct project.

Potential formats include PDF, DOCX, TXT, and images, but advertise only
formats that have working extraction.

**Acceptance criterion:** MOMMA can use text input and at least one
supported document type during analysis.

### Phase 3 --- Project Analysis

**Goal:** Produce a reviewable understanding before interviewing.

The report should cover goals, users, requirements, constraints, bot
responsibilities, known facts, assumptions, missing information,
contradictions, and suggested next steps.

User actions: Confirm Understanding, Edit Information, and Re-analyze.

**Acceptance criterion:** The user can inspect and correct MOMMA's
interpretation before the interview proceeds.

### Phase 4 --- Adaptive Interview

**Goal:** Ask targeted questions based on known context and remaining
gaps.

-   Multi-stage interview.
-   One focused question at a time by default.
-   Project-specific follow-ups.
-   Skip questions already answered.
-   Save answers and interview progress.
-   Allow "I don't know" or a sensible default.
-   Identify contradictions.
-   Summarize the final understanding.

**Acceptance criterion:** Different project ideas produce meaningfully
different questions without repeating known information.

### Phase 5 --- Project Knowledge

**Goal:** Convert context and interview answers into a structured
specification.

Include goals, target users, requirements, constraints, bot
responsibilities, knowledge sources, response style, boundaries,
integrations, and unresolved assumptions.

**Acceptance criterion:** The user can review and correct the
specification that will drive generation.

### Phase 6 --- Bot Generation and Testing

**Goal:** Generate one useful bot type, initially a project-specific
website chatbot.

Outputs may include system instructions, bot configuration, project
context, integration guidance, a test chat, and copyable/downloadable
configuration.

**Acceptance criterion:** A judge can ask the generated bot a realistic
question and observe project-specific behavior.

### Phase 7 --- Updates and Versioning

**Goal:** Show that MOMMA can evolve an existing bot.

-   Add a new requirement.
-   Identify affected assumptions.
-   Ask targeted follow-ups.
-   Generate a new version.
-   Preserve the previous version.
-   Display simple version history.

**Acceptance criterion:** Demonstrate V1, a project change, and V2
without destroying V1.

### Phase 8 --- Reliability and Demo Readiness

Test authentication, ownership, persistence, file validation, AI
failures, vague answers, interview resumption, generation failures,
exports, version preservation, and navigation.

**Acceptance criterion:** The complete demo can be repeated without
manual data repair or code changes.

## 9. Adaptive Interview System

The interview is MOMMA's central differentiator. The goal is not to ask
every possible question; it is to cover the relevant aspects of a
project without wasting the user's time.

### Interview pipeline

``` text
Context + Uploaded Resources
             |
             v
      Build Knowledge Map
             |
             v
 Identify Known Facts and Unknowns
             |
             v
     Prioritize Knowledge Gaps
             |
             v
       Ask Targeted Question
             |
             v
      Evaluate User's Answer
             |
       +-----+------+
       |            |
       v            v
  Clear Answer   Ambiguous/Conflicting
       |            |
       v            v
 Update Knowledge  Ask Follow-up
       |            |
       +-----+------+
             |
             v
    Confirm Project Knowledge
             |
             v
       Generate Customized Bot
```

### Interview coverage areas

1.  Project identity and goals.
2.  Target users.
3.  Bot purpose and responsibilities.
4.  Functional requirements and workflows.
5.  Knowledge sources.
6.  Tone, language, format, and response style.
7.  Boundaries, refusals, and escalation.
8.  Integrations.
9.  Technical constraints and output format.
10. Data handling and privacy.
11. Edge cases and failures.
12. Evaluation and success criteria.
13. Future changes.
14. Generation and packaging preferences.

These are coverage categories, not mandatory stages. Skip categories
that are irrelevant or already answered.

### Question priority

-   **Critical:** Generation would be unreliable or unsafe without
    clarification.
-   **Important:** The answer materially improves the bot.
-   **Optional:** A useful refinement that can wait.

### Interview behavior rules

-   Do not ask questions already answered clearly.
-   Ask focused questions and use follow-ups only when valuable.
-   Offer examples and choices where useful.
-   Accept natural-language answers.
-   Distinguish confirmed facts from assumptions.
-   Let the user defer a question or select a sensible default.
-   Save progress and allow resumption.
-   Summarize understanding before generation.
-   Revisit previous answers when a project change invalidates them.

### Completion criteria

The interview is complete when critical requirements are resolved or
explicitly accepted as unresolved, important constraints are documented,
contradictions are addressed, and the user confirms Project Knowledge. A
practical question limit may be used for the demo, but question count
alone should not determine completion.

## 10. Project Knowledge and Bot Generation

### Project Knowledge is central

MOMMA should not rely only on a long conversation transcript. It should
construct a structured representation of what it understands.

Illustrative example:

``` yaml
project:
  name: Jewelry Store Assistant
  goal: Help customers discover products and answer store questions
  target_users:
    - Online shoppers
  requirements:
    - Recommend products from the available catalogue
    - Answer shipping and return questions
  constraints:
    - Do not invent product prices
    - Do not claim an order has shipped without verified data
  knowledge_sources:
    - Product catalogue
    - Approved store FAQ
  unresolved_questions:
    - Whether live order tracking is available
```

This is an illustrative format, not a finalized schema.

### Master template and generated bot

``` text
Project Context
      |
      v
Project Knowledge
      |
      v
Master Template / Bot Blueprint
      |
      v
Generated Bot Version
      |
      v
Test Chat + Export
```

The master template is the authoritative blueprint for the project. A
generated bot is a particular version based on the confirmed knowledge.

### Versioning behavior

``` text
Project Knowledge V1
        |
        v
      Bot V1
        |
        v
  New Requirement
        |
        v
Identify Affected Knowledge
        |
        v
Targeted Follow-up Interview
        |
        v
Project Knowledge V2
        |
        v
      Bot V2
```

Previous saved versions should remain available. Temporary changes
should not silently replace the confirmed project state.

## 11. System Architecture

The planned architecture separates the user interface, application
logic, persistent data, AI services, and file processing.

``` text
                           USER
                            |
                            v
                  REACT / WEB FRONTEND
    +----------------------------------------------+
    | Landing Page and Authentication              |
    | Dashboard and Project Workspace              |
    | Context Upload and Analysis Report            |
    | Interview Interface                           |
    | Project Knowledge Review                      |
    | Bot Test Chat and Version Management          |
    +----------------------------------------------+
                            |
                    HTTPS / REST API
                            |
                            v
                    FASTAPI BACKEND
    +----------------------------------------------+
    | Authentication and Authorization              |
    | Project Management                            |
    | Context and Knowledge Management              |
    | Interview Orchestration                       |
    | AI Processing and Generation                  |
    | File Processing                               |
    | Bot Export and Version Management             |
    +----------------------------------------------+
             |                |                |
             v                v                v
         MYSQL DB          AI / LLM        FILE STORAGE
    +----------------+  +-------------+  +----------------+
    | Users          |  | Analysis    |  | Uploads        |
    | Projects       |  | Questions   |  | Extracted Text |
    | Project        |  | Follow-ups  |  | Exports        |
    | Knowledge      |  | Generation  |  | File Metadata  |
    | Sessions       |  | Evaluation  |  |                |
    | Messages        |  +-------------+  +----------------+
    | Versions       |
    +----------------+
```

### Frontend responsibilities

-   Display pages and forms.
-   Collect user input.
-   Show progress and errors.
-   Display analysis and Project Knowledge.
-   Provide the interview interface.
-   Allow bot testing and export.
-   Display project and version history.

### Backend responsibilities

-   Authenticate and authorize requests.
-   Validate user input and uploads.
-   Enforce project ownership.
-   Coordinate analysis, interviews, and generation.
-   Save project knowledge and conversation state.
-   Manage versions and exports.
-   Keep private API credentials out of frontend code.

### Database responsibilities

-   Store users and project metadata.
-   Persist Project Knowledge.
-   Store interview sessions and messages.
-   Track generated versions and status.
-   Maintain relationships and ownership.

### AI service responsibilities

-   Analyze submitted context.
-   Identify knowledge gaps.
-   Generate interview questions and follow-ups.
-   Summarize confirmed Project Knowledge.
-   Generate bot instructions and configuration.
-   Support bot testing.

### File processing responsibilities

-   Validate file type and size.
-   Extract text from supported formats.
-   Report processing errors.
-   Associate extracted content with the correct project.
-   Manage temporary files and generated exports.

## 12. Core Data Model

### User

Potential fields: `id`, `email`, `password_hash`, `is_verified`,
`created_at`, `updated_at`.

### Project

Potential fields: `id`, `user_id`, `name`, `description`, `goals`,
`status`, `created_at`, `updated_at`.

### Uploaded Resource

Potential fields: `id`, `project_id`, `file_name`, `file_type`,
`file_size`, `storage_path`, `extracted_text_reference`, `created_at`.

### Project Knowledge

Potential fields: `id`, `project_id`, `summary`, `goals`,
`target_users`, `requirements`, `bot_responsibilities`, `constraints`,
`tone_style`, `unresolved_questions`, `updated_at`.

### Interview Session

Potential fields: `id`, `project_id`, `status`, `current_stage`,
`created_at`, `updated_at`.

### Interview Message

Potential fields: `id`, `session_id`, `role`, `content`, `metadata`,
`created_at`.

### Bot Version

Potential fields: `id`, `project_id`, `version_number`, `bot_name`,
`instructions`, `configuration`, `source_code_reference`, `created_at`.

### Conceptual relationships

``` text
User 1 -------- N Projects
Project 1 ----- N Uploaded Resources
Project 1 ----- 1/N Project Knowledge Snapshots
Project 1 ----- N Interview Sessions
Interview Session 1 -- N Interview Messages
Project 1 ----- N Bot Versions
```

These are conceptual entities. The exact schema may change during
implementation.

## 13. Technology Stack

  -----------------------------------------------------------------------
  Layer                   Planned technology      Purpose
  ----------------------- ----------------------- -----------------------
  Frontend                React                   User interface

  Backend                 Python                  Application and AI
                                                  workflow logic

  API framework           FastAPI                 Backend API

  Database                MySQL                   Persistent relational
                                                  data

  ORM                     SQLAlchemy              Database access and
                                                  maintainability

  Authentication          Email/password + OTP    Account access and
                                                  verification

  File storage            Local storage initially Uploaded resources and
                                                  exports

  AI                      API-based LLM           Analysis, interviews,
                          integration             and generation
  -----------------------------------------------------------------------

### Stack principles

-   Select technologies to fit the product.
-   Avoid unnecessary infrastructure.
-   Keep AI providers behind a manageable service interface.
-   Abstract file storage where practical.
-   Use environment variables or a secret manager for private
    credentials.
-   Document the actual services used in the hackathon build.
-   Do not claim a planned technology is implemented until it has been
    connected and tested.

**Hackathon flexibility:** A compatible managed backend may be used if
it materially speeds up delivery. Document any substitution. The actual
deployed implementation may differ from the planned stack during the
MVP.

## 14. Security and Privacy

### Authentication

-   Hash passwords securely.
-   Verify email addresses if OTP registration is implemented.
-   Protect authenticated routes.
-   Apply secure session/token handling.
-   Support password recovery securely.

### Authorization and project isolation

-   Every project belongs to a user.
-   Verify ownership on every project-specific operation.
-   Prevent access to another user's projects, files, messages, and
    bots.
-   Do not automatically share knowledge across unrelated projects.

### File handling

-   Validate allowed types and sizes.
-   Handle corrupt or unsupported files.
-   Avoid exposing private file paths.
-   Apply appropriate retention and deletion behavior.

### AI and bot boundaries

-   Treat uploaded documents as data, not trusted system instructions.
-   Do not let project content override platform security rules.
-   Record uncertainty rather than inventing facts.
-   Do not claim integrations are active unless implemented.
-   Do not claim the bot performed actions it did not perform.
-   Apply suitable restrictions to harmful or abusive use.

### Secrets

-   Never expose private AI API keys in frontend code.
-   Do not commit `.env` files or credentials.
-   Separate development and production secrets where applicable.

### Deletion

Project deletion should remove or appropriately retire associated
records and resources. Retention and backup behavior must be documented
and tested.

## 15. UX Principles

The intended experience should communicate confidence, control, and
transparency.

### Important states

-   Draft.
-   Analyzing.
-   Interviewing.
-   Awaiting confirmation.
-   Ready to generate.
-   Generating.
-   Generated.
-   Failed / retry available.

### UX requirements

-   Explain what MOMMA is doing during longer operations.
-   Show clear progress and error states.
-   Let users correct project understanding.
-   Allow interview resumption.
-   Confirm destructive operations.
-   Avoid trapping users in an interview.
-   Make saved versus unsaved state clear.
-   Explain why a follow-up question is needed when useful.
-   Keep navigation consistent with the existing landing-page design.

### Visual continuity

The existing landing page uses warm neutral backgrounds, dark
typography, rounded panels, and restrained accent colors. The
application workspace should extend this visual language rather than
introduce an unrelated design system.

## 16. Testing and Acceptance Criteria

1.  **Context test:** Does the report reflect the user's actual input?
2.  **Adaptivity test:** Do different projects produce meaningfully
    different questions?
3.  **Knowledge consistency test:** Do confirmed answers appear in
    Project Knowledge and the generated bot?
4.  **Evolution test:** Does a new requirement produce an updated
    version while preserving the previous one?
5.  **Recovery test:** Can the user refresh and recover saved progress?
6.  **Authorization test:** Does the system deny access when a user
    tries another user's project ID?
7.  **File test:** Are unsupported, oversized, and corrupt files handled
    clearly?
8.  **Failure test:** Does an AI/network failure preserve existing
    project data?
9.  **Export test:** Can the downloaded output be opened and used as
    documented?
10. **Demo test:** Can the complete demonstration be repeated without
    manual data edits or code changes?

## 17. Team Workflow

Suggested ownership for a three-person hackathon team:

### Product and AI lead

-   Own product scope and interview design.
-   Define Project Knowledge.
-   Coordinate analysis and generation.
-   Define API contracts.
-   Integrate the end-to-end workflow.
-   Own the product explanation and architecture presentation.

### Frontend and workspace lead

-   Build the dashboard and project pages.
-   Implement context input and upload UI.
-   Build the interview interface.
-   Build analysis and knowledge review screens.
-   Implement bot preview, version history, and navigation.

### Backend and reliability lead

-   Implement persistence and relationships.
-   Implement validation and authorization.
-   Integrate file processing.
-   Implement or coordinate AI service calls.
-   Save interview progress and generated outputs.
-   Test failure handling and the full workflow.

Adjust these roles based on the team's strengths.

### Parallel development rules

-   Maintain one canonical project/repository.
-   Define interfaces before splitting work.
-   Assign clear page/module ownership.
-   Avoid uncoordinated edits to shared components.
-   Integrate frequently.
-   Test the combined application after each major integration.
-   Keep credentials out of shared source code.

## 18. Hackathon Demo Plan

### Demonstration project: Jewelry Store Assistant

Use a fictional handmade jewelry store to demonstrate the complete
lifecycle.

1.  Create a project with a short store description.
2.  Upload a small product catalogue or enter sample product data.
3.  Show MOMMA's analysis report.
4.  Demonstrate a missing requirement about shipping or returns.
5.  Answer the adaptive interview questions.
6.  Review Project Knowledge.
7.  Generate the store chatbot.
8.  Ask it a product or policy question.
9.  Add a new requirement.
10. Show a targeted follow-up and updated bot version.

### Demo preparation

-   Prepare stable sample data and files.
-   Verify AI credentials and service availability.
-   Confirm that output is generated from Project Knowledge.
-   Prepare a fallback if a live AI request fails.
-   Do not rely on untested features.
-   Demonstrate one complete story rather than many disconnected
    features.

### Pitch message

> MOMMA turns incomplete project context into a structured
> understanding, asks only the questions that matter, and creates an AI
> assistant that evolves with the project.

## 19. Future Roadmap

### Version 1 --- Individual project-to-bot workflow

-   Authentication.
-   Project workspace.
-   Context analysis.
-   Adaptive interview.
-   Project Knowledge.
-   Bot generation and testing.
-   Export.
-   Basic versioning.

### Version 2 --- Better individual-user experience

Potential additions: improved project management, more bot configuration
options, GitHub integration, better document support, version
comparison, additional authentication options, and mobile experience.

### Version 3 --- Sharing and discovery

Potential additions: public templates, public bots, creator profiles,
community browsing, and publishing controls.

### Version 4 --- Collaboration

Potential additions: shared projects, multi-user collaboration,
collaborative review, team workspaces, and permissions.

### Later developer ecosystem

Potential additions: APIs, GitHub synchronization, IDE integrations,
CI/CD workflows, automated deployment, additional bot types, and
advanced multi-agent workflows.

The core context → interview → knowledge → generation lifecycle should
remain recognizable as the platform expands.

## 20. Scope Control

Classify every new idea:

-   **Blocker:** Ignoring it could cause major rework or prevent the MVP
    from working. Address it now.
-   **Beta enhancement:** Useful but not essential. Add it to a later
    milestone if time allows.
-   **Future vision:** Interesting but not required now. Record it in
    the backlog.

Potential future items include voice generation, image generation,
marketplaces, multi-agent orchestration, analytics, advanced
integrations, and automatic deployment.

> Capture the idea; do not automatically expand the current sprint.

## 21. Development Workflow

Recommended implementation sequence:

1.  Preserve and test the existing landing page and authentication.
2.  Establish project skeleton, configuration, and environment setup.
3.  Implement the minimum data model and project ownership.
4.  Build project create/open/update/delete.
5.  Implement context input and supported file processing.
6.  Build analysis report and correction workflow.
7.  Implement adaptive interviews, persistence, and resumption.
8.  Build structured Project Knowledge.
9.  Generate bot instructions and configuration.
10. Add bot testing and export.
11. Add simplified versioning.
12. Test normal cases, failures, privacy, and recovery.
13. Configure deployment, secrets, database, and storage.
14. Prepare and repeatedly test the demonstration.

Build in vertical slices. Each milestone should produce a working,
testable increment rather than disconnected components.

## 22. Open Decisions

These implementation details require confirmation:

-   Which backend and database services the current Lovable application
    actually uses.
-   Whether authentication is connected to persistent user records.
-   Which file types have fully working parsers.
-   Which AI provider/model will be used.
-   Whether generated output is configuration-only or includes a
    runnable integration package.
-   How project deletion, temporary uploads, and backups work.
-   The final hackathon deployment target.
-   Which versioning capabilities can fit the deadline.

Do not document an open question as a completed capability until it is
implemented and tested.

## 23. Success Criteria

The MVP is successful when a user can:

-   [ ] Create an account and sign in.
-   [ ] Create and reopen a project.
-   [ ] Provide project context and supported resources.
-   [ ] Receive an accurate, reviewable analysis.
-   [ ] Complete an adaptive interview.
-   [ ] Review and confirm Project Knowledge.
-   [ ] Generate a customized bot.
-   [ ] Test the bot in a chat interface.
-   [ ] Export the generated configuration.
-   [ ] Return later without losing saved project information.
-   [ ] Add a requirement and generate an updated version if versioning
    is included in the demo.
-   [ ] Use the product without violating project isolation or losing
    data on common failures.

The most important success measure is not the number of screens or
features. It is whether MOMMA reliably demonstrates its central promise.

## 24. Suggested Repository Structure

The final structure should match the actual implementation. A Python +
React implementation could begin with:

``` text
momma/
├── README.md
├── .gitignore
├── .env.example
├── docs/
│   ├── architecture.md
│   ├── product-requirements.md
│   └── demo-plan.md
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── features/
│   │   └── services/
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   └── requirements.txt
├── tests/
└── storage/
```

This is a suggestion, not a description of the current repository. Do
not commit uploaded private user files, secrets, local database files,
or generated personal data unless they are intentionally safe test
fixtures.

------------------------------------------------------------------------

## Final Summary

MOMMA began as an AI bot generator, but its defining idea is broader:
maintain an understanding of a project and use that understanding to
create and evolve a project-specific assistant.

``` text
Context
   |
   v
Analysis
   |
   v
Adaptive Interview
   |
   v
Confirmed Project Knowledge
   |
   v
Bot Generation
   |
   v
Testing and Export
   |
   v
New Requirements
   |
   v
Updated Knowledge and New Version
```

The immediate priority is to turn the existing landing page and
authentication into a complete working product. Focus first on project
persistence, context analysis, the adaptive interview, Project
Knowledge, and bot generation. Add versioning in a simplified form, then
expand only after the core journey works reliably.

**MOMMA's central principle: evolve the bot by evolving its
understanding of the project---not by repeatedly starting from
scratch.**
