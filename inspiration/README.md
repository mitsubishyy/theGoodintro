# Inspiration references

Visual references for the three-sided platform build (admin / vendor / exec portals).

## hr-partner/

13 screenshots of **HR Partner** (hrpartner.io), the HRIS whose data layout and
module structure we want to borrow for the portals. Recovered from the planning
chat on 2026-05-25 where the note was:

> "These are screenshots of HR Partner. A HRIS company but I think we can copy
> the layout of their data and modules."

What to take from it: the **left blue side-nav**, the **dashboard "helicopter"
widget grid** (shortcuts row + notifications/reminders columns + donut charts +
absence calendar), the **employee list/detail** pattern, and the **onboarding
checklist** screens. Do NOT copy HR Partner's pink/purple palette or cartoon
icons — theGoodintro stays emerald (see POSITIONING.md / DESIGN rules).

| file | screen |
|------|--------|
| 01-signup-page | marketing signup (pink hero) |
| 02-trial-welcome-dashboard | first-login welcome panel |
| 03..05-admin-dashboard-* | admin home: shortcuts, notifications, reminders, donut charts, absence calendar |
| 06..07-admin-employees-list* | employee directory table |
| 08..10-employee-* | self-service profile + employee detail with module list & activity feed |
| 11..13-employee-checklist* | onboarding checklist (uploads, sign-doc, progress) |

## Recovering more from past chats

Everything you've ever pasted into Claude Code lives in `~/.claude/projects/`.
Use the sweep tool to find or re-extract it:

```bash
python3 scripts/sweep-chats.py "hr partner"                 # find chats
python3 scripts/sweep-chats.py --chat 7660f704 --images ~/Desktop/out   # pull images
python3 scripts/sweep-chats.py --list                        # list all chats
```
