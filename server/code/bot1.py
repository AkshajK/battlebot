import random 
# my_past_submissions: Array of all of my submissions in past rounds
# their_past_submissions: Array of all of their submissions in past rounds
# my_score: My cumulative score in past rounds
# e.g., on round 3, my_past_submissions might be 
# [[5, 10, 5, 10, 5, 10, 5, 10, 5, 35], [100, 0, 0, 0, 0, 0, 0, 0, 0, 0]] 
# and if I won the first two rounds, my_score would be 2.0
def getWinnerValid(result1, result2):
    counter = 0
    for i in range(10):
        if(result1[i] > result2[i]):
            counter += 1
        elif (result1[i] < result2[i]):
            counter -= 1
    if counter > 0:
        return "win"
    elif counter < 0:
        return "lose"
    return "draw"
    
def equals(a, b):
    for i in range(len(a)):
        if a[i] != b[i]:
            return False
    return True
    
def getSubmission(my_past_submissions, their_past_submissions, my_score):
    if(len(my_past_submissions) < 30):
        if(len(my_past_submissions) < 2):
            return [16, 16, 16, 16, 16, 20, 0, 0, 0, 0]
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
    arrays = my_past_submissions[0:30]
    weighting = [1]*30
    for j in range(len(their_past_submissions)):
        if(getWinnerValid(my_past_submissions[j], their_past_submissions[j]) == "win"):
            for i in range(len(arrays)):
                if(equals(arrays[i], my_past_submissions[j])):
                    weighting[i] += 0.25
                    break
    return random.choices(arrays, weights=weighting)[0]