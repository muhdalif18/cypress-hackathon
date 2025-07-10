// package.json - Required dependencies
{
  "devDependencies": {
    "cypress": "^13.0.0",
    "mochawesome": "^7.1.3",
    "mochawesome-merge": "^4.3.0",
    "marge": "^1.0.1"
  },
  "scripts": {
    "cy:run": "cypress run",
    "cy:report": "npm run cy:merge && npm run cy:generate",
    "cy:merge": "mochawesome-merge cypress/results/mochawesome*.json > cypress/results/report.json",
    "cy:generate": "marge cypress/results/report.json --reportDir cypress/results/html --inline --charts"
  }
}

// cypress.config.ts - Enhanced configuration
import { defineConfig } from "cypress";

export default defineConfig({
  reporter: "mochawesome",
  reporterOptions: {
    reportDir: "cypress/results",
    overwrite: false,
    html: false,
    json: true,
    timestamp: "mmddyyyy_HHMMss",
    // Enhanced report options
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
    ignoreVideos: false,
    videoOnFailOnly: false
  },

  e2e: {
    baseUrl: "https://my-shop-eight-theta.vercel.app/",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    
    // Professional settings
    viewportWidth: 1920,
    viewportHeight: 1080,
    video: true,
    videosFolder: "cypress/videos",
    screenshotOnRunFailure: true,
    screenshotsFolder: "cypress/screenshots",
    
    // Retry configuration
    retries: {
      runMode: 2,
      openMode: 0,
    },
    
    // Timeouts
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    
    testIsolation: true,
    
    setupNodeEvents(on, config) {
      // Custom event listeners for enhanced reporting
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        table(message) {
          console.table(message);
          return null;
        }
      });

      // Screenshot customization
      on('after:screenshot', (details) => {
        console.log('Screenshot taken', details);
      });

      return config;
    },
  },
});

// Enhanced Jenkinsfile with professional reporting
pipeline {
  agent any

  tools {
    nodejs 'node16'
  }

  environment {
    CYPRESS_CACHE_FOLDER = "${WORKSPACE}/.cypress-cache"
    NODE_ENV = 'ci'
    CYPRESS_RECORD_KEY = credentials('cypress-record-key') // Optional: for Cypress Dashboard
  }

  stages {
    stage('Clean Workspace') {
      steps {
        script {
          if (isUnix()) {
            sh 'rm -rf cypress/results cypress/videos cypress/screenshots'
          } else {
            bat '''
              if exist "cypress\\results" rmdir /s /q "cypress\\results"
              if exist "cypress\\videos" rmdir /s /q "cypress\\videos"
              if exist "cypress\\screenshots" rmdir /s /q "cypress\\screenshots"
            '''
          }
        }
      }
    }

    stage('Install Dependencies') {
      steps {
        script {
          if (isUnix()) {
            sh '''
              npm ci
              npx cypress install
              npx cypress verify
            '''
          } else {
            bat '''
              npm ci
              npx cypress install
              npx cypress verify
            '''
          }
        }
      }
    }

    stage('Run Cypress Tests') {
      parallel {
        stage('Chrome Tests') {
          steps {
            script {
              if (isUnix()) {
                sh 'npx cypress run --browser chrome --reporter mochawesome --reporter-options "reportDir=cypress/results/chrome,overwrite=false,html=false,json=true,timestamp=mmddyyyy_HHMMss"'
              } else {
                bat 'npx cypress run --browser chrome --reporter mochawesome --reporter-options "reportDir=cypress/results/chrome,overwrite=false,html=false,json=true,timestamp=mmddyyyy_HHMMss"'
              }
            }
          }
        }
        stage('Firefox Tests') {
          steps {
            script {
              if (isUnix()) {
                sh 'npx cypress run --browser firefox --reporter mochawesome --reporter-options "reportDir=cypress/results/firefox,overwrite=false,html=false,json=true,timestamp=mmddyyyy_HHMMss"'
              } else {
                bat 'npx cypress run --browser firefox --reporter mochawesome --reporter-options "reportDir=cypress/results/firefox,overwrite=false,html=false,json=true,timestamp=mmddyyyy_HHMMss"'
              }
            }
          }
        }
      }
      post {
        failure {
          archiveArtifacts artifacts: 'cypress/screenshots/**/*.png', allowEmptyArchive: true
          archiveArtifacts artifacts: 'cypress/videos/**/*.mp4', allowEmptyArchive: true
        }
      }
    }

    stage('Generate Professional Report') {
      steps {
        script {
          if (isUnix()) {
            sh '''
              mkdir -p cypress/results/html
              # Merge all JSON reports
              npx mochawesome-merge "cypress/results/**/*.json" > cypress/results/report.json
              
              # Generate enhanced HTML report
              npx marge cypress/results/report.json \\
                --reportDir cypress/results/html \\
                --inline \\
                --charts \\
                --reportTitle "Cypress Test Report - Build #${BUILD_NUMBER}" \\
                --reportPageTitle "Test Results - ${JOB_NAME}" \\
                --overwrite \\
                --timestamp "mmddyyyy_HHMMss" \\
                --showPassed true \\
                --showFailed true \\
                --showPending true \\
                --showSkipped true \\
                --enableCharts true \\
                --enableCode true
            '''
          } else {
            bat '''
              if not exist "cypress\\results\\html" mkdir "cypress\\results\\html"
              npx mochawesome-merge "cypress/results/**/*.json" > cypress/results/report.json
              npx marge cypress/results/report.json --reportDir cypress/results/html --inline --charts --reportTitle "Cypress Test Report - Build #%BUILD_NUMBER%" --reportPageTitle "Test Results" --overwrite --showPassed true --showFailed true --showPending true --showSkipped true --enableCharts true --enableCode true
            '''
          }
        }
      }
    }

    stage('Generate Summary Report') {
      steps {
        script {
          // Create a custom summary
          def reportData = readJSON file: 'cypress/results/report.json'
          def summary = [
            buildNumber: env.BUILD_NUMBER,
            buildUrl: env.BUILD_URL,
            totalTests: reportData.stats.tests,
            passed: reportData.stats.passes,
            failed: reportData.stats.failures,
            pending: reportData.stats.pending,
            skipped: reportData.stats.skipped,
            duration: reportData.stats.duration,
            passPercentage: ((reportData.stats.passes / reportData.stats.tests) * 100).round(2)
          ]
          
          writeJSON file: 'cypress/results/summary.json', json: summary
          
          // Create text summary
          if (isUnix()) {
            sh '''
              echo "=== Cypress Test Summary ===" > cypress/results/summary.txt
              echo "Build: #${BUILD_NUMBER}" >> cypress/results/summary.txt
              echo "Date: $(date)" >> cypress/results/summary.txt
              echo "Total Tests: $(jq '.totalTests' cypress/results/summary.json)" >> cypress/results/summary.txt
              echo "Passed: $(jq '.passed' cypress/results/summary.json)" >> cypress/results/summary.txt
              echo "Failed: $(jq '.failed' cypress/results/summary.json)" >> cypress/results/summary.txt
              echo "Pass Rate: $(jq '.passPercentage' cypress/results/summary.json)%" >> cypress/results/summary.txt
            '''
          } else {
            bat '''
              echo === Cypress Test Summary === > cypress/results/summary.txt
              echo Build: #%BUILD_NUMBER% >> cypress/results/summary.txt
              echo Date: %DATE% %TIME% >> cypress/results/summary.txt
            '''
          }
        }
      }
    }
  }

  post {
    always {
      // Archive all artifacts
      archiveArtifacts artifacts: 'cypress/results/**/*', fingerprint: true
      archiveArtifacts artifacts: 'cypress/videos/**/*.mp4', allowEmptyArchive: true
      archiveArtifacts artifacts: 'cypress/screenshots/**/*.png', allowEmptyArchive: true
      
      // Publish HTML Report with CSP bypass
      publishHTML([
        allowMissing: false,
        alwaysLinkToLastBuild: true,
        keepAll: true,
        reportDir: 'cypress/results/html',
        reportFiles: 'report.html',
        reportName: 'Cypress Test Report',
        reportTitles: 'Detailed Test Results',
        escapeUnderscores: false,
        includes: '**/*'
      ])
      
      // Publish Test Results
      publishTestResults testResultsPattern: 'cypress/results/report.json'
      
      // Send notifications
      script {
        def summary = readJSON file: 'cypress/results/summary.json'
        def message = """
          🧪 Cypress Test Results - Build #${env.BUILD_NUMBER}
          📊 Total Tests: ${summary.totalTests}
          ✅ Passed: ${summary.passed}
          ❌ Failed: ${summary.failed}
          📈 Pass Rate: ${summary.passPercentage}%
          🔗 Report: ${env.BUILD_URL}Cypress_Test_Report/
        """
        
        if (summary.failed > 0) {
          slackSend channel: '#testing', color: 'danger', message: message
        } else {
          slackSend channel: '#testing', color: 'good', message: message
        }
      }
    }
    
    success {
      echo '🎉 All tests passed!'
    }
    
    failure {
      echo '❌ Some tests failed. Check the report for details.'
    }
  }
}

// cypress/support/commands.js - Custom commands for better reporting
Cypress.Commands.add('logStep', (message) => {
  cy.log(`📝 ${message}`);
  cy.task('log', `Step: ${message}`);
});

Cypress.Commands.add('captureScreenshot', (name) => {
  cy.screenshot(name, { capture: 'fullPage' });
});

// Example test with enhanced reporting
describe('E-commerce Application Tests', () => {
  beforeEach(() => {
    cy.logStep('Starting test execution');
    cy.visit('/');
  });

  it('should display homepage correctly', () => {
    cy.logStep('Validating homepage elements');
    cy.get('[data-cy=header]').should('be.visible');
    cy.get('[data-cy=product-grid]').should('exist');
    cy.captureScreenshot('homepage-loaded');
  });

  it('should handle user authentication', () => {
    cy.logStep('Testing login functionality');
    cy.get('[data-cy=login-button]').click();
    cy.get('[data-cy=username]').type('testuser');
    cy.get('[data-cy=password]').type('password123');
    cy.get('[data-cy=submit]').click();
    cy.url().should('include', '/dashboard');
    cy.captureScreenshot('login-success');
  });
});

// Custom HTML template for enhanced reporting (optional)
// cypress/support/report-template.html
<!DOCTYPE html>
<html>
<head>
    <title>Cypress Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; }
        .stats { display: flex; gap: 20px; margin: 20px 0; }
        .stat-card { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .passed { border-left: 4px solid #28a745; }
        .failed { border-left: 4px solid #dc3545; }
        .pending { border-left: 4px solid #ffc107; }
        .skipped { border-left: 4px solid #6c757d; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Cypress Test Report</h1>
        <p>Build #{{BUILD_NUMBER}} - {{DATE}}</p>
    </div>
    
    <div class="stats">
        <div class="stat-card passed">
            <h3>{{PASSED}}</h3>
            <p>Passed</p>
        </div>
        <div class="stat-card failed">
            <h3>{{FAILED}}</h3>
            <p>Failed</p>
        </div>
        <div class="stat-card pending">
            <h3>{{PENDING}}</h3>
            <p>Pending</p>
        </div>
        <div class="stat-card skipped">
            <h3>{{SKIPPED}}</h3>
            <p>Skipped</p>
        </div>
    </div>
    
    {{MOCHAWESOME_REPORT}}
</body>
</html>