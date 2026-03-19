import os
SECRET = "alexi_secret"
MONGO_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017/")
DB_NAME = "AlexiDB"