pipeline {
  agent any

  tools {
    nodejs 'node16'
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

    stage('Generate HTML Report') {
      steps {
        bat 'npx mochawesome-merge cypress/results/*.json > cypress/results/report.json'
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
