#!/bin/bash
gunicorn --workers 1 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 backend.main:app
