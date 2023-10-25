# Helper function for data normalization
def normalize_data(data_list, key_field):
    by_id = {item[key_field]: item for item in data_list if key_field in item}
    all_ids = list(by_id.keys())
    return {"byId": by_id, "allIds": all_ids}


# def normalize_data(data_list, key_field):
#     normalized_data = {
#         "byId": {},
#         "allIds": []
#     }

#     for item in data_list:
#         item_id = item[key_field]
#         normalized_data["byId"][item_id] = item
#         normalized_data["allIds"].append(item_id)

#     return normalized_data
