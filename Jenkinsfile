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
        bat 'if exist "cypress\\results" rmdir /s /q "cypress\\results"'
        bat 'if exist "cypress\\videos" rmdir /s /q "cypress\\videos"'
        bat 'if exist "cypress\\screenshots" rmdir /s /q "cypress\\screenshots"'
      }
    }

    stage('Install Dependencies') {
      steps {
        bat 'npm ci'
        bat 'npx cypress install'
      }
    }

    stage('Run Cypress Tests') {
      steps {
        bat 'npx cypress run --reporter mochawesome --reporter-options "reportDir=cypress/results,overwrite=false,html=false,json=true,timestamp=mmddyyyy_HHMMss,charts=true,embeddedScreenshots=true,inlineAssets=true"'
      }
      post {
        failure {
          archiveArtifacts artifacts: 'cypress/screenshots/**/*.png', allowEmptyArchive: true
        }
      }
    }

    stage('Generate Enhanced Dashboard') {
      steps {
        script {
          // Create enhanced reports directory
          bat 'if not exist "cypress\\results\\dashboard" mkdir "cypress\\results\\dashboard"'
          
          // Merge all JSON reports
          bat 'npx mochawesome-merge "cypress/results/mochawesome*.json" > cypress/results/merged-report.json'
          
          // Generate enhanced HTML report with dashboard features
          bat '''
            npx marge cypress/results/merged-report.json ^
            --reportDir cypress/results/dashboard ^
            --reportFilename index ^
            --inline ^
            --charts ^
            --code ^
            --reportTitle "Cypress Test Dashboard - Build #%BUILD_NUMBER%" ^
            --reportPageTitle "Test Results Dashboard" ^
            --showPassed true ^
            --showFailed true ^
            --showPending true ^
            --showSkipped true ^
            --enableCharts true ^
            --overwrite
          '''
          
          // Create a separate Node.js script for dashboard generation
          bat '''
            echo const fs = require('fs'); > generate-dashboard.js
            echo const report = JSON.parse(fs.readFileSync('cypress/results/merged-report.json', 'utf8')); >> generate-dashboard.js
            echo const stats = { >> generate-dashboard.js
            echo   total: report.stats.tests, >> generate-dashboard.js
            echo   passed: report.stats.passes, >> generate-dashboard.js
            echo   failed: report.stats.failures, >> generate-dashboard.js
            echo   pending: report.stats.pending, >> generate-dashboard.js
            echo   skipped: report.stats.skipped, >> generate-dashboard.js
            echo   passPercentage: ((report.stats.passes / report.stats.tests) * 100).toFixed(2), >> generate-dashboard.js
            echo   duration: report.stats.duration, >> generate-dashboard.js
            echo   suites: report.stats.suites >> generate-dashboard.js
            echo }; >> generate-dashboard.js
            echo fs.writeFileSync('cypress/results/dashboard/dashboard.json', JSON.stringify(stats, null, 2)); >> generate-dashboard.js
            echo console.log('Dashboard data generated successfully'); >> generate-dashboard.js
          '''
          
          // Run the dashboard generation script
          bat 'node generate-dashboard.js'
          
          // Create the dashboard HTML file
          bat '''
            (
            echo ^<!DOCTYPE html^>
            echo ^<html^>
            echo ^<head^>
            echo     ^<title^>Cypress Test Dashboard^</title^>
            echo     ^<style^>
            echo         body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            echo         .dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr^)^); gap: 20px; margin-bottom: 30px; }
            echo         .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1^); }
            echo         .stat-number { font-size: 2.5em; font-weight: bold; margin: 10px 0; }
            echo         .stat-label { color: #666; font-size: 0.9em; }
            echo         .passed { color: #28a745; }
            echo         .failed { color: #dc3545; }
            echo         .pending { color: #ffc107; }
            echo         .skipped { color: #6c757d; }
            echo         .percentage { font-size: 1.8em; font-weight: bold; color: #28a745; }
            echo         .progress-bar { width: 100%%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; }
            echo         .progress-fill { height: 100%%; background: #28a745; transition: width 0.3s ease; }
            echo         .main-report-link { display: inline-block; margin: 20px 0; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
            echo         .main-report-link:hover { background: #0056b3; }
            echo     ^</style^>
            echo ^</head^>
            echo ^<body^>
            echo     ^<h1^>Cypress Test Dashboard - Build #%BUILD_NUMBER%^</h1^>
            echo     ^<div class="dashboard"^>
            echo         ^<div class="card"^>
            echo             ^<div class="stat-label"^>Total Tests^</div^>
            echo             ^<div class="stat-number" id="totalTests"^>Loading...^</div^>
            echo         ^</div^>
            echo         ^<div class="card"^>
            echo             ^<div class="stat-label"^>Passed^</div^>
            echo             ^<div class="stat-number passed" id="passedTests"^>Loading...^</div^>
            echo         ^</div^>
            echo         ^<div class="card"^>
            echo             ^<div class="stat-label"^>Failed^</div^>
            echo             ^<div class="stat-number failed" id="failedTests"^>Loading...^</div^>
            echo         ^</div^>
            echo         ^<div class="card"^>
            echo             ^<div class="stat-label"^>Success Rate^</div^>
            echo             ^<div class="percentage" id="successRate"^>Loading...^</div^>
            echo             ^<div class="progress-bar"^>
            echo                 ^<div class="progress-fill" id="progressFill"^>^</div^>
            echo             ^</div^>
            echo         ^</div^>
            echo         ^<div class="card"^>
            echo             ^<div class="stat-label"^>Duration^</div^>
            echo             ^<div class="stat-number" id="duration"^>Loading...^</div^>
            echo         ^</div^>
            echo         ^<div class="card"^>
            echo             ^<div class="stat-label"^>Test Suites^</div^>
            echo             ^<div class="stat-number" id="suites"^>Loading...^</div^>
            echo         ^</div^>
            echo     ^</div^>
            echo     ^<a href="index.html" class="main-report-link"^>View Detailed Report^</a^>
            echo     ^<script^>
            echo         fetch('dashboard.json'^).then(r =^> r.json(^)^).then(stats =^> {
            echo             document.getElementById('totalTests'^).textContent = stats.total;
            echo             document.getElementById('passedTests'^).textContent = stats.passed;
            echo             document.getElementById('failedTests'^).textContent = stats.failed;
            echo             document.getElementById('successRate'^).textContent = stats.passPercentage + '%%';
            echo             document.getElementById('duration'^).textContent = (stats.duration / 1000^).toFixed(1^) + 's';
            echo             document.getElementById('suites'^).textContent = stats.suites;
            echo             setTimeout(^(^) =^> {
            echo                 document.getElementById('progressFill'^).style.width = stats.passPercentage + '%%';
            echo             }, 500^);
            echo         }^);
            echo     ^</script^>
            echo ^</body^>
            echo ^</html^>
            ) > cypress/results/dashboard/dashboard.html
          '''
        }
      }
    }
  }

  post {
    always {
      // Archive all artifacts
      archiveArtifacts artifacts: 'cypress/results/dashboard/**', fingerprint: true
      archiveArtifacts artifacts: 'cypress/videos/**/*.mp4', allowEmptyArchive: true
      archiveArtifacts artifacts: 'cypress/screenshots/**/*.png', allowEmptyArchive: true
      
      // Publish both dashboard and detailed report
      publishHTML([
        allowMissing: false,
        alwaysLinkToLastBuild: true,
        keepAll: true,
        reportDir: 'cypress/results/dashboard',
        reportFiles: 'dashboard.html',
        reportName: 'Cypress Dashboard',
        reportTitles: '',
        escapeUnderscores: false
      ])
      
      publishHTML([
        allowMissing: false,
        alwaysLinkToLastBuild: true,
        keepAll: true,
        reportDir: 'cypress/results/dashboard',
        reportFiles: 'index.html',
        reportName: 'Cypress Detailed Report',
        reportTitles: '',
        escapeUnderscores: false
      ])
      
      cleanWs()
    }
    
    success {
      echo 'Tests passed! 🎉'
    }
    
    failure {
      echo 'Tests failed! Check the reports for details.'
    }
  }
}