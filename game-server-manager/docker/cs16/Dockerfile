# CS 1.6 Dedicated Server Dockerfile
FROM ubuntu:20.04

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && apt-get install -y \
    lib32gcc1 \
    lib32stdc++6 \
    wget \
    unzip \
    curl \
    screen \
    && rm -rf /var/lib/apt/lists/*

# Create steam user
RUN useradd -m -s /bin/bash steam

# Switch to steam user
USER steam
WORKDIR /home/steam

# Download and install SteamCMD
RUN mkdir steamcmd && \
    cd steamcmd && \
    wget https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz && \
    tar -xvzf steamcmd_linux.tar.gz && \
    rm steamcmd_linux.tar.gz

# Create server directory
RUN mkdir -p /home/steam/cs16

# Install CS 1.6 Dedicated Server
RUN cd /home/steam/steamcmd && \
    ./steamcmd.sh +force_install_dir /home/steam/cs16 +login anonymous +app_update 90 validate +quit

# Set working directory to CS 1.6 server
WORKDIR /home/steam/cs16

# Copy server configuration files
COPY --chown=steam:steam configs/ ./

# Create startup script
RUN echo '#!/bin/bash' > start_server.sh && \
    echo 'cd /home/steam/cs16' >> start_server.sh && \
    echo 'echo "Starting CS 1.6 server with SERVER_NAME=$SERVER_NAME"' >> start_server.sh && \
    echo '# Replace hostname in server.cfg with environment variable' >> start_server.sh && \
    echo 'sed -i "s/hostname \".*\"/hostname \"$SERVER_NAME\"/" server.cfg' >> start_server.sh && \
    echo '# Replace password if set' >> start_server.sh && \
    echo 'sed -i "s/sv_password \".*\"/sv_password \"${SERVER_PASSWORD:-}\"/" server.cfg' >> start_server.sh && \
    echo 'echo "Updated server.cfg with hostname: $SERVER_NAME"' >> start_server.sh && \
    echo './hlds_run -game cstrike +map ${START_MAP:-de_dust2} +maxplayers ${MAX_PLAYERS:-16} +port 27015 +rcon_password ${RCON_PASSWORD:-changeme} +exec server.cfg -noipx -nojoy -noipx -num_edicts 4096' >> start_server.sh && \
    chmod +x start_server.sh

# Environment variables with defaults
ENV MAX_PLAYERS=16
ENV START_MAP=de_dust2
ENV RCON_PASSWORD=changeme
ENV SERVER_PASSWORD=""

# Expose the default CS 1.6 port
EXPOSE 27015/udp

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD netstat -an | grep :27015 > /dev/null || exit 1

# Start the server
CMD ["./start_server.sh"] 