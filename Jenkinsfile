pipeline {
  agent any
  tools {
    nodejs 'node16'
  }

  stages {
    stage('Install Dependencies') {
      steps {
        bat 'npm ci'
        bat 'npx cypress install'
      }
    }

    stage('Run Tests') {
      steps {
        bat 'npx cypress run'
      }
    }

    stage('Merge & Generate Report') {
      steps {
        bat 'npx mochawesome-merge cypress/results/*.json > cypress/results/report.json'
        bat 'npx marge cypress/results/report.json --reportDir cypress/results/html --reportFilename report --inline --overwrite'
      }
    }

    stage('Archive Report') {
      steps {
        archiveArtifacts artifacts: 'cypress/results/html/**', fingerprint: true
      }
    }
  }
}
