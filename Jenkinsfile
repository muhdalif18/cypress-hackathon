pipeline {
  agent any

  tools {
    nodejs 'node16' // Use the Node.js you configured in Jenkins
  }

  stages {
    stage('Install Dependencies') {
      steps {
        bat 'npm install'
      }
    }

    stage('Run Cypress Tests') {
      steps {
        bat 'npx cypress run'
      }
    }

    stage('Generate Report') {
      steps {
        // Merge mochawesome JSON files
        bat 'npx mochawesome-merge cypress/results/mochawesome_*.json > cypress/results/report.json'

        // Generate HTML report from merged JSON
        bat 'npx marge cypress/results/report.json --reportDir cypress/results/html'
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'cypress/results/html/**', fingerprint: true
    }
  }
}
