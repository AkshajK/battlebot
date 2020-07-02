# my_past_submissions: Array of all of my submissions in past rounds
# their_past_submissions: Array of all of their submissions in past rounds
# my_score: My cumulative score in past rounds
# e.g., on round 3, my_past_submissions might be 
# [[5, 10, 5, 10, 5, 10, 5, 10, 5, 35], [100, 0, 0, 0, 0, 0, 0, 0, 0, 0]] 
# and if I won the first two rounds, my_score would be 2.0
from random import randint
def getSubmission(my_past_submissions, their_past_submissions, my_score):
    # Randomize the 6 main castles
    attacks = set()
    while (len(attacks) < 6):
        i = randint(1, 10)
        attacks.add(i)
    arr = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    for a in attacks:
        arr[a - 1] = 16
    return arr