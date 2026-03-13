from flask_bcrypt import Bcrypt
from pymongo import MongoClient
from config import MONGO_URI, DB_NAME

bcrypt = Bcrypt()

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

users = db["users"]
attendance_collection = db["attendance"]
students = db["students"]