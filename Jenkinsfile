pipeline {
  agent any

  tools {
    nodejs 'node16' // make sure this matches your Jenkins tools config
  }

  stages {
    stage('Clean Old Reports') {
      steps {
        bat 'rmdir /s /q cypress\\results || echo No folder'
        bat 'mkdir cypress\\results'
      }
    }

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
        bat 'npx mochawesome-merge cypress\\results\\*.json > cypress\\results\\report.json'
        bat 'npx marge cypress\\results\\report.json --reportDir cypress\\results\\html'
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'cypress/results/html/**', fingerprint: true
    }
  }
}
