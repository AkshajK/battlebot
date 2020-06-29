def getWinner(result1, result2):
    works1 = valid(result1)
    works2 = valid(result2)
    if((not works1) and (not works2)):
        return "draw"
    elif(not works1):
        return "lose"
    elif(not works2):
        return "win"
    return getWinnerValid(result1, result2)

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

def valid(result):
    if(not(type(result) == type([]))):
        return False

    if(len(result) != 10):
        return False 
    
    for value in result:
        if not type(value) == type(1):
            return False 
        if(value < 0): 
            return False
        if(value > 100): 
            return False
    
    sum = 0
    for value in result:
        sum += value 
    if sum != 100:
        return False
    return True 
