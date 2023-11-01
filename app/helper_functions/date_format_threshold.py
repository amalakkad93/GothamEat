import arrow

def format_review_date(dt):
    """
    Formats a review date for display. If the review date is within the last 7 days,
    it returns a human-readable format like "3 days ago". Otherwise, it returns a formatted date.

    Parameters:
    - dt (datetime.datetime): The review date to be formatted.

    Returns:
    - str: A human-readable or formatted string representation of the date.
    """

    # Convert the given datetime into an arrow object (assuming it's in UTC)
    review_date_utc = arrow.get(dt)

    # Get current time in Pacific
    # current_pacific_time = arrow.now('US/Pacific')
    # current_utc_time = arrow.utcnow()
    current_pacific_time  = arrow.utcnow()


    # Calculate the difference
    delta = (current_pacific_time - review_date_utc)
    days = delta.days
    seconds = delta.seconds
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60

    # Convert the difference into a human-readable format
    if days == 0:
        if hours == 0:
            if minutes == 0:
                return "just now"
            else:
                return f"{minutes} minutes ago"
        else:
            return f"{hours} hours ago"
    else:
        # Use arrow's humanize function for days difference
        return review_date_utc.humanize(current_pacific_time)

# Test cases
now = arrow.utcnow()

# Calculate the date for three days ago from the current date
three_days_ago = now.shift(days=-3).datetime

# Calculate the date for thirty days ago from the current date
thirty_days_ago = now.shift(days=-30).datetime

# Print the formatted date for three days ago to showcase the "humanize" format
print(format_review_date(three_days_ago))

# Print the formatted date for thirty days ago to showcase the standard date format
print(format_review_date(thirty_days_ago))

# import arrow

# def format_review_date(dt):
#     """
#     Formats a review date for display. If the review date is within the last 7 days,
#     it returns a human-readable format like "3 days ago". Otherwise, it returns a formatted date.

#     Parameters:
#     - dt (datetime.datetime): The review date to be formatted.

#     Returns:
#     - str: A human-readable or formatted string representation of the date.

#     Example:
#     >>> format_review_date(datetime.datetime(2022, 1, 1))
#     "Jan 1, 2022"

#     Notes:
#     - The function uses the 'arrow' library to handle date formatting and calculation.
#     """

#     # Convert the given datetime into an arrow object in UTC
#     # review_date = arrow.get(dt).to('UTC')
#     # Convert the given datetime into an arrow object (assuming it's in UTC)
#     review_date_utc = arrow.get(dt)

#     # Get current time in Pacific
#     current_pacific_time = arrow.now('US/Pacific')

#     # Calculate the difference in seconds
#     diff_seconds = (current_pacific_time - review_date_utc).seconds

#     # Convert the difference into a human-readable format
#     if diff_seconds < 60:
#         return "just now"
#     elif diff_seconds < 3600:
#         return f"{diff_seconds // 60} minutes ago"
#     elif diff_seconds < 86400:
#         return f"{diff_seconds // 3600} hours ago"
#     else:
#         # More than a day ago, so we can rely on arrow's humanize function
#         return review_date_utc.humanize(current_pacific_time)

# # Test cases
# now = arrow.utcnow()

# # Calculate the date for three days ago from the current date
# three_days_ago = now.shift(days=-3).datetime

# # Calculate the date for thirty days ago from the current date
# thirty_days_ago = now.shift(days=-30).datetime

# # Print the formatted date for three days ago to showcase the "humanize" format
# print(format_review_date(three_days_ago))

# # Print the formatted date for thirty days ago to showcase the standard date format
# print(format_review_date(thirty_days_ago))
