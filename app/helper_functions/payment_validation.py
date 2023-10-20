def is_valid_payment_data(data):
    """
    Validates the provided payment data against a set of predefined criteria.

    This function ensures that the payment gateway, amount, status, and order_id
    adhere to the expected formats and values, enhancing the security and integrity
    of payment processing.

    Parameters:
    - data (dict): A dictionary containing payment-related data. Expected keys are
      'gateway', 'amount', 'status', and 'order_id'.

    Returns:
    - tuple: A tuple containing a boolean indicating the validity of the data and an
      error message (if any).

    Example:
    >>> is_valid_payment_data({"gateway": "Stripe", "amount": "10.5", "status": "Completed", "order_id": "5"})
    (True, None)

    Notes:
    - This function can be extended to support additional payment gateways or validation criteria.
    """

    # Ensure the payment gateway is one of the accepted ones
    if data['gateway'] not in ["Stripe", "PayPal"]:
        return False, "Invalid payment gateway."

    # Convert and validate the payment amount
    try:
        amount = float(data['amount'])
        if amount <= 0:
            return False, "Invalid payment amount. Amount must be positive."
    except (ValueError, TypeError):
        return False, "Invalid payment amount."

    # Check if the payment status is one of the accepted statuses
    valid_statuses = ["Pending", "Completed", "Failed"]
    if data['status'] not in valid_statuses:
        return False, "Invalid payment status."

    # Convert and validate the order ID
    try:
        order_id = int(data['order_id'])
        if order_id <= 0:
            return False, "Invalid order ID."
    except (ValueError, TypeError):
        return False, "Order ID must be a positive integer."

    return True, None
