import os
import bson
from pymongo import MongoClient
from dotenv import load_dotenv

def main():
    load_dotenv()
    
    # User needs to make sure MONGODB_URI is set correctly
    mongo_uri = os.environ.get("MONGODB_URI")
    
    if not mongo_uri or "localhost" in mongo_uri:
        print("❌ Please set your MONGODB_URI in your .env file to your Atlas connection string!")
        print("Example: MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/")
        return

    print(f"🔄 Connecting to MongoDB Atlas...")
    client = MongoClient(mongo_uri)
    db = client["AlexiDB"]

    dump_dir = "AlexiDB"
    if not os.path.exists(dump_dir):
        print(f"❌ Error: Folder '{dump_dir}' not found. Please run this script from your project root.")
        return

    print(f"📂 Found AlexiDB dump folder. Starting import...")

    # Process each .bson file in the dump directory
    for filename in os.listdir(dump_dir):
        if filename.endswith(".bson"):
            collection_name = filename[:-5] # remove .bson
            file_path = os.path.join(dump_dir, filename)
            
            print(f"\n📦 Importing '{collection_name}'...")
            
            try:
                with open(file_path, "rb") as f:
                    data = bson.decode_all(f.read())
                    
                    if not data:
                        print(f"   -> No documents in {filename}, skipping.")
                        continue
                    
                    collection = db[collection_name]
                    
                    # Prevent duplicating documents if run multiple times
                    if collection.count_documents({}) > 0:
                        print(f"   -> Collection '{collection_name}' already has data. Skipping to avoid duplicates.")
                    else:
                        collection.insert_many(data)
                        print(f"   -> ✅ Successfully inserted {len(data)} documents.")
                        
            except Exception as e:
                print(f"   -> ❌ Error processing {filename}: {e}")

    print("\n🎉 Import process finished!")

if __name__ == "__main__":
    main()
