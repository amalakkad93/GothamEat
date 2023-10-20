import arrow

def format_review_date(dt):
    """
    Formats a review date for display. If the review date is within the last 7 days,
    it returns a human-readable format like "3 days ago". Otherwise, it returns a formatted date.

    Parameters:
    - dt (datetime.datetime): The review date to be formatted.

    Returns:
    - str: A human-readable or formatted string representation of the date.

    Example:
    >>> format_review_date(datetime.datetime(2022, 1, 1))
    "Jan 1, 2022"

    Notes:
    - The function uses the 'arrow' library to handle date formatting and calculation.
    """

    # Convert the given datetime into an arrow object for better manipulation
    review_date = arrow.get(dt)

    # Calculate the difference in days between the current date and the review date
    days_difference = (arrow.utcnow() - review_date).days

    # If the review was written in the last 7 days, use a human-readable format
    if days_difference <= 7:
        return review_date.humanize()
    # If it's older than 7 days, return a formatted date string
    else:
        return review_date.format("MMM D, YYYY")

# Get the current date and time using arrow
now = arrow.utcnow()

# Calculate the date for three days ago from the current date
three_days_ago = now.shift(days=-3).datetime

# Calculate the date for thirty days ago from the current date
thirty_days_ago = now.shift(days=-30).datetime

# Print the formatted date for three days ago to showcase the "humanize" format
print(format_review_date(three_days_ago))

# Print the formatted date for thirty days ago to showcase the standard date format
print(format_review_date(thirty_days_ago))
