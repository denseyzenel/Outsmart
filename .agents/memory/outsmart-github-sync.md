---
name: OUTSMART GitHub sync
description: The reliable authenticated path for synchronizing this Replit workspace to its GitHub repository.
---

GitHub connector authorization may provide repository API write access without installing credentials usable by shell Git over HTTPS or SSH. When normal pushes fail for missing credentials, use the authenticated Git Data API to create blobs, a tree, and a commit, then update the branch without force.

**Why:** Both GitHub App and standard GitHub connections were active, but shell pushes still failed authentication. The standard connector successfully uploaded and committed the complete tracked tree through GitHub’s API.

**How to apply:** Try a normal non-force push first. If credential authentication is unavailable, use the existing GitHub connector and preserve the current remote branch as the new commit’s parent.