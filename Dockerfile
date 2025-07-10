FROM jenkins/jenkins:lts-jdk17

# Switch to root user to install packages
USER root

# Install Node.js (required for Cypress)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Install Allure commandline globally
RUN npm install -g allure-commandline

# Install dependencies for running Cypress
RUN apt-get update && apt-get install -y \
    libgtk-3-0 \
    libgbm-dev \
    libnotify-dev \
    libnss3 \
    libxss1 \
    libasound2 \
    libxtst6 \
    xauth \
    xvfb \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Switch back to jenkins user
USER jenkins

# Skip the initial setup wizard
ENV JAVA_OPTS="-Djenkins.install.runSetupWizard=false"

# Expose port 8080
EXPOSE 8080