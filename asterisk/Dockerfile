# Use pre-built Asterisk image
FROM andrius/asterisk:20.16.0_debian-trixie

# Install ODBC for MySQL connectivity
USER root
RUN apt-get update && apt-get install -y \
    unixodbc \
    unixodbc-dev \
    odbc-mariadb \
    && rm -rf /var/lib/apt/lists/*

# Create directories
RUN mkdir -p /var/spool/asterisk/monitor && \
    mkdir -p /var/lib/asterisk/sounds && \    
    mkdir -p /var/lib/asterisk/keys &&\
    mkdir -p /var/log/asterisk && \
    chown -R asterisk:asterisk /var/spool/asterisk /var/lib/asterisk /var/log/asterisk

# Copy configuration files
COPY config/* /etc/asterisk/

# Expose ports
EXPOSE 5060/udp 8088 10000-10099/udp

# Switch back to asterisk user
USER asterisk

CMD ["/usr/sbin/asterisk", "-f", "-vvvg", "-c"]