import os
import sys

_SECRET_ENV = os.environ.get("SECRET", "").strip()

# In production, a missing SECRET means all JWTs are forgeable — hard fail at startup.
# Set SECRET env var on your server. For local dev, a fallback is allowed.
if not _SECRET_ENV:
    _is_production = os.environ.get("FLASK_ENV") == "production" or os.environ.get("RENDER") or os.environ.get("HEROKU_APP_NAME")
    if _is_production:
        print("[FATAL] SECRET environment variable is not set. Refusing to start in production.", file=sys.stderr)
        sys.exit(1)
    else:
        _SECRET_ENV = "alexi_dev_secret_key_not_for_production"

SECRET = _SECRET_ENV
MONGO_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017/")
DB_NAME = "AlexiDB"