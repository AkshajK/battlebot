import signal 
import copy
from RestrictedPython import compile_restricted
from RestrictedPython import safe_globals
bot1Works = True 
bot2Works = True
bot1code = -1
bot2code = -1
try:
    f = open("bot1.py", "r")
    bot1 = f.read()
    loc={}
    byte_code = compile_restricted(bot1, '<inline>', 'exec')
    exec(byte_code, safe_globals, loc)
    
    bot1code = loc['getSubmission']
except Exception as e:
    print("[!BOT1] Error Message: ", e)
    bot1Works = False
try: 
    f = open("bot2.py", "r")
    bot2 = f.read()
    loc={}
    byte_code = compile_restricted(bot2, '<inline>', 'exec')
    exec(byte_code, safe_globals, loc)
    
    bot2code = loc['getSubmission']
except Exception as e:
    print("[!BOT2] Error Message: ", e)
    bot2Works = False
from getWinner import getWinner
NUM_ROUNDS = 100
time_limit = 0.1
def runMatch():
  bot1score = 0.0
  bot2score = 0.0
  results1 = []
  results2 = []
  def handler(signum, frame):
      raise Exception("end of time")
  for rounds in range(NUM_ROUNDS):
      val1 = -1
      try:
          if(bot1Works):
              signal.signal(signal.SIGALRM, handler)
              signal.setitimer(signal.ITIMER_REAL, time_limit)
              val1 = bot1code(copy.deepcopy(results1), copy.deepcopy(results2), bot1score+0)
              signal.alarm(0)
      except:
          pass
          
      val2 = -1
      try:
          if(bot2Works):
              signal.signal(signal.SIGALRM, handler)
              signal.setitimer(signal.ITIMER_REAL, time_limit)
              val2 = bot2code(copy.deepcopy(results2), copy.deepcopy(results1), bot2score+0)
              signal.alarm(0)
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