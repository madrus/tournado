---
name: tags
description: Upsert tags in the specified document(s) based on provided arguments
inputs:
   - name: arguments
     type: string
     description: File name(s) or patterns to search and tag
     required: true
---

# Upsert Tags

You are given the following context:
$ARGUMENTS

You will get (part of the) the document file name in the arguments. Show the user the (list of) name(s) that fit the search as a list of checkmarks and ignore any ALL CAPS filenames. Ask the user to tell you for which files from the list the tags should be upserted and wait for confirmation. If there is only one file in the list, ask confirmation about just that one file not the list.

Once you get confirmation, go through the file(s) and add or update the tags at bottom according to the Tagging System Rules section in the CLAUDE.md as necessary. If there is text after the tags, move the resulting tags to the bottom of the document again.

Finally, echo the tags back to console.
