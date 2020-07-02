import random
# my_past_submissions: Array of all of my submissions in past rounds
# their_past_submissions: Array of all of their submissions in past rounds
# my_score: My cumulative score in past rounds
# e.g., on round 3, my_past_submissions might be 
# [[5, 10, 5, 10, 5, 10, 5, 10, 5, 35], [100, 0, 0, 0, 0, 0, 0, 0, 0, 0]] 
# and if I won the first two rounds, my_score would be 2.0
def getSubmission(my_past_submissions, their_past_submissions, my_score):
    # Submit one array every odd round, and another every even round
    num_rounds = len(their_past_submissions)
    if len(my_past_submissions)==0:
        return [2, 4, 2, 18, 2, 16, 16, 16, 12, 12]
    if random.random()<0.5 and num_rounds>1:
        submission_to_beat = their_past_submissions[num_rounds-2]
    else:
        submission_to_beat = my_past_submissions[num_rounds-1]
    output = []
    for i in submission_to_beat:
        output.append(i+2)
    counter = 0 
    for j in range(len(output)):
        if output[j]>20:
            output[j]-=20
            return output
    for j in range(len(output)):
        if output[j]>10:
            output[j]-=10
            counter+=1
            if counter==2:
                return output
    return [2, 4, 2, 18, 2, 16, 16, 16, 12, 12]       