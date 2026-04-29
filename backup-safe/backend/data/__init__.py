# Data module — seed/fallback catalogs. NOT the source of truth.
# Source of truth is MongoDB. These exist only for:
# 1. First-run seeding (empty DB)
# 2. Fallback if DB read fails