# M.O.M.M.A. — My Online Mentor and Model Architect

> **Understand the project. Ask the right questions. Build a bot that evolves with it.**

M.O.M.M.A. is an AI-powered web platform designed to help users transform project ideas, requirements, and supporting documents into structured specifications and customized AI bots. Instead of generating a solution from incomplete instructions, MOMMA analyzes the available context, identifies gaps and ambiguities, proposes a preliminary plan, interviews the user, and generates a bot from the user's confirmed requirements.

MOMMA is intended to be more than a one-time prompt generator. It maintains project context and history so that future changes can be handled systematically rather than by starting from scratch.

> **Version 1 focus:** A functional, locally hosted MVP that proves the complete project-to-bot workflow.

Website Link: https://momma-la9o.onrender.com/auth
---

## Table of Contents

1. [Overview](#1-overview)
2. [Problem and Vision](#2-problem-and-vision)
3. [Product Principles](#3-product-principles)
4. [Development Status](#4-development-status)
5. [Core User Journey](#5-core-user-journey)
6. [Version 1 Scope](#6-version-1-scope)
7. [Core Features](#7-core-features)
8. [Adaptive Interview System](#8-adaptive-interview-system)
9. [Project Knowledge and Bot Generation](#9-project-knowledge-and-bot-generation)
10. [Technical Architecture](#10-technical-architecture)
11. [Data Model](#11-data-model)
12. [Technology Stack](#12-technology-stack)
13. [Security, Privacy, and AI Guardrails](#13-security-privacy-and-ai-guardrails)
14. [User Experience Requirements](#14-user-experience-requirements)
15. [Development Roadmap](#15-development-roadmap)
16. [Testing and Definition of Done](#16-testing-and-definition-of-done)
17. [Repository Structure](#17-repository-structure)
18. [Future Roadmap](#18-future-roadmap)
19. [Risks and Scope Control](#19-risks-and-scope-control)
20. [Open Decisions](#20-open-decisions)
21. [Final Product Statement](#21-final-product-statement)

---

## 1. Overview

- **Product:** M.O.M.M.A.
- **Full form:** My Online Mentor and Model Architect
- **Category:** AI-powered project-to-bot creation platform
- **Initial platform:** Web application
- **Primary users:** Students, beginner/intermediate developers, independent builders, and AI enthusiasts
- **Initial deployment:** Local development environment
- **Core outcome:** A customized bot specification and supported implementation artifacts, generated from confirmed project requirements

### Product promise

MOMMA helps users move from an initial project idea to a clearly specified, customized AI bot through a guided, persistent, and user-controlled process.

### Product vision

Make AI-powered software creation more accessible by helping users turn ideas into well-defined, customizable, and maintainable AI bots through a guided architectural process.

### Product mission

Help users move from an initial project idea to a clearly specified and generated bot without requiring them to independently manage every architectural decision.

---

## 2. Problem and Vision

Developers, students, and independent builders often have project ideas but struggle to convert them into complete technical specifications and working implementations.

Common challenges include:

- Incomplete or ambiguous requirements.
- Difficulty identifying missing information before development.
- Limited experience with data models and application architecture.
- AI-generated output that does not match the actual project.
- Inconsistent assumptions across multiple AI conversations.
- Scattered documents, interview answers, reports, and generated files.
- Repeated manual prompting when requirements change.
- Uncertainty about what to implement next.

MOMMA addresses these challenges through a structured workflow:

1. Collect project context and supported documents.
2. Analyze the information provided.
3. Identify missing details, assumptions, and potential conflicts.
4. Produce a preliminary project plan and report.
5. Let the user review and correct the report.
6. Ask targeted interview questions to resolve important gaps.
7. Consolidate the confirmed requirements into structured Project Knowledge.
8. Generate a customized bot specification and supported implementation output.
9. Preserve project state and bot versions for future updates.

### Intended value

- **Guided creation:** Help users who do not know what information a bot needs.
- **Better context:** Base generation on the user's actual project.
- **Transparency:** Distinguish confirmed facts from assumptions and unknowns.
- **User control:** Let users review and approve important decisions.
- **Continuity:** Preserve context, interview progress, and generated versions.
- **Adaptability:** Reassess affected decisions when requirements change.

---

## 3. Product Principles

1. **Understand before building:** Analyze requirements before generating a solution.
2. **Correctness over speed:** Prefer consistent output over rushed generation.
3. **User control:** The user makes final decisions about their project.
4. **Transparency:** Explain what MOMMA understands and what remains uncertain.
5. **Knowledge before generation:** Use structured Project Knowledge, not only a chat transcript.
6. **Consistency:** Reassess decisions affected by changing requirements.
7. **Project isolation:** Do not automatically mix knowledge from unrelated projects.
8. **MVP first:** Complete the core workflow before expanding scope.
9. **Honest status:** Never claim a feature or generated artifact works unless it has been implemented and tested.
10. **Simple architecture:** Avoid unnecessary infrastructure during the initial release.

---

## 4. Development Status

The project owner previously reported the following as completed. This status should be updated as the repository changes.

### Reported as completed

- [x] Landing page.
- [x] Login / Sign Up interface or system.

### Reported landing-page elements

- M.O.M.M.A. branding and tagline.
- Hero section introducing the project-to-bot concept.
- Overview of the five-step journey: Project → Context → Understanding → Interview → Customized Bot.
- Navigation for product information, FAQ, login, and getting started.
- Interactive MOMMA chat concept and suggested questions.
- Example project flows.
- Project knowledge visualization.
- FAQ content covering interviews, prompt engineering, and project changes.

### Next implementation priorities

- [ ] Confirm persistent account authentication and email verification.
- [ ] Dashboard and project workspace.
- [ ] Create, open, edit, and delete projects.
- [ ] Save project context.
- [ ] Upload and extract text from supported documents.
- [ ] AI context analysis and preliminary report.
- [ ] Report review, correction, and confirmation.
- [ ] Adaptive interview with saved answers and resumption.
- [ ] Structured Project Knowledge.
- [ ] Customized bot specification and supported output generation.
- [ ] Bot output review and download.
- [ ] Basic bot/version history.
- [ ] End-to-end testing and local setup documentation.

**Status rule:** A landing-page element is not proof that the underlying feature exists. Mark a feature complete only after implementation and testing.

---

## 5. Core User Journey

```text
Landing Page
    |
    v
Register / Log In
    |
    v
Dashboard
    |
    v
Create Project
    |
    v
Enter Context + Upload Supported Files
    |
    v
MOMMA Analyzes Context
    |
    v
Preliminary Report + Project Plan
    |
    v
User Reviews, Corrects, and Confirms
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
Review / Test / Download Supported Output
    |
    v
Update Project Requirements
    |
    v
Reassess Affected Knowledge + Create New Version
```

At every stage, the application should make the current status, saved state, and next available action clear.

---

## 6. Version 1 Scope

### In scope

- Email-and-password account registration and login.
- Email OTP verification during registration.
- Secure logout and a verified password-recovery flow.
- Project creation and management.
- Text-based project context submission.
- Upload and extraction for supported document formats.
- AI analysis and preliminary project plan/report.
- User review, correction, and confirmation.
- Interactive interview based on missing requirements.
- Persistence and resumption of interview progress where implemented.
- Structured Project Knowledge.
- Customized bot specification and supported generated artifacts.
- Basic bot/version records and retrieval.
- Local file storage and local development.
- Clear error handling and project ownership enforcement.

### Out of scope for the initial MVP

- Public bot marketplace or community profiles.
- Automatic linking of multiple bots.
- Native Android or iOS applications.
- Enterprise-grade collaboration and organization administration.
- Distributed microservices or complex cloud infrastructure.
- Automatic production deployment of every generated bot.
- Support for every AI provider or every bot modality.
- Unrestricted autonomous execution of generated code.
- A guarantee that every generated implementation is production-ready.

These items may be evaluated after the core workflow is reliable.

---

## 7. Core Features

### 7.1 Authentication and Account Management

Users should be able to register with an email address and password, verify their email using a one-time code, log in, log out, and recover access through a verified process.

Requirements:

- Passwords must be securely hashed and never stored as plaintext.
- Verification codes must expire and be protected against repeated guessing.
- Protected endpoints must require valid authentication.
- Users may access only their own projects and associated resources.
- Google Sign-In and mandatory OTP verification on every login are not part of the initial scope.

### 7.2 Dashboard and Project Management

Users need a central place to manage their projects.

Requirements:

- Create a project with a name and optional description.
- View existing projects and their statuses.
- Open and edit a project.
- Delete a project after confirmation.
- Persist project data across refreshes and later sessions.
- Preserve the relationships between a project and its context, reports, interviews, files, and generated versions.

### 7.3 Project Context Collection

Users should be able to provide a project brief and supporting files.

Requirements:

- Accept text input.
- Support only document formats with working extraction.
- Validate file types, file sizes, and upload errors.
- Associate uploads and extracted text with the correct project.
- Preserve original context or a recoverable version.
- Let users review and update context.
- Distinguish user-provided content from AI-generated interpretations.

PDF and DOCX are intended supported formats, subject to the actual implementation. Do not advertise formats that are not fully supported.

### 7.4 AI Context Analysis and Planning

MOMMA analyzes context before beginning the interview.

The preliminary report should include:

- Project title and summary.
- Problem statement and objectives.
- Intended users.
- Proposed bot capabilities and responsibilities.
- Key requirements and constraints.
- Missing information and open questions.
- Assumptions, ambiguities, and potential conflicts.
- Risks and preliminary implementation tasks.
- Recommended next steps.

Users must be able to review, correct, and request a revised analysis. MOMMA must not present guesses as confirmed facts or report failed analysis as successful.

### 7.5 User Review and Confirmation

Before proceeding, users should be able to:

- Review the preliminary report.
- Correct inaccurate interpretations.
- Modify the project context.
- Request re-analysis.
- Confirm the proposed project definition.
- Return to earlier stages when necessary.

MOMMA must not silently treat an unconfirmed report as final.

### 7.6 Interactive AI Interview

The interview resolves important gaps remaining after analysis.

Requirements:

- Generate questions from the current project context.
- Focus on missing requirements, ambiguities, and constraints.
- Use earlier answers when generating follow-up questions.
- Avoid asking questions already answered clearly.
- Allow users to close and resume the interview.
- Preserve messages and progress where implemented.
- Allow previously supplied answers to be changed.
- Explain when context changes require earlier conclusions to be reconsidered.
- Distinguish changes to an answer from changes to the underlying project definition.

If the fundamental project context changes, MOMMA should reanalyze the revised definition, identify invalidated assumptions, regenerate affected questions/results, and request confirmation before continuing.

### 7.7 Final Specification and Bot Generation

MOMMA consolidates confirmed context, analysis, and interview answers into a final bot specification.

Depending on the implemented generator, output may include:

- Bot specification.
- System instructions or bot configuration.
- Relevant implementation code.
- Required dependencies and setup instructions.
- Usage instructions.
- Known limitations and unresolved assumptions.

Requirements:

- Generated output must reflect the latest confirmed project definition.
- Users should be able to review the specification.
- Supported output files should be downloadable.
- Generation status and errors must be recorded.
- Outputs must be linked to their originating project and version.
- Untested output must be identified as untested.
- Failed generation must not be presented as successful bot creation.

The exact output format depends on the generator implemented for Version 1.

### 7.8 Bot and Version Management

- Assign generated bots unique identifiers.
- Associate each bot with its parent project.
- Maintain basic version records.
- Link each version to its specification and generated artifacts.
- Allow users to view and retrieve available versions.
- Do not silently overwrite a previously saved version.
- Preserve version history according to the documented retention policy.

---

## 8. Adaptive Interview System

The interview is one of MOMMA's defining features. Its goal is not to ask every possible question; it is to resolve the gaps that matter for the user's project.

### Interview pipeline

```text
Project Context + Supported Resources
              |
              v
       Build Knowledge Map
              |
              v
 Identify Facts, Assumptions, and Gaps
              |
              v
       Prioritize Knowledge Gaps
              |
              v
        Ask Targeted Question
              |
              v
        Evaluate User Answer
              |
       +------+------+
       |             |
       v             v
  Clear Answer   Ambiguous / Conflicting
       |             |
       v             v
 Update Knowledge  Ask Follow-up
       |             |
       +------+------+
              |
              v
    Confirm Project Knowledge
              |
              v
       Generate Customized Bot
```

### Interview coverage areas

Depending on the project, MOMMA may clarify:

1. Project identity and goals.
2. Target users.
3. Bot purpose and responsibilities.
4. Functional requirements and workflows.
5. Knowledge sources.
6. Tone, language, and response format.
7. Boundaries and escalation behavior.
8. Integrations.
9. Technical constraints and output format.
10. Data handling and privacy.
11. Edge cases and failure behavior.
12. Evaluation criteria and success measures.
13. Future changes and generation preferences.

These are coverage categories, not mandatory stages. Skip irrelevant areas and those already answered.

### Question priority

- **Critical:** Generation would be unreliable or unsafe without clarification.
- **Important:** The answer materially improves the result.
- **Optional:** A refinement that can wait.

### Interview completion

The interview is ready to conclude when critical requirements are resolved or explicitly accepted as unresolved, important constraints are documented, contradictions are addressed, and the user confirms Project Knowledge. Question count alone should not determine completion.

---

## 9. Project Knowledge and Bot Generation

### Project Knowledge is central

MOMMA should not rely only on a long conversation transcript. It should maintain a structured representation of the project that can be reviewed, corrected, and used consistently during generation.

Illustrative example:

```yaml
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

This example illustrates the concept; it is not a finalized database schema.

### Generation lifecycle

```text
Project Context
      |
      v
Preliminary Analysis
      |
      v
Interview Answers
      |
      v
Confirmed Project Knowledge
      |
      v
Bot Blueprint / Specification
      |
      v
Generated Bot Version
      |
      v
Review, Test, and Export
```

### Updating a bot

When a project changes, MOMMA should identify affected knowledge and conclusions, ask follow-up questions where needed, and create a new version. Earlier saved versions should remain available; temporary edits must not silently replace confirmed state.

---

## 10. Technical Architecture

Version 1 is planned as a modular application rather than a distributed microservice system.

```text
                    USER
                     |
                     v
              REACT FRONTEND
  +--------------------------------------+
  | Authentication                       |
  | Dashboard and Project Workspace      |
  | Context Input and Uploads            |
  | Analysis Report and Review            |
  | Interview and Project Knowledge      |
  | Bot Output and Version History       |
  +--------------------------------------+
                     |
               REST API / HTTP
                     |
                     v
               FASTAPI BACKEND
  +--------------------------------------+
  | Authentication and Authorization     |
  | Project and Context Management       |
  | Document Processing                  |
  | AI Analysis and Interview Workflow   |
  | Bot Generation and Versioning        |
  | Export and Error Handling            |
  +--------------------------------------+
          |              |             |
          v              v             v
       MYSQL DB       AI PROVIDER   LOCAL STORAGE
       Users          Analysis      Uploaded files
       Projects       Questions     Generated files
       Context        Generation    File metadata
       Reports
       Interviews
       Bot versions
```

### Frontend responsibilities

- Display pages, forms, project state, progress, and errors.
- Collect user input and upload files.
- Display analysis and Project Knowledge.
- Provide the interview experience.
- Allow users to review generated output and versions.
- Provide supported downloads.

### Backend responsibilities

- Authenticate users and authorize protected requests.
- Validate input and uploads.
- Enforce project ownership.
- Coordinate analysis, interviews, and generation.
- Save project state and interview progress.
- Manage versions, files, and exports.
- Keep private API credentials out of frontend code.

### Service layer

The backend should separate responsibilities into manageable services where practical, including authentication, project management, document extraction, AI-provider access, interview orchestration, report generation, bot generation, and file storage.

### Architecture principles

- Keep business logic outside route handlers where practical.
- Use SQLAlchemy for organized database access.
- Isolate provider-specific AI code behind a service interface.
- Isolate file storage behind a storage interface.
- Keep configuration separate from application logic.
- Use environment variables for secrets.
- Avoid premature microservices and unnecessary infrastructure.

---

## 11. Data Model

The following is a logical model, not a claim about the current database schema.

| Entity | Purpose |
|---|---|
| User | Account identity, email verification, and account status |
| Project | Owner, name, description, status, and timestamps |
| Project Context | Submitted context, source, and context version |
| Uploaded File | Filename, type, size, storage reference, and extraction status |
| Analysis Report | Analysis content, source context version, status, and timestamp |
| Interview Session | Interview status, context version, and timestamps |
| Interview Message | User/assistant message content and metadata |
| Bot | Identity, parent project, and status |
| Bot Version | Version label, specification, artifact reference, and generation status |
| Generation Job | Operation type, status, error details, and timestamps |

### Relationships

- One user can own multiple projects.
- One project can have multiple context versions, uploaded files, reports, and interview sessions.
- One interview session can contain multiple messages.
- One project can have multiple bots.
- One bot can have multiple versions.
- Generation jobs can reference the project and resulting artifacts.

### Data integrity rules

- Every project must belong to a valid owner.
- Related resources must reference valid projects.
- Every bot version must reference a valid bot.
- Context changes should be traceable where needed.
- Related records and files must follow documented deletion rules.
- Database transactions should protect operations that update related records together.

---

## 12. Technology Stack

| Component | Planned technology | Purpose |
|---|---|---|
| Frontend | React | User interface |
| Backend language | Python | Application and AI workflow logic |
| Backend framework | FastAPI | REST API |
| Database | MySQL | Persistent relational data |
| Database access | SQLAlchemy ORM | Database models and queries |
| API communication | REST API | Frontend/backend communication |
| Authentication | Email/password + email OTP verification | Account access and verification |
| File storage | Local filesystem initially | Uploaded resources and generated artifacts |
| AI integration | Provider/model adapter to be finalized | Analysis, interview, and generation |
| Initial deployment | Local development environment | MVP development and testing |

The final dependency versions, AI provider/model, email-delivery method, and build tooling must be documented before implementation. A planned technology must not be described as implemented until it is connected and tested.

---

## 13. Security, Privacy, and AI Guardrails

### Authentication and authorization

- Store password hashes, never plaintext passwords.
- Expire verification codes and protect them against repeated guessing.
- Use secure session or token handling.
- Enforce authorization on every protected resource.
- Verify project ownership for every project-specific operation.
- Prevent access to another user's files, reports, messages, and bots.

### File handling and privacy

- Validate file types and sizes.
- Handle corrupt and unsupported files clearly.
- Avoid exposing internal file paths.
- Associate uploaded files with the correct user and project.
- Define how deletion affects database records and files.
- Avoid storing sensitive prompts, documents, or credentials in logs unnecessarily.
- Inform users when project content is sent to an external AI provider.

### AI behavior

MOMMA should:

1. Ground analysis in supplied context.
2. Distinguish confirmed requirements from assumptions.
3. Ask questions when important information is missing.
4. Explain major recommendations in accessible language.
5. Reassess conclusions when their assumptions change.
6. Avoid silently replacing confirmed requirements.
7. Communicate uncertainty and generation failures honestly.
8. Respect the user's authority to approve or reject changes.
9. Never claim generated artifacts were tested unless testing occurred.

Uploaded documents must be treated as project data, not as trusted instructions that can override application security policies. Generated code must not execute automatically without an explicitly designed and controlled execution environment.

### Secrets

- Never expose private AI API keys in frontend code.
- Do not commit `.env` files or credentials.
- Provide an `.env.example` with placeholder values only.
- Keep secrets out of version control and error messages.

---

## 14. User Experience Requirements

MOMMA should feel like a friendly, thoughtful technical mentor.

### Communication style

- Use clear, accessible language.
- Explain important technical decisions.
- Avoid overwhelming beginners with unnecessary jargon.
- Identify uncertainty honestly.
- Explain errors and offer actionable recovery steps.
- Ask focused questions rather than presenting long, generic questionnaires.

### Important workflow states

- Draft.
- Analyzing.
- Awaiting review.
- Interviewing.
- Awaiting confirmation.
- Ready to generate.
- Generating.
- Generated.
- Failed / retry available.

### UX requirements

- Show a clear processing indicator during longer operations.
- Explain which operation is in progress.
- Do not fabricate progress percentages.
- Prevent duplicate submissions caused by repeated clicks.
- Allow safe cancellation where technically feasible.
- Make saved versus unsaved state clear.
- Allow users to return to earlier stages.
- Confirm destructive operations.
- Explain significant resets when context changes invalidate earlier reasoning.
- Preserve the existing landing-page design language where practical.

---

## 15. Development Roadmap

### Phase 1 — Application Foundation

- Establish frontend and backend structure.
- Configure environment-based settings.
- Configure MySQL and SQLAlchemy.
- Establish API conventions and error handling.
- Add database migrations.

### Phase 2 — Authentication and Project Workspace

- Implement registration, email verification, login, and logout.
- Protect backend endpoints.
- Build the dashboard.
- Implement project creation, viewing, editing, and deletion.
- Enforce project ownership.

### Phase 3 — Context Management

- Implement text input and supported document uploads.
- Add validation and text extraction.
- Save context and file metadata.
- Implement local storage abstraction.

### Phase 4 — AI Analysis and Review

- Select and integrate an AI provider.
- Analyze project context.
- Generate a structured preliminary report and task plan.
- Build review, correction, confirmation, and re-analysis workflows.
- Handle AI errors and processing states.

### Phase 5 — Interview System

- Generate contextual questions and follow-ups.
- Store interview messages and answers.
- Support closing and resuming sessions.
- Implement context-change reassessment rules.
- Produce reviewable Project Knowledge.

### Phase 6 — Bot Generation and Versioning

- Generate the final bot specification.
- Implement the selected output generator.
- Save generation status and artifacts.
- Add bot/version management.
- Provide downloads for supported outputs.

### Phase 7 — Testing and Local Release

- Test complete user journeys.
- Test authorization boundaries.
- Test malformed and unsupported uploads.
- Test AI-provider failures and interrupted workflows.
- Verify that saved progress can be recovered.
- Document installation and operation.
- Prepare a stable local demonstration.

### Phase 8 — Public-Readiness Review

- Review security and privacy.
- Evaluate deployment and storage requirements.
- Resolve known defects.
- Assess whether external users can safely access the application.
- Decide whether and how to deploy a public version.

**Implementation rule:** Build in vertical slices. Each phase should produce a working, testable increment rather than disconnected components.

---

## 16. Testing and Definition of Done

### Core acceptance tests

1. **Authentication:** Registration, verification, login, and logout work as expected.
2. **Persistence:** A user can create a project, leave, and reopen it with saved information intact.
3. **Context analysis:** The report reflects the user's actual input.
4. **Adaptivity:** Different projects produce meaningfully different interview questions.
5. **Knowledge consistency:** Confirmed answers appear in Project Knowledge and generated output.
6. **Recovery:** Saved progress can be recovered after refresh or interruption where supported.
7. **Authorization:** A user cannot access another user's project by changing an identifier.
8. **File handling:** Unsupported, oversized, and corrupt files produce understandable errors.
9. **Failure handling:** AI or network failures do not falsely report success or destroy saved project data.
10. **Generation:** Generated output is linked to the correct project and reflects confirmed requirements.
11. **Versioning:** New versions do not silently overwrite older saved versions.
12. **Export:** Downloaded output can be opened and used according to its documented instructions.
13. **Repeatability:** The core workflow can be demonstrated without manual database repair or code changes.

### Version 1 definition of done

MOMMA is ready for its initial local release when:

- [ ] Authentication works reliably.
- [ ] Users can create and manage projects.
- [ ] Context can be submitted and stored.
- [ ] Supported documents can be processed.
- [ ] A preliminary analysis report is generated.
- [ ] Users can review and correct the report.
- [ ] The interview gathers and retains missing requirements.
- [ ] Significant context changes trigger appropriate reassessment.
- [ ] Confirmed Project Knowledge produces the supported bot output.
- [ ] Generated artifacts and versions are retrievable.
- [ ] Critical workflows and authorization checks pass.
- [ ] The application can be installed and run using documented instructions.
- [ ] Known limitations are documented honestly.

Success is measured by whether MOMMA reliably demonstrates its core promise, not by the number of screens or features.

---

## 17. Repository Structure

The final structure must reflect the actual implementation. A possible Python + React layout is:

```text
momma/
├── README.md
├── .gitignore
├── .env.example
├── docs/
│   ├── product-requirements.md
│   ├── architecture.md
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

This is a suggested layout, not a description of the repository's current files. Do not commit secrets, private uploaded files, local database files, or personal data.

---

## 18. Future Roadmap

Future work should be considered only after the core workflow is reliable.

### Version 2 — Improved individual experience

- Better project management.
- More bot configuration options.
- Improved document support.
- Version comparison and rollback.
- Additional authentication options.
- Improved mobile-friendly experience.

### Version 3 — Sharing and discovery

- Public bot templates.
- Publishing controls.
- Creator profiles and community browsing.

### Version 4 — Collaboration

- Shared projects.
- Team workspaces.
- Collaborative review and permissions.

### Later developer ecosystem

- APIs and developer integrations.
- GitHub synchronization.
- IDE integrations.
- CI/CD workflows.
- Controlled automated deployment.
- Additional bot types.
- Sandboxed testing and execution.
- Advanced multi-agent workflows.

These are possibilities, not commitments for Version 1. The central context → analysis → interview → confirmed knowledge → generation lifecycle should remain recognizable as the platform expands.

---

## 19. Risks and Scope Control

| Risk | Mitigation |
|---|---|
| Scope creep | Keep the initial release limited to the defined MVP. |
| Incorrect AI assumptions | Separate confirmed facts from inferences and require user review. |
| Context changes invalidate prior answers | Track context versions and reassess dependent results. |
| Lost interview progress | Persist progress and support resumption where implemented. |
| AI provider failure | Track status and provide safe, clear retry behavior. |
| Unsafe uploaded files | Validate uploads and process them safely. |
| Unauthorized project access | Enforce backend ownership checks. |
| Generated code contains defects | Label untested output clearly. |
| Local storage becomes difficult to migrate | Use a storage abstraction from the beginning. |
| Overcomplicated architecture | Prefer a modular application over premature distributed systems. |

Classify new ideas as:

- **Blocker:** Must be addressed to prevent major rework or make the MVP work.
- **Beta enhancement:** Useful but not essential; consider after core functionality.
- **Future vision:** Record for later without expanding the current milestone.

> Capture the idea; do not automatically expand the current sprint.

---

## 20. Open Decisions

The following details must be confirmed against the implementation:

- The exact AI provider and model for Version 1.
- The final bot output format and generator capabilities.
- Supported document formats and maximum upload sizes.
- Email delivery and verification-code configuration.
- Session or token authentication strategy.
- Database migration tooling and final schema.
- Retention and deletion behavior for files, reports, and generated artifacts.
- Recovery behavior for interrupted generation jobs.
- Test strategy and measurable performance targets.
- Whether generated output is configuration-only or includes a runnable integration package.
- The precise mapping between this README/PRD and the current repository implementation.

Do not document an open question as a completed capability until it has been implemented and tested.

---

## 21. Final Product Statement

MOMMA is not intended to be merely another interface that sends prompts to an AI model. It is a structured project-to-bot creation platform designed to understand a user's requirements, identify missing information, guide architectural decisions, maintain context, and generate a customized bot through a transparent and user-controlled workflow.

The defining principle is:

> **MOMMA should help users build the right solution, not simply produce a solution quickly.**

Version 1 will prove this principle through a focused, locally hosted MVP. The immediate priority is to connect the existing landing page and authentication experience to persistent project management, context analysis, the adaptive interview, Project Knowledge, and bot generation. Versioning should begin in a simple form and expand only when the core workflow works reliably.
