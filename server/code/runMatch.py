bot1Works = True 
bot2Works = True
try:
    from bot1 import getSubmission as bot1code
except:
    bot1Works = False
try: 
    from bot2 import getSubmission as bot2code
except:
    bot2Works = False
from getWinner import getWinner
NUM_ROUNDS = 10
def runMatch():
  bot1score = 0
  bot2score = 0
  results1 = []
  results2 = []
  for rounds in range(NUM_ROUNDS):
      val1 = -1
      try:
          if(bot1Works):
              val1 = bot1code(results1, results2)
      except:
          pass
      val2 = -1
      try:
          if(bot2Works):
              val2 = bot2code(results2, results1)
      except:
          pass
      result = getWinner(val1, val2)
      
      
      if(result == "win"):
          bot1score += 1
      elif(result == "lose"):
          bot2score += 1 
      else:
          bot1score += 0.5 
          bot2score += 0.5
   
      textResult = "Draw" 
      if(result == "win"):
        textResult = "[!BOT1] wins"
      elif(result == "lose"):
        textResult = "[!BOT2] wins"
      print("Round " + str(rounds + 1) + ":")
      print("[!BOT1] plays " + str(val1))
      print("[!BOT2] plays " + str(val2))
      print(textResult + ". Score: [!BOT1] (" + str(bot1score) + ") - [!BOT2] (" + str(bot2score) + ")")
      results1.append(val1)
      results2.append(val2)
  print("Final Result ([!BOT1] vs [!BOT2])")
  print(str(bot1score) + " - " + str(bot2score))
if __name__ == '__main__':
  runMatch()