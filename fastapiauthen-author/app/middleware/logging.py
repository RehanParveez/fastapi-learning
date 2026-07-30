from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
import time

class LoggingMiddleware(BaseHTTPMiddleware):
  async def dispatch(self, request: Request, call_next):
    start_time = time.time()
    print(f"Request started: {request.method} {request.url.path}")
        
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    print(f"Request finished: {request.method} {request.url.path} | Time: {process_time:.4f}s")
        
    return response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
  async def dispatch(self, request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response