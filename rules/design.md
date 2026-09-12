# [PROJECT NAME] - Development Prompt

## Project

- **Name:** SweeperMine
- **Type:** game
- **Description:** Think clearly. Clear everything.

## Core instruction

Act as a senior software engineer and an expert product designer with impeccable UI/UX skills. Build this as a polished, production-quality product. Make deliberate technical and design decisions, use modern best practices, keep the implementation modular and maintainable, and verify the result before declaring completion.

## Project quality

- **Production-quality implementation:** Build a real production-ready product, not a throwaway prototype.
- **Best coding practices:** Use modern, idiomatic, maintainable practices appropriate to the chosen stack.
- **Modular architecture:** Keep functionality modular, cohesive, and easy to extend.
- **Reusable components:** Prefer reusable components, utilities, and patterns over duplication.
- **Polished implementation:** Refine details, edge cases, states, interactions, and visual consistency.

## Design system

- **iOS Human Interface Guidelines inspired:** Use principles of clarity, hierarchy, depth, consistency, touch-friendly controls, and purposeful motion while retaining an original identity.
- **Professional design system:** Establish consistent design tokens for spacing, typography, color, elevation, radii, and components.
- **No inline hardcoded CSS:** Do not scatter inline hardcoded styling. Centralize reusable styling and design tokens.
- **Impeccable project aesthetic:** Create a distinctive, coherent, premium visual identity rather than a generic AI-looking interface.
- **Impeccable UI/UX professional skills:** Apply expert product-design judgment, hierarchy, composition, usability, interaction design, and refinement throughout.

## Interaction

- **Haptic feedback:** Use appropriate haptic feedback where supported without making it distracting.
- **Touch interactions:** Design comfortable touch targets and mobile-first interactions.
- **Sound feedback:** Use subtle, purposeful sound only where it improves the experience, with user control.
- **Microinteractions:** Use meaningful microinteractions for feedback, state changes, navigation, and confirmation.
- **Purposeful motion:** Use smooth, restrained animations and transitions that communicate hierarchy and state.

## Responsiveness & accessibility

- **Full responsiveness:** Support mobile, tablet, laptop, and large desktop layouts intentionally.
- **Accessibility:** Follow accessibility best practices with semantic HTML, keyboard support, focus states, contrast, labels, and appropriate ARIA.
- **Reduced motion:** Respect prefers-reduced-motion and never rely on motion for essential information.
- **Font-size considerations:** Use readable, scalable typography and avoid fragile fixed-size text.
- **Language readiness:** Structure user-facing text so language changes and localization can be supported cleanly.

## Themes

- **Multiple themes:** Support multiple cohesive visual themes through centralized design tokens.
- **Custom theme support:** Allow theme values to be customized without rewriting components.
- **Theme switching:** Provide a polished theme switching experience where appropriate.
- **System theme preference:** Respect operating-system light/dark preference where appropriate.

## Pages & states

- **Aesthetic 404 page:** Create a custom 404 page matching the project identity with useful navigation.
- **Custom error pages:** Design polished application/server error pages appropriate to the project.
- **Loading states:** Provide intentional loading, skeleton, or progress states.
- **Empty states:** Design helpful empty states rather than blank or confusing screens.
- **Offline/network states:** Handle offline and network failures gracefully where relevant.

## Performance

- **Core Web Vitals targets:** Optimize for LCP under 2.5s, FID under 100ms, and CLS under 0.1. Measure and monitor these metrics.
- **Image optimization:** Use modern formats (WebP, AVIF), responsive srcset, lazy loading, and proper sizing. Avoid serving oversized images.
- **Code splitting and lazy loading:** Split code at route boundaries and lazy-load non-critical modules, components, and assets.
- **Caching strategies:** Implement appropriate caching headers, service worker caching, and client-side caching to minimize redundant network requests.
- **Bundle size awareness:** Keep bundle size minimal. Audit dependencies, tree-shake unused code, and set size budgets.
- **Font optimization:** Use font-display: swap, subset fonts to needed character ranges, preload critical fonts, and limit the number of font families and weights.

## PWA

- **Progressive Web App:** Implement a production-quality PWA where appropriate.
- **Web App Manifest:** Configure appropriate name, icons, display mode, theme colors, and metadata.
- **Service worker:** Implement an appropriate service worker and caching strategy.
- **Offline support:** Provide meaningful offline behavior where requirements allow it.
- **Installability:** Meet installability requirements and provide a polished install experience.

## SEO / AEO / GEO

- **SEO:** Implement strong technical SEO, semantic HTML, metadata, canonical URLs, crawlability, and search-friendly content.
- **AEO:** Optimize relevant content for answer engines with clear answers, question structures, FAQs where appropriate, and machine-readable information.
- **GEO:** Optimize relevant content for generative search with clear entities, relationships, factual structure, and machine-readable information.
- **Rich search results:** Implement appropriate structured data and validate eligible rich-result markup.
- **Social sharing metadata:** Implement Open Graph and relevant social preview metadata.
- **Sitemap and robots:** Configure sitemap and robots directives appropriately.

## GitHub & documentation

- **Professional README:** Create a polished, accurate README covering project, setup, usage, features, stack, and relevant information.
- **Detailed documentation:** Create detailed Markdown documentation and additional .md files wherever useful.
- **Proper .gitignore:** Ignore dependencies, build output, secrets, logs, temporary files, raw prompts/ideas, and unnecessary generated artifacts.
- **Professional GitHub files:** Add relevant CONTRIBUTING.md, SECURITY.md, CODE_OF_CONDUCT.md, CHANGELOG.md, or templates where appropriate.
- **Documentation matches implementation:** Ensure documentation reflects actual behavior and never describes nonexistent functionality.

## Keyboard shortcuts

- **Application keyboard shortcuts:** Define keyboard shortcuts for the most common actions. Use standard modifier keys (Ctrl/Cmd) and avoid conflicts with browser defaults.
- **Command palette:** Implement a command palette (Ctrl/Cmd+K or Ctrl/Cmd+Shift+P) that provides quick access to all major features and navigation.
- **Customizable keybindings:** Allow users to view and optionally customize keyboard shortcut assignments.
- **Shortcut documentation:** Include a shortcut reference (help modal or settings panel) listing all available shortcuts.

## Visual documentation

- **Project screenshots:** After completion, capture polished screenshots of the finished UI and include appropriate screenshots in the README.
- **Major page screenshots:** Screenshot important pages/routes and include representative images in the README.
- **Important modal screenshots:** Screenshot important modals/dialogs or distinctive UI states that help explain the product.
- **Responsive screenshots:** Capture representative mobile and desktop states when useful.

## License & ownership

- **MIT License:** Use a standard MIT LICENSE file.
- **Custom proprietary license:** Everything is licensed exclusively to me. No one may use, copy, modify, distribute, or otherwise use this project without my explicit permission.

## Developer attribution

- **Use developer profile:** Read relevant information from C:\Users\arunn\Desktop\ARUN-PROFILE.md and use only appropriate information.
- **Developer watermark:** Add tasteful developer attribution where appropriate without damaging the UI or exposing unnecessary private information.

## Development workflow

- **Create rules/ folder with tracker.md:** Create a rules/ folder containing a tracker.md file that records tasks completed, decisions made, and the current progress of the project.
- **Create plan.md and follow it:** First create a plan.md (or equivalent) plan file, read it carefully before implementing, and follow it as the source of truth. Keep it in sync as work proceeds.
- **Ask when unsure, never assume:** Do not assume requirements. If anything is ambiguous, missing, or conflicting, stop and ask for clarification before proceeding.
- **Always choose the best approach:** When several valid approaches exist, choose the most performant, maintainable, and appropriate one. Briefly state the choice and why it beats the alternatives.
- **Performance and speed priority:** Prioritize performance and speed: fast load times, instant interactions, efficient data handling. Treat every added dependency and network request as a cost.
- **Animations and microinteractions:** Include purposeful animations and microinteractions throughout the UI. Do not ship a static, lifeless interface.
- **Swipe, double-click, and context interactions:** Add swipe gestures, double-click behaviors, context menus, and other natural interactions wherever they genuinely improve the experience.
- **Custom context menu:** Replace default browser context menus with a custom context menu that matches the project's design system.
- **Fun developer console message:** Add a styled, on-brand, and humorous message to the browser developer console. It should never be left empty or default.
- **On-brand 404 and error pages:** Build custom 404 and error pages that match the project aesthetics, use tasteful humor, and provide helpful navigation.
- **Keep tracker.md updated:** Update rules/tracker.md as each task is completed so it is always an accurate record of what has been done.
- **Commit every meaningful task:** Commit work at every meaningful milestone with clear, descriptive commit messages. Do not batch unrelated changes into single commits.

## Global instructions

- **No emojis:** Do not use emojis in the UI, documentation, generated copy, or interface labels unless explicitly required.
- **No em dashes:** Do not use em dashes. Use appropriate punctuation instead.
- **Proper icons:** Use an appropriate icon library or designed icons instead of emoji or arbitrary Unicode symbols for UI icons.
- **Verify before completion:** Run appropriate validation, inspect the result, fix discovered issues, and do not claim completion without verification.
- **No fake functionality:** Do not leave fake buttons, placeholder functionality, misleading interactions, or claims of features that are not implemented.

## Quality bar

- Use impeccable UI/UX and professional product-design judgment.
- Prioritize accessibility, responsiveness, maintainability, consistency, and polish.
- Do not use emojis or em dashes.
- Use proper icons rather than arbitrary Unicode symbols for interface icons.
- Do not use inline hardcoded CSS.
- Prefer modular, reusable components and centralized design tokens.
- Do not leave fake or unfinished functionality.
- Inspect the finished implementation and fix issues before considering the project complete.

## Output

- Work step by step, and keep this requirement list visible as the source of truth while implementing.
- Write the full implementation with real, working code. Do not truncate files or leave stubs.
- Organize the work logically (setup, structure, implementation, then verification).
- Summarize at the end what was built, what was tested, and anything the user must configure or run.

## Developer profile

Read the developer profile at C:\Users\arunn\Desktop\ARUN-PROFILE.md and use only relevant information for appropriate attribution, author metadata, documentation, or project context.
Include a tasteful developer watermark wherever appropriate (footer credit, browser console message, README and documentation author metadata) without damaging the UI, cluttering the interface, or exposing private information.

## License

> Everything is licensed exclusively to me. No one may use, copy, modify, distribute, or otherwise use this project without my explicit permission.

## License

Use the MIT License and include a proper LICENSE file.
