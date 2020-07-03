import random
# my_past_submissions: Array of all of my submissions in past rounds
# their_past_submissions: Array of all of their submissions in past rounds
# my_score: My cumulative score in past rounds
# e.g., on round 3, my_past_submissions might be 
# [[5, 10, 5, 10, 5, 10, 5, 10, 5, 35], [100, 0, 0, 0, 0, 0, 0, 0, 0, 0]] 
# and if I won the first two rounds, my_score would be 2.0
def getSubmission(my_past_submissions, their_past_submissions, my_score):
    # Submit their last submission:
    if (random.random() < 0.25) or (len(my_past_submissions) <= 1):
        if(random.random() < 0.5):
            return [0, 0, 0, 0, 20, 16, 16, 16, 16, 16]
        return [16, 16, 16, 16, 16, 20, 0, 0, 0, 0]
    else:
        our_ans = -1
        if(random.random() < 0.5):
            our_ans = their_past_submissions[-2]
        else:
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