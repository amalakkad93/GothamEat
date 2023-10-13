def normalize_data(data_list, key_field):
    normalized_data = {
        "byId": {},
        "allIds": []
    }

    for item in data_list:
        item_id = item[key_field]
        normalized_data["byId"][item_id] = item
        normalized_data["allIds"].append(item_id)

    return normalized_data
