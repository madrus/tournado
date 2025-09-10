# Notes on TASK-0003 implementation

- The status of both TASK-0001 and TASK-0002 was "planned" but I got no warning and question what to do next
- the agent want to create already existing folder `app/hooks` without checking
- why was the new hook `useFirebaseAuth` created in `app/hooks` and not in `app/features/firebase/hooks`?
- legacy username/password signin should be replaced with firebase username/password signin for user without an existing Google account
- there is a misunderstanding about the location of the unit tests folder for components:
   - wrong ideas
      - app/features/firebase/components/FirebaseSignIn/**tests**/
      - app/features/firebase/**tests**/components/
   - right location
      - app/features/firebase/components/**tests**/ - for all Firebase components tests
- for JSX.Element JSX type should be imported from React
- callback was replaced with handler and linters were happy - that means that handler is not a banned word to use as an argument name
- after fixing unit tests there was no run of validate
