pipeline {
  agent any

  tools {
    nodejs 'node16'
  }

  stages {
    stage('Install Dependencies') {
      steps {
        bat 'npm install'
        bat 'npx cypress install' // ← this installs the Cypress binary
      }
    }

    stage('Run Cypress Tests') {
      steps {
        bat 'npx cypress run'
      }
    }

    stage('Generate Report') {
      steps {
        bat 'npx mochawesome-merge cypress/results/mochawesome_*.json > cypress/results/report.json'
        bat 'npx marge cypress/results/report.json --reportDir cypress/results/html'
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'cypress/results/html/', fingerprint: true
    }
  }
}