pipeline {
  agent any

  tools {
    nodejs 'node16'
  }

  environment {
    // Professional environment variables
    CYPRESS_CACHE_FOLDER = "${WORKSPACE}/.cypress-cache"
    NODE_ENV = 'ci'
  }

  stages {
    stage('Clean Workspace') {
      steps {
        // Clean previous artifacts
        bat 'if exist "cypress\\results" rmdir /s /q "cypress\\results"'
        bat 'if exist "cypress\\videos" rmdir /s /q "cypress\\videos"'
        bat 'if exist "cypress\\screenshots" rmdir /s /q "cypress\\screenshots"'
      }
    }

    stage('Install Dependencies') {
      steps {
        bat 'npm ci' // Use npm ci for faster, reliable installs in CI
        bat 'npx cypress install'
      }
    }

    stage('Run Cypress Tests') {
      steps {
        bat 'npx cypress run --reporter mochawesome --reporter-options "reportDir=cypress/results,overwrite=false,html=false,json=true,timestamp=mmddyyyy_HHMMss"'
      }
      post {
        failure {
          // Archive screenshots on failure
          archiveArtifacts artifacts: 'cypress/screenshots/**/*.png', allowEmptyArchive: true
        }
      }
    }

    stage('Generate Professional Report') {
      steps {
        script {
          // Create reports directory if it doesn't exist
          bat 'if not exist "cypress\\results\\html" mkdir "cypress\\results\\html"'
          
          // Merge reports and generate HTML with CSP-friendly options
          bat 'npx mochawesome-merge "cypress/results/mochawesome*.json" > cypress/results/report.json'
          bat 'npx marge cypress/results/report.json --reportDir cypress/results/html --inline --charts --reportTitle "Cypress Test Report - Build #${BUILD_NUMBER}" --reportPageTitle "Test Results" --overwrite'
        }
      }
    }
  }

  post {
    always {
      // Archive all artifacts
      archiveArtifacts artifacts: 'cypress/results/html/**', fingerprint: true
      archiveArtifacts artifacts: 'cypress/videos/**/*.mp4', allowEmptyArchive: true
      archiveArtifacts artifacts: 'cypress/screenshots/**/*.png', allowEmptyArchive: true
      
      // SOLUTION 1: Configure HTML Publisher with CSP bypass
     publishHTML([
  allowMissing: false,
  alwaysLinkToLastBuild: true,
  keepAll: true,
  reportDir: 'cypress/results/html',
  reportFiles: 'report.html',
  reportName: 'Cypress Test Report',
  reportTitles: 'Test Results',
  // Enhanced CSP bypass settings
  escapeUnderscores: false,
  includes: '**/*',
  // Additional CSP bypass options
  allowMissing: false,
  alwaysLinkToLastBuild: true,
  keepAll: true,
  // Try adding these if available in your Jenkins version
  disable: false,
  useWrapperFileDirectly: true
])
      
      // SOLUTION 2: Alternative simple text summary
      script {
        bat 'echo Test Summary Report > cypress/results/summary.txt'
        bat 'echo Build Number: ${BUILD_NUMBER} >> cypress/results/summary.txt'
        bat 'echo Build Date: %DATE% %TIME% >> cypress/results/summary.txt'
        archiveArtifacts artifacts: 'cypress/results/summary.txt', fingerprint: true
      }
      
      // Clean up workspace
      cleanWs()
    }
    
    success {
      echo 'Tests passed! 🎉'
    }
    
    failure {
      echo 'Tests failed! Check the report for details.'
    }
  }
}