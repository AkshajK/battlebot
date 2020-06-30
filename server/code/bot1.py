# my_past_submissions: Array of all of my submissions in past rounds
# their_past_submissions: Array of all of their submissions in past rounds
# e.g., on round 3, my_past_submissions might be 
# [[5, 10, 5, 10, 5, 10, 5, 10, 5, 35], [100, 0, 0, 0, 0, 0, 0, 0, 0, 0]] 
def getSubmission(my_past_submissions, their_past_submissions):
    # Submit their last submission:
    if len(my_past_submissions) == 0:
        return [16, 16, 16, 16, 16, 20, 0, 0, 0, 0]
    our_ans = their_past_submissions[-1]
    count = 0
    for i in range(9):
        if(our_ans[i] < 100):
            our_ans[i] += 1
            count += 1
    for i in range(10):
        if our_ans[9-i] >= count:
            our_ans[9-i] -= count
            break
    return our_ans