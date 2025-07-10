FROM jenkins/jenkins:lts-jdk17

# Switch to root user to install packages
USER root

# Install Node.js (required for Cypress)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Install Allure commandline globally
RUN npm install -g allure-commandline

# Install Chrome for Cypress (headless testing)
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
    apt-get update && \
    apt-get install -y google-chrome-stable

# Switch back to jenkins user
USER jenkins

# Pre-install essential Jenkins plugins
RUN jenkins-plugin-cli --plugins \
    "github:1.37.3" \
    "git:4.8.3" \
    "nodejs:1.5.1" \
    "allure-jenkins-plugin:2.30.2" \
    "pipeline-stage-view:2.25" \
    "workflow-aggregator:2.6"

# Expose port 8080
EXPOSE 8080

# Skip the initial setup wizard
ENV JAVA_OPTS="-Djenkins.install.runSetupWizard=false"

# Set admin user (you can change these)


ENV JENKINS_USER=syedalif123
ENV JENKINS_PASS=949678442b954ee295b6a84367bc191d