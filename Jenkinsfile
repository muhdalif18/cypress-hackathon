// 1. UPDATE cypress.config.ts - Add enhanced reporter options
import { defineConfig } from "cypress";

export default defineConfig({
  reporter: "mochawesome",
  reporterOptions: {
    reportDir: "cypress/results",
    overwrite: false,
    html: false,
    json: true,
    timestamp: "mmddyyyy_HHMMss",
    // KEY: Add these options for enhanced reporting
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
    quiet: true,
    reportTitle: "Cypress Test Report",
    reportPageTitle: "Test Results Dashboard"
  },

  e2e: {
    baseUrl: "https://my-shop-eight-theta.vercel.app/",
    specPattern: "cypress/e2e/**/*.ts",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    viewportWidth: 1920,
    viewportHeight: 1080,
    video: true,
    videosFolder: "cypress/videos",
    screenshotOnRunFailure: true,
    screenshotsFolder: "cypress/screenshots",
    retries: {
      runMode: 2,
      openMode: 0,
    },
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    testIsolation: true,
  },
});

// 2. UPDATE Jenkinsfile - Enhanced report generation
pipeline {
  agent any

  tools {
    nodejs 'node16'
  }

  environment {
    CYPRESS_CACHE_FOLDER = "${WORKSPACE}/.cypress-cache"
    NODE_ENV = 'ci'
  }

  stages {
    stage('Clean Workspace') {
      steps {
        bat '''
          if exist "cypress\\results" rmdir /s /q "cypress\\results"
          if exist "cypress\\videos" rmdir /s /q "cypress\\videos"
          if exist "cypress\\screenshots" rmdir /s /q "cypress\\screenshots"
        '''
      }
    }

    stage('Install Dependencies') {
      steps {
        bat '''
          npm ci
          npx cypress install
        '''
      }
    }

    stage('Run Cypress Tests') {
      steps {
        bat '''
          npx cypress run --reporter mochawesome --reporter-options "reportDir=cypress/results,overwrite=false,html=false,json=true,timestamp=mmddyyyy_HHMMss,charts=true,embeddedScreenshots=true,inlineAssets=true"
        '''
      }
      post {
        failure {
          archiveArtifacts artifacts: 'cypress/screenshots/**/*.png', allowEmptyArchive: true
        }
      }
    }

    stage('Generate Enhanced Dashboard Report') {
      steps {
        script {
          bat '''
            if not exist "cypress\\results\\html" mkdir "cypress\\results\\html"
            
            REM Merge all JSON reports
            npx mochawesome-merge "cypress/results/mochawesome*.json" > cypress/results/report.json
            
            REM Generate ENHANCED HTML report with all dashboard features
            npx marge cypress/results/report.json ^
              --reportDir cypress/results/html ^
              --inline ^
              --charts ^
              --enableCharts ^
              --code ^
              --autoOpen false ^
              --reportTitle "Cypress Test Dashboard - Build #%BUILD_NUMBER%" ^
              --reportPageTitle "Test Results Dashboard" ^
              --overwrite ^
              --showPassed true ^
              --showFailed true ^
              --showPending true ^
              --showSkipped true ^
              --showHooks always ^
              --saveJson true ^
              --dev false ^
              --assetsDir cypress/results/html/assets ^
              --timestamp "mmddyyyy_HHMMss"
          '''
        }
      }
    }

    stage('Generate Summary Dashboard') {
      steps {
        script {
          // Create custom dashboard HTML
          bat '''
            echo ^<!DOCTYPE html^> > cypress/results/html/dashboard.html
            echo ^<html^> >> cypress/results/html/dashboard.html
            echo ^<head^> >> cypress/results/html/dashboard.html
            echo ^<title^>Cypress Test Dashboard^</title^> >> cypress/results/html/dashboard.html
            echo ^<meta charset="utf-8"^> >> cypress/results/html/dashboard.html
            echo ^<meta name="viewport" content="width=device-width, initial-scale=1"^> >> cypress/results/html/dashboard.html
            echo ^<style^> >> cypress/results/html/dashboard.html
            echo body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; } >> cypress/results/html/dashboard.html
            echo .dashboard { max-width: 1200px; margin: 0 auto; } >> cypress/results/html/dashboard.html
            echo .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); } >> cypress/results/html/dashboard.html
            echo .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; } >> cypress/results/html/dashboard.html
            echo .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; } >> cypress/results/html/dashboard.html
            echo .stat-number { font-size: 2em; font-weight: bold; margin-bottom: 10px; } >> cypress/results/html/dashboard.html
            echo .passed { color: #28a745; } >> cypress/results/html/dashboard.html
            echo .failed { color: #dc3545; } >> cypress/results/html/dashboard.html
            echo .pending { color: #ffc107; } >> cypress/results/html/dashboard.html
            echo .skipped { color: #6c757d; } >> cypress/results/html/dashboard.html
            echo .report-link { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; } >> cypress/results/html/dashboard.html
            echo ^</style^> >> cypress/results/html/dashboard.html
            echo ^</head^> >> cypress/results/html/dashboard.html
            echo ^<body^> >> cypress/results/html/dashboard.html
            echo ^<div class="dashboard"^> >> cypress/results/html/dashboard.html
            echo ^<div class="header"^> >> cypress/results/html/dashboard.html
            echo ^<h1^>Cypress Test Dashboard^</h1^> >> cypress/results/html/dashboard.html
            echo ^<p^>Build #%BUILD_NUMBER% - %DATE% %TIME%^</p^> >> cypress/results/html/dashboard.html
            echo ^</div^> >> cypress/results/html/dashboard.html
            echo ^<div class="stats-grid"^> >> cypress/results/html/dashboard.html
            echo ^<div class="stat-card"^> >> cypress/results/html/dashboard.html
            echo ^<div class="stat-number passed"^>Loading...^</div^> >> cypress/results/html/dashboard.html
            echo ^<div^>Passed^</div^> >> cypress/results/html/dashboard.html
            echo ^</div^> >> cypress/results/html/dashboard.html
            echo ^<div class="stat-card"^> >> cypress/results/html/dashboard.html
            echo ^<div class="stat-number failed"^>Loading...^</div^> >> cypress/results/html/dashboard.html
            echo ^<div^>Failed^</div^> >> cypress/results/html/dashboard.html
            echo ^</div^> >> cypress/results/html/dashboard.html
            echo ^<div class="stat-card"^> >> cypress/results/html/dashboard.html
            echo ^<div class="stat-number pending"^>Loading...^</div^> >> cypress/results/html/dashboard.html
            echo ^<div^>Pending^</div^> >> cypress/results/html/dashboard.html
            echo ^</div^> >> cypress/results/html/dashboard.html
            echo ^<div class="stat-card"^> >> cypress/results/html/dashboard.html
            echo ^<div class="stat-number skipped"^>Loading...^</div^> >> cypress/results/html/dashboard.html
            echo ^<div^>Skipped^</div^> >> cypress/results/html/dashboard.html
            echo ^</div^> >> cypress/results/html/dashboard.html
            echo ^</div^> >> cypress/results/html/dashboard.html
            echo ^<a href="report.html" class="report-link"^>View Detailed Report^</a^> >> cypress/results/html/dashboard.html
            echo ^</div^> >> cypress/results/html/dashboard.html
            echo ^</body^> >> cypress/results/html/dashboard.html
            echo ^</html^> >> cypress/results/html/dashboard.html
          '''
        }
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'cypress/results/html/**', fingerprint: true
      archiveArtifacts artifacts: 'cypress/videos/**/*.mp4', allowEmptyArchive: true
      archiveArtifacts artifacts: 'cypress/screenshots/**/*.png', allowEmptyArchive: true
      
      // CRITICAL: Publish the enhanced report
      publishHTML([
        allowMissing: false,
        alwaysLinkToLastBuild: true,
        keepAll: true,
        reportDir: 'cypress/results/html',
        reportFiles: 'report.html',
        reportName: 'Cypress Test Dashboard',
        reportTitles: 'Test Results Dashboard',
        escapeUnderscores: false,
        includes: '**/*'
      ])
      
      // Also publish the simple dashboard
      publishHTML([
        allowMissing: false,
        alwaysLinkToLastBuild: true,
        keepAll: true,
        reportDir: 'cypress/results/html',
        reportFiles: 'dashboard.html',
        reportName: 'Test Summary Dashboard',
        reportTitles: 'Summary Dashboard',
        escapeUnderscores: false,
        includes: '**/*'
      ])
    }
    
    success {
      echo 'Tests passed! 🎉'
    }
    
    failure {
      echo 'Tests failed! Check the dashboard for details.'
    }
  }
}

// 3. Create multiple test suites to get module breakdown
// cypress/e2e/login.cy.ts
describe('Login Functionality', () => {
  it('should login successfully with valid credentials', () => {
    cy.visit('/login');
    cy.get('[data-cy=username]').type('testuser');
    cy.get('[data-cy=password]').type('password123');
    cy.get('[data-cy=submit]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should show error for invalid credentials', () => {
    cy.visit('/login');
    cy.get('[data-cy=username]').type('wronguser');
    cy.get('[data-cy=password]').type('wrongpass');
    cy.get('[data-cy=submit]').click();
    cy.get('[data-cy=error]').should('be.visible');
  });
});

// cypress/e2e/products.cy.ts
describe('Product Management', () => {
  beforeEach(() => {
    cy.visit('/products');
  });

  it('should display product list', () => {
    cy.get('[data-cy=product-list]').should('be.visible');
    cy.get('[data-cy=product-item]').should('have.length.greaterThan', 0);
  });

  it('should allow adding products to cart', () => {
    cy.get('[data-cy=add-to-cart]').first().click();
    cy.get('[data-cy=cart-count]').should('contain', '1');
  });
});

// cypress/e2e/checkout.cy.ts
describe('Checkout Process', () => {
  beforeEach(() => {
    cy.visit('/cart');
  });

  it('should complete checkout process', () => {
    cy.get('[data-cy=checkout-button]').click();
    cy.get('[data-cy=billing-form]').should('be.visible');
    cy.get('[data-cy=complete-order]').click();
    cy.get('[data-cy=success-message]').should('be.visible');
  });
});

// 4. Package.json scripts for local testing
{
  "scripts": {
    "test": "cypress run",
    "test:report": "npm run test && npm run generate:report",
    "generate:report": "npx mochawesome-merge cypress/results/mochawesome*.json > cypress/results/report.json && npx marge cypress/results/report.json --reportDir cypress/results/html --inline --charts --enableCharts --code --reportTitle 'Cypress Test Dashboard' --showPassed true --showFailed true --showPending true --showSkipped true"
  }
}

// 5. IMPORTANT: Check your package.json dependencies
{
  "devDependencies": {
    "cypress": "^13.0.0",
    "mochawesome": "^7.1.3",
    "mochawesome-merge": "^4.3.0",
    "marge": "^1.0.1"
  }
}