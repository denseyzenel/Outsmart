---
name: OUTSMART Expo previews
description: Compatibility rules for keeping OUTSMART Mobile usable in Expo Go and Replit web preview.
---

RevenueCat's native purchases module must only initialize in native development or installed builds. Expo Go and web preview need a non-purchasing fallback so the rest of the app remains viewable.

**Why:** Expo Go does not contain RevenueCat's custom native module, and Metro can continue serving an older bundle after configuration changes unless its cache is cleared.

**How to apply:** Gate native purchase loading by runtime environment. When previewed changes appear stale, restart Expo with a cleared Metro cache and verify the visible build marker before debugging app logic.