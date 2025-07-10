pipeline {
  agent any

  tools {
    nodejs 'node16'
  }

  environment {
    CYPRESS_CACHE_FOLDER = "${WORKSPACE}/.cypress-cache"
    NODE_ENV = 'ci'
    CYPRESS_TEST_RESULT = 'unknown'
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
        script {
          // Use try-catch to capture test results without failing the pipeline
          try {
            bat 'npx cypress run --reporter mochawesome --reporter-options "reportDir=cypress/results,overwrite=false,html=false,json=true,timestamp=mmddyyyy_HHMMss,charts=true,embeddedScreenshots=true,inlineAssets=true"'
            env.CYPRESS_TEST_RESULT = 'success'
          } catch (Exception e) {
            env.CYPRESS_TEST_RESULT = 'failed'
            echo "Tests failed, but continuing to generate reports..."
            currentBuild.result = 'UNSTABLE' // Mark as unstable instead of failed
          }
        }
      }
      post {
        always {
          // Always archive screenshots, regardless of test outcome
          archiveArtifacts artifacts: 'cypress/screenshots/**/*.png', allowEmptyArchive: true
        }
      }
    }

    stage('Generate Enhanced Dashboard') {
      // This stage will now ALWAYS run
      when {
        always()
      }
      steps {
        script {
          // Create enhanced reports directory
          bat 'if not exist "cypress\\results\\dashboard" mkdir "cypress\\results\\dashboard"'
          
          // Check if any JSON reports exist
          def jsonReports = bat(script: 'dir /b cypress\\results\\mochawesome*.json 2>nul', returnStatus: true)
          
          if (jsonReports == 0) {
            // JSON reports exist, proceed with normal dashboard generation
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
            
            // Create dashboard data from actual results
            bat '''
              echo const fs = require('fs'); > generate-dashboard.js
              echo const report = JSON.parse(fs.readFileSync('cypress/results/merged-report.json', 'utf8')); >> generate-dashboard.js
              echo const stats = { >> generate-dashboard.js
              echo   total: report.stats.tests, >> generate-dashboard.js
              echo   passed: report.stats.passes, >> generate-dashboard.js
              echo   failed: report.stats.failures, >> generate-dashboard.js
              echo   pending: report.stats.pending, >> generate-dashboard.js
              echo   skipped: report.stats.skipped, >> generate-dashboard.js
              echo   passPercentage: report.stats.tests ? ((report.stats.passes / report.stats.tests) * 100).toFixed(2) : 0, >> generate-dashboard.js
              echo   duration: report.stats.duration, >> generate-dashboard.js
              echo   suites: report.stats.suites, >> generate-dashboard.js
              echo   buildStatus: '%CYPRESS_TEST_RESULT%' >> generate-dashboard.js
              echo }; >> generate-dashboard.js
              echo fs.writeFileSync('cypress/results/dashboard/dashboard.json', JSON.stringify(stats, null, 2)); >> generate-dashboard.js
              echo console.log('Dashboard data generated successfully'); >> generate-dashboard.js
            '''
            
            bat 'node generate-dashboard.js'
          } else {
            // No JSON reports found, create empty dashboard
            echo "No test reports found. Creating empty dashboard..."
            bat '''
              echo { > cypress/results/dashboard/dashboard.json
              echo   "total": 0, >> cypress/results/dashboard/dashboard.json
              echo   "passed": 0, >> cypress/results/dashboard/dashboard.json
              echo   "failed": 0, >> cypress/results/dashboard/dashboard.json
              echo   "pending": 0, >> cypress/results/dashboard/dashboard.json
              echo   "skipped": 0, >> cypress/results/dashboard/dashboard.json
              echo   "passPercentage": 0, >> cypress/results/dashboard/dashboard.json
              echo   "duration": 0, >> cypress/results/dashboard/dashboard.json
              echo   "suites": 0, >> cypress/results/dashboard/dashboard.json
              echo   "buildStatus": "no-tests", >> cypress/results/dashboard/dashboard.json
              echo   "error": "No test results found - tests may have failed to run" >> cypress/results/dashboard/dashboard.json
              echo } >> cypress/results/dashboard/dashboard.json
            '''
            
            // Create a basic index.html for cases where no tests ran
            bat '''
              (
              echo ^<!DOCTYPE html^>
              echo ^<html^>
              echo ^<head^>^<title^>No Test Results^</title^>^</head^>
              echo ^<body^>
              echo ^<h1^>No Test Results Available^</h1^>
              echo ^<p^>Tests failed to run or no results were generated.^</p^>
              echo ^<p^>Check the console output for more details.^</p^>
              echo ^</body^>
              echo ^</html^>
              ) > cypress/results/dashboard/index.html
            '''
          }
          
          // Create the enhanced dashboard HTML file (always create this)
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
            echo         .percentage.failed { color: #dc3545; }
            echo         .progress-bar { width: 100%%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; }
            echo         .progress-fill { height: 100%%; background: #28a745; transition: width 0.3s ease; }
            echo         .progress-fill.failed { background: #dc3545; }
            echo         .main-report-link { display: inline-block; margin: 20px 0; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
            echo         .main-report-link:hover { background: #0056b3; }
            echo         .error-message { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin: 20px 0; }
            echo         .build-status { padding: 10px; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            echo         .build-status.success { background: #d4edda; color: #155724; }
            echo         .build-status.failed { background: #f8d7da; color: #721c24; }
            echo         .build-status.no-tests { background: #fff3cd; color: #856404; }
            echo     ^</style^>
            echo ^</head^>
            echo ^<body^>
            echo     ^<h1^>Cypress Test Dashboard - Build #%BUILD_NUMBER%^</h1^>
            echo     ^<div id="buildStatus" class="build-status"^>Loading...^</div^>
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
            echo     ^<div id="errorMessage" class="error-message" style="display: none;"^>^</div^>
            echo     ^<a href="index.html" class="main-report-link" id="detailsLink"^>View Detailed Report^</a^>
            echo     ^<script^>
            echo         fetch('dashboard.json'^).then(r =^> r.json(^)^).then(stats =^> {
            echo             document.getElementById('totalTests'^).textContent = stats.total;
            echo             document.getElementById('passedTests'^).textContent = stats.passed;
            echo             document.getElementById('failedTests'^).textContent = stats.failed;
            echo             document.getElementById('successRate'^).textContent = stats.passPercentage + '%%';
            echo             document.getElementById('duration'^).textContent = (stats.duration / 1000^).toFixed(1^) + 's';
            echo             document.getElementById('suites'^).textContent = stats.suites;
            echo             
            echo             const statusDiv = document.getElementById('buildStatus'^);
            echo             const progressFill = document.getElementById('progressFill'^);
            echo             const successRate = document.getElementById('successRate'^);
            echo             
            echo             if (stats.buildStatus === 'success'^) {
            echo                 statusDiv.textContent = 'Build Status: SUCCESS';
            echo                 statusDiv.className = 'build-status success';
            echo             } else if (stats.buildStatus === 'failed'^) {
            echo                 statusDiv.textContent = 'Build Status: FAILED';
            echo                 statusDiv.className = 'build-status failed';
            echo                 successRate.className = 'percentage failed';
            echo                 progressFill.className = 'progress-fill failed';
            echo             } else if (stats.buildStatus === 'no-tests'^) {
            echo                 statusDiv.textContent = 'Build Status: NO TESTS RUN';
            echo                 statusDiv.className = 'build-status no-tests';
            echo                 document.getElementById('errorMessage'^).style.display = 'block';
            echo                 document.getElementById('errorMessage'^).textContent = stats.error || 'No test results found';
            echo                 document.getElementById('detailsLink'^).style.display = 'none';
            echo             }
            echo             
            echo             setTimeout(^(^) =^> {
            echo                 progressFill.style.width = stats.passPercentage + '%%';
            echo             }, 500^);
            echo         }^).catch(e =^> {
            echo             console.error('Error loading dashboard data:', e^);
            echo             document.getElementById('errorMessage'^).style.display = 'block';
            echo             document.getElementById('errorMessage'^).textContent = 'Error loading dashboard data';
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
      archiveArtifacts artifacts: 'cypress/results/dashboard/**', fingerprint: true, allowEmptyArchive: true
      archiveArtifacts artifacts: 'cypress/videos/**/*.mp4', allowEmptyArchive: true
      archiveArtifacts artifacts: 'cypress/screenshots/**/*.png', allowEmptyArchive: true
      
      // Always publish dashboard and reports
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
        allowMissing: true, // Allow missing for cases where tests failed to run
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
      echo 'Pipeline completed successfully! 🎉'
    }
    
    unstable {
      echo 'Tests failed but reports were generated. Check the dashboard for details.'
    }
    
    failure {
      echo 'Pipeline failed! Check the logs and reports for details.'
    }
  }
}