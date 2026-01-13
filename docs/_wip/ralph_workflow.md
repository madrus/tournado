# Ralph Workflow

## Preparation

1. make sure you have `ampcode` installed; if not, follow instruction on its [website](https://ampcode.com)
2. install the amp skills:

   ```sh
   amp skill add ampcode/amp-contrib
   amp skill list
   # if you need to remove a skill or all skills
   amp skill remove <name>
   amp skill remove ampcode/amp-contrib
   ```

## Usage

1. open this file and keep it in view whenever you need Ralph context so the steps stay top of mind
2. create the PRD mockdown
   - start amp cli and type `Load the prd skill and create a PRD for [description]`
   - answer clarifying questions until the skill saves `tasks/prd-<feature>.md`
3. convert the PRD to Ralph JSON
   - from the project root run `scripts/ralph/ralph.sh convert tasks/prd-<feature>.md`
   - the `ralph` skill (`.codex/skills/ralph/SKILL.md`) writes `prd.json` directly next to `scripts/ralph/ralph.sh`; this `scripts/ralph/` folder is your project's Ralph directory and is where the agent loop expects to find the converted file
   - confirm `scripts/ralph/prd.json` (or `scripts/ralph/<feature>.json` if you rename it) exists before moving on
4. prep the dev browser for secure routes
   - start the dev-browser skill per `.codex/skills/fullstack-dev-workflow/SKILL.md`
   - log into the app inside that browser so cookies/session persist for the Ralph loop
   - keep it running as an extension (do not close) so Ralph can verify secure UI flows
5. point everything at port 5173
   - run your React Router dev server on `http://localhost:5173`
   - teach Ralph/dev-browser that address when it still defaults to 3000
6. run Ralph
   - from the project root run `scripts/ralph/ralph.sh [max_iterations: optional]`
   - watch for `<promise>COMPLETE</promise>` in logs or interrupt if you spot build/test failures
7. post-iteration chores
   - open generated git diff, inspect touched React/Tailwind files, and run `git status`
   - copy learnings into `AGENTS.md` for the feature so Amp retains the context
   - keep `progress.txt` and `prd.json` accurate before starting the next Ralph run

No extra tips. Follow the numbered steps exactly, use the skills described, and let Ralph handle the rest.
