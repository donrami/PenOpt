# Agent Rules

- **Never estimate completion times.** When creating software implementation plans (task breakdowns, timelines, milestones, or any form of planning), do NOT include estimated durations, time estimates, point estimates, or completion deadlines. Plans must describe what needs to be done and in what order, but without any time-based projections.

- **Put all planning artifacts in `_tooling/`.** Any analysis, specification, design doc, plan, task list, audit, research memo, or other project documentation MUST be created inside the `_tooling/` directory (or a subdirectory of it). Do not write these files in the project root.

- **Make atomic commits.** Each commit should contain exactly one logical change. Stage only the files relevant to that change. If work on different concerns happened to be done in the same session, separate them into multiple commits. Squash WIP commits before merging. When unsure, prefer smaller commits over larger ones.
