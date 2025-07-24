FROM alpine:3.21.0
#LABEL com.example.project=api

# Install Base Package
#RUN apk add --no-cache python3 py3-pip py3-requests py3-redis py3-flask py3-pyrad
RUN mkdir -p /tevis/templates

#RUN pip install Flask-HTTPAuth --break-system-packages

# Create Working Directory
WORKDIR /tevis

COPY teVis .
COPY templates/*.html templates/
# Add Remote Files
#ADD http://te-git-01/hackathon2025/teaddon/-/raw/dev/src/radius-proxy/radius-proxy.py /hackathon/radius-proxy.py

# TCP Port to be exposed
EXPOSE 8090 
# Container health checks
#HEALTHCHECK --timeout=3s CMD curl -f http://localhost:5000/status/ || exit 1

# Process to run
ENTRYPOINT ["/tevis/teVis"]

# Default arguments for that process
#CMD ["/hackathon/radius-proxy.py"]