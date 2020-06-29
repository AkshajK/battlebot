# my_past_submissions: Array of all of my submissions in past rounds
# their_past_submissions: Array of all of their submissions in past rounds
# e.g., on round 3, my_past_submissions might be 
# [[5, 10, 5, 10, 5, 10, 5, 10, 5, 35], [100, 0, 0, 0, 0, 0, 0, 0, 0, 0]] 
def getSubmission(my_past_submissions, their_past_submissions):
    # Submit one array every odd round, and another every even round
    if len(my_past_submissions) % 2 == 0:
        return [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
    else:
        return [0, 0, 0, 0, 16, 16, 16, 16, 16, 20]