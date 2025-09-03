# Notes

## My First Prompt to Create the Templates

I'm trying to rethink my whole project by adding project documentation
that can guide me and the agents. AI and agents, I mean. In our work on the project. We start with three template documents that are in the templates folder.
Here are the links: @/templates/PRD-template.mdc @/templates/ARD-Template.mdc @/templates/Task-Template.mdc. We will be working on these templates. As background information, I give you two other files. Here they are: @/PRD.mdc @/EXTRA.md . Your task is to look through all these files, take the templates as bases,
keeping in mind that these templates are partially copied from another project which was based on Next.js and Python and it was backend and frontend whereas my project is only frontend with React, React Router 7, `TypeScript`, Vite, and Zustand. So some things in the templates that you see now do not fit my project, so I need you to go through them to change anything that relates to the Python Next.js project and make it fit this project.

If necessary, you can go through the codebase; if necessary, you can ask me questions. But I need to have these templates in order to create the real documents. But that will be the next step. For now, I need only the templates that are general enough. And keep also in mind t hat I'm going to add authentication via Google authentication in Firestore. In the real documents, I will go into more details. Look at the referenced old PRD that I had for this projecеt. It has a lot of information there. You can get through it a better insight in what kind of template questions we will be answering later. You don't have to use that text,
only its ideas for now. Eliminate all references to Python, Next.js and mono-repo as I have no back-end and do not use those tools.

## Create PRD

Ask me question until you have enought information to fill in @PRD.mdc based on background information from the old @PRD.mdc and @EXTRA.md, also you can read documentation in the docs folder. Feel free to analyse the existing codebase to learn what has already been done and use that, e.g., for the list of Implemented Features. No matter what you find in the background information, stick to the PRD structure unless you come up with ideas to change it.

## Extra formatting

Scan the ENTIRE document systematically from top to bottom. Find every instance where a markdown heading (any line starting with #, ##, ###, ####, etc.) OR plain text is immediately followed by a bullet list (lines starting with - or a number) without an empty line in between. Add exactly one empty line between them. After making changes, verify you found ALL instances by doing a final systematic check.
