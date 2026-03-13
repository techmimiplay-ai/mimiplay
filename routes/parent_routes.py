from flask import Blueprint, jsonify
from bson import ObjectId
from extensions import students, users

# @admin_bp.route('/api/parent/my-children/<parent_id>', methods=['GET'])
# def get_parent_children(parent_id):
#     try:
#         # 1. Parent ko dhoondo
#         parent = users.find_one({"_id": ObjectId(parent_id), "role": "parent"})
#         if not parent:
#             return jsonify({"msg": "Parent not found"}), 404

#         # 2. Parent ke pass jo bachhon ki IDs hain unka data nikalo
#         child_ids = parent.get("children_ids", [])
#         # Convert string IDs to ObjectIds if stored as strings
#         query_ids = [ObjectId(cid) for cid in child_ids]
        
#         my_students = list(students.find({"_id": {"$in": query_ids}}))

#         formatted = []
#         for s in my_students:
#             formatted.append({
#                 "id": str(s["_id"]),
#                 "name": s.get("name"),
#                 "class": s.get("class"),
#                 "roll_number": s.get("roll_number")
#             })

#         return jsonify(formatted)
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

parent_bp = Blueprint('parent_bp', __name__)

@parent_bp.route('/api/parent/my-children/<parent_id>', methods=['GET'])
def get_parent_children(parent_id):
    try:
        from bson import ObjectId
        # Seedha students collection mein dhundo jinka parent_id ye hai
        # Kyuki aapke screenshot mein student document mein parent_id field hai
        my_students = list(students.find({"parent_id": ObjectId(parent_id)}))

        formatted = []
        for s in my_students:
            formatted.append({
                "id": str(s["_id"]),
                "name": s.get("name", "Unknown"),
                "class": s.get("class", "N/A"),
                "roll_number": s.get("roll_number", "N/A"),
                # Initial nikalne ke liye avatar logic frontend handle kar lega
            })

        print(f"Found {len(formatted)} children for parent {parent_id}")
        return jsonify(formatted), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500