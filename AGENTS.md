# AGENTS.md

## Project

This project uses Spec-Driven Development with OpenSpec.

Before implementing any feature, read the relevant files under:

- `openspec/specs/`
- `openspec/changes/<change-name>/proposal.md`
- `openspec/changes/<change-name>/design.md`
- `openspec/changes/<change-name>/tasks.md`
- `openspec/changes/<change-name>/specs/`

## Architecture

Backend flow:

Route → Controller → Service → Repository → Prisma

Backend modules live in:

`apps/api/src/modules/<module-name>/`

Each backend module should follow:

```txt
<module>.routes.ts
<module>.controller.ts
<module>.service.ts
<module>.repository.ts
<module>.schemas.ts
<module>.types.ts
<module>.errors.ts
```

## Rules

Do not implement features without an OpenSpec change.
Do not modify archived changes.
Do not change unrelated modules.
Implement one task group at a time.
After changing behavior, add or update tests.
Never commit .env files.
Keep commits small and reviewable.
Prefer explicit errors with stable error codes.
If a task is ambiguous, list the ambiguity before implementing.
