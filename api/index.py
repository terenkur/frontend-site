import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from backend.main import app as fastapi_app
app = fastapi_app
