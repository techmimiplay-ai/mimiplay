import os
SECRET = os.environ.get("SECRET", "alexi_secret_key_32_characters_long_for_security")
MONGO_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017/")
DB_NAME = "AlexiDB"