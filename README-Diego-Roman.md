# Student Name: Diego Roman

## 1. My Assigned Work
For iteration 2, I restyled the app to match Mörk Borg and wired up the interactive pieces the rules expect. That included:
* A grim visual restyle of style.css (black background, Mörk Borg yellow + hot pink palette, blackletter / display / typewriter font stack).
* A rules-accurate dice roller on Character Creation — 3d6 abilities, Toughness + d8 HP, 2d6 × 10 silver, omens — plus Name / Origin / Trait rollers using the book's tables (p.2, p.38, p.39, p.40, p.46+).
* A full Mörk Borg character sheet modal on Character Page (skull HP, abilities, weapons, armor tiers, equipment, miseries) with editable text fields and clickable tier / miseries that save to localStorage.
* A Custom Rulesets panel on Customize.html with switches, a doom-die dropdown, and a house rules textarea.
* Library.html rebuilt into a rollable rules browser covering 17 Mörk Borg tables (Broken Bodies, Terrible Traits, Weapons, etc.).
* Characters save to localStorage on creation and render dynamically in the roster with a Delete button.

## 2. Bootstrap Implementation
Kept the existing Bootstrap layout and restyled underneath so the team's pages stayed working.
* **Components Used:**
* Form controls, selects, switches, and textareas (Character Creation, Customize, editable sheet)
* Input groups (every input is paired with its Roll button)
* Cards (character roster and library tiles)
* Badges (Ready / Draft / Saved status)
* Modals (character sheet on Character Page, table browser on Library)
* Grid system (row / col-md-* / col-xl-*) and utility classes

## 3. Technical Challenges & Solutions
The hardest part was adding a lot of new behavior without breaking the team's existing pages. I kept script.js and the inline scripts in separate scopes, left team members' HTML class names alone, and only changed visuals through CSS. For the editable character sheet I also had to distinguish user-saved characters (they have an id, fields are contenteditable + save on blur) from the hardcoded samples (read-only with a note) so sample edits don't silently vanish.

## 4. AI / LLM Usage
* **What I asked the AI:**
I asked LLMs a lot of general question especially when scripting and making dice and tables and save systems as I wanted the character creator to work and function nicely while also looking nice for the user.
* **How it helped & What I learned:**
It seriously simplified complex subjects for me as I came in a little out of my element at first.

## 5. Live Site Link
*Provide the GitHub Pages link to the specific page(s) you built.*

* **Live URL:**
Character Creation Page: [https://vcu-257.github.io/iteration-2-build-with-style-group-13/CharacterCreation.html]
Character Page: [https://vcu-257.github.io/iteration-2-build-with-style-group-13/CharacterPage.html]
Customize Page: [https://vcu-257.github.io/iteration-2-build-with-style-group-13/Customize.html]
Library: [https://vcu-257.github.io/iteration-2-build-with-style-group-13/Library.html]
