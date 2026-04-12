from flask_bcrypt import Bcrypt
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.environ.get(
    "MONGODB_URI",
    "mongodb://localhost:27017/"
)

client                = MongoClient(MONGO_URI)
db                    = client["AlexiDB"]
users                 = db["users"]
attendance_collection = db["attendance"]
students              = db["students"]
mimi_chats = db["mimi_chats"]

bcrypt = Bcrypt()