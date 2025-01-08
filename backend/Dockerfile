FROM python:3
WORKDIR /app

# Install requirements
COPY requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt

# Copy code
COPY . /app

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
RUN chmod +x /app/entrypoint_celery.sh
ENTRYPOINT ["/app/entrypoint.sh"]