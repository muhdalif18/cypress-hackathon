pipeline {
  agent any

  tools {
    nodejs 'node16'
  }

  stages {
    stage('Install Dependencies') {
      steps {
        sh 'npm install'
      }
    }

    stage('Run Cypress Tests') {
      steps {
        sh 'npx cypress run'
      }
    }
  }

  post {
    always {
      junit '**/cypress/results/*.xml' // optional if you generate junit xml results
    }
  }
}
