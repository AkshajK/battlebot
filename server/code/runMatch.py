import signal 
import copy
import sys
""" 
from RestrictedPython import compile_restricted
from RestrictedPython.PrintCollector import PrintCollector
from RestrictedPython.Guards import safe_builtins
from RestrictedPython.Limits import limited_builtins
from RestrictedPython.Utilities import utility_builtins
from RestrictedPython.Guards import full_write_guard
from RestrictedPython.Eval import default_guarded_getiter
from RestrictedPython.Eval import default_guarded_getitem
from RestrictedPython.Guards import guarded_iter_unpack_sequence
from RestrictedPython.Guards import safer_getattr

restricted_globals = dict(
        __builtins__ = {**safe_builtins, **limited_builtins, **utility_builtins},
   
        )

restricted_globals['_print_'] = PrintCollector
restricted_globals['_write_'] = full_write_guard 
restricted_globals['_getattr_'] = safer_getattr
restricted_globals['_getitem_'] = default_guarded_getitem
restricted_globals['__metaclass__'] = type 
restricted_globals['_getiter_'] = default_guarded_getiter
restricted_globals['_iter_unpack_sequence_'] = guarded_iter_unpack_sequence """

bad_text = ["__class__", "__bases__", "eval(", "exec(", "import os", "import sys", "__import__", "from os", "from sys", "open(", "exit(", "quit(", "file(", "execfile(", "__builtins__", "reload(", "dir("]
bot1Works = True 
bot2Works = True


try:
    
    f = open("server/code/bot1.txt", "r")
    bot1text = f.read()
    if any(problem_word in bot1text for problem_word in bad_text):
        raise Exception("This code is not allowed. Contact akshajk@mit.edu for details")
    from bot1 import getSubmission as bot1code
    #bot1 = f.read()
    #loc={}
    #byte_code = compile_restricted(bot1, '<inline>', 'exec')
    # print(utility_builtins)
    #exec(byte_code,restricted_globals, loc)
    #print(loc)
    # bot1code = loc['getSubmission']
except Exception as e:
    if(len(sys.argv) > 1):
        print("[!BOT1] Error Message: ", e)
    bot1Works = False
try: 
    
    f = open("server/code/bot2.txt", "r")
    bot2text = f.read()
    if any(problem_word in bot2text for problem_word in bad_text):
        raise Exception("This code is not allowed. Contact akshajk@mit.edu for details")
    from bot2 import getSubmission as bot2code
    #bot2 = f.read()
    #loc={}
    #byte_code = compile_restricted(bot2, '<inline>', 'exec')
    #exec(byte_code, restricted_globals, loc)
    #print(loc)
    #bot2code = loc['getSubmission']
except Exception as e:
    if(len(sys.argv) > 1):
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
      except Exception as e:
          if(len(sys.argv) > 1):
              val1 = str(e)
          
      val2 = -1
      try:
          if(bot2Works):
              signal.signal(signal.SIGALRM, handler)
              signal.setitimer(signal.ITIMER_REAL, time_limit)
              val2 = bot2code(copy.deepcopy(results2), copy.deepcopy(results1), bot2score+0)
              signal.alarm(0)
      except Exception as e:
          if(len(sys.argv) > 1):
              val2 = str(e)

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