# SecureVault Explorer
**SecureVault Explorer** is a modern dark-mode file explorer built for SecureVault Inc., an enterprise cloud security company serving law firms and banks. The project focuses on improving the experience of browsing deeply nested folders and inspecting files within large enterprise storage systems.
The goal was to replace a difficult flat file list with a cleaner, more scalable, and more accessible interface that feels fast, organized, and secure.
This project was built entirely with plain HTML, CSS, and JavaScript without using component libraries or frameworks. Every component and interaction was implemented from scratch to keep the solution lightweight, readable, and easy to maintain.

# PROJECT GOAL
SecureVault already provides a strong backend capable of returning nested folder structures efficiently. However, navigating deeply nested files on the frontend was difficult for users.
This project solves that problem by introducing:
* i. A recursive file explorer
* ii. A modern enterprise-focused UI
* iii. Keyboard accessibility
* iv. Real-time search and filtering
* v. A detailed file inspection panel
* vi. Quick access through starred files
The focus was not only functionality, but also easy usability, accessibility, and scalability.

## Deliverables
* index.html for main application entry
* src/main.js for application logic
* src/style.css for styling and layout
* data.json provided data source
* https://www.figma.com/design/xUD1WV8IP4eazTOnTYt0zO/SecureVault-Dashboard?t=3P5mk8jL8e45zmbZ-0 — Design system reference

## Design Direction
I ensured that the interface follows a dark-mode visual style based on the client requirement that the product should feel cyber-secure, precise, and fast.
Some of the major design decisions I took include:
* i. Layered dark backgrounds to create a secure enterprise look
* ii. Cyan accent colors for active and focused states
* iii. Clear visual distinction between selected, focused, hovered, and starred items
* iv. A split-panel layout that separates navigation from file inspection
* v. Simple file and folder icons to improve scanning speed

## Design System
I included the design file which documents the visual foundation used throughout the project, including; Typography scale, Color palette, and Spacing system

# Features Implemented
## 1. Recursive Tree Explorer
The explorer renders the folder structure dynamically from the data.json file provided.
Features include:
* i. Support for deeply nested folders and files
* ii. Unlimited recursion depth
* iii. Expand and collapse interactions.

## 2. File Selection and Properties Panel
Clicking a file selects it and displays its details inside the properties panel.
The panel displays, File name, File type, File size, and Full file path

## 3. Keyboard Accessibility
I made sure that the explorer supports full keyboard interaction for accessibility and power users.
I used the following supported controls; ArrowUp, ArrowDown, ArrowRight, ArrowLeft, and Enter.
I have set the arrow up key for moving to previous visible item, the arrow right key for expanding folders, the left arrow key for collapsing folders and for focusing on parent folder.
The enter key is also for selecting files and opening folders.

## 4. Search and Filter
The search bar filters visible items in real time. This reduces the effort needed to locate files inside deeply nested structures.
Search functionality includes:
* i. Searching files and folders by name
* ii. Keeping matching nested items visible
* iii. Automatically expanding parent folders when matches are found

## 5. Wildcard Feature, Starred Files
The additional feature I implemented for the assignment is a starred files system.
I added it so that users can perform the following functions:
* i. Star important files
* ii. Remove files from starred items
* iii. Reopen starred files quickly from the Quick Access section

## Why I Added the star feature
I added the star feature because Legal and banking teams often revisit the same documents repeatedly during audits, reviews, and client work.
Navigating through deep folder structures every time can slow down workflows, so the starred files feature provides a lightweight shortcut system without requiring backend changes.

## Business Value
* i. Faster access to important files
* ii. Reduced navigation friction
* iii. Better support for repetitive workflows

### Technical Note
Starred files are stored using localStorage, allowing them to persist after refresh.

## Technical Approach
The project was intentionally kept simple, readable, and beginner friendly.
* i. I used plain JavaScript for rendering and interactions
* ii. Recursive rendering for nested structures
* iii. Set for expanded folders and starred file tracking
* iv. Map for fast node and parent lookups
* v. Event listeners for click and keyboard interactions

### Project Structure
SecureVault Dashboard/
* ── data.json
* ── index.html
* ── README.md
* ── src/
*     ── main.js
*     ── style.css

### How to Run
Run the project using a local development server, examples: VS Code Live Server
