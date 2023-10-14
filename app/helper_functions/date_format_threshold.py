import arrow

def format_review_date(dt):

    review_date = arrow.get(dt)

    days_difference = (arrow.utcnow() - review_date).days

    if days_difference <= 7:
        return review_date.humanize()

    else:
        return review_date.format("MMM D, YYYY")

now = arrow.utcnow()
three_days_ago = now.shift(days=-3).datetime
thirty_days_ago = now.shift(days=-30).datetime

print(format_review_date(three_days_ago))
print(format_review_date(thirty_days_ago))
