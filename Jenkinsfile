pipeline {
  agent any

  tools {
    nodejs 'node16'
  }

  environment {
    CYPRESS_CACHE_FOLDER = "${WORKSPACE}/.cypress-cache"
    NODE_ENV = 'ci'
    CYPRESS_TESTS_FAILED = 'false'
  }

  stages {
    stage('Clean Workspace') {
      steps {
        bat 'if exist "allure-results" rmdir /s /q "allure-results"'
        bat 'if exist "allure-report" rmdir /s /q "allure-report"'
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
          def result = bat(
            script: 'npx cypress run',
            returnStatus: true
          )
          
          if (result != 0) {
            env.CYPRESS_TESTS_FAILED = 'true'
            echo "Cypress tests failed, but continuing with report generation..."
          }
        }
      }
      post {
        always {
          // Archive screenshots and videos on failure
          archiveArtifacts artifacts: 'cypress/screenshots/**/*.png', allowEmptyArchive: true
          archiveArtifacts artifacts: 'cypress/videos/**/*.mp4', allowEmptyArchive: true
        }
      }
    }

    stage('Generate Allure Report') {
      steps {
        script {
          // Check if allure-results directory exists and has files
          def allureResults = bat(
            script: 'if exist "allure-results\\*.json" (echo "found") else (echo "not found")',
            returnStdout: true
          ).trim()
          
          if (allureResults.contains('found')) {
            // Generate Allure report
            bat 'npx allure generate allure-results --clean -o allure-report'
            
            // Add custom properties to Allure report
            bat '''
              echo environment=CI/CD Pipeline > allure-report/environment.properties
              echo build.number=%BUILD_NUMBER% >> allure-report/environment.properties
              echo jenkins.url=%JENKINS_URL% >> allure-report/environment.properties
              echo build.url=%BUILD_URL% >> allure-report/environment.properties
              echo test.framework=Cypress >> allure-report/environment.properties
              echo browser=Electron >> allure-report/environment.properties
            '''
            
            // Create a summary JSON for additional dashboard
            bat '''
              echo const fs = require('fs'); > generate-summary.js
              echo const path = require('path'); >> generate-summary.js
              echo try { >> generate-summary.js
              echo   const summaryPath = path.join('allure-report', 'widgets', 'summary.json'); >> generate-summary.js
              echo   if (fs.existsSync(summaryPath)) { >> generate-summary.js
              echo     const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8')); >> generate-summary.js
              echo     const buildInfo = { >> generate-summary.js
              echo       buildNumber: '%BUILD_NUMBER%', >> generate-summary.js
              echo       buildUrl: '%BUILD_URL%', >> generate-summary.js
              echo       timestamp: new Date().toISOString(), >> generate-summary.js
              echo       testResults: summary >> generate-summary.js
              echo     }; >> generate-summary.js
              echo     fs.writeFileSync('allure-report/build-info.json', JSON.stringify(buildInfo, null, 2)); >> generate-summary.js
              echo     console.log('Build info generated successfully'); >> generate-summary.js
              echo   } else { >> generate-summary.js
              echo     console.log('Summary file not found'); >> generate-summary.js
              echo   } >> generate-summary.js
              echo } catch (error) { >> generate-summary.js
              echo   console.error('Error generating build info:', error.message); >> generate-summary.js
              echo } >> generate-summary.js
            '''
            
            bat 'node generate-summary.js'
            
            echo "Allure report generated successfully"
          } else {
            echo "No Allure results found, creating empty report"
            
            // Create minimal allure report structure
            bat 'if not exist "allure-report" mkdir "allure-report"'
            bat '''
              echo ^<!DOCTYPE html^> > allure-report/index.html
              echo ^<html^>^<head^>^<title^>No Test Results^</title^>^</head^> >> allure-report/index.html
              echo ^<body^>^<h1^>No test results available for Build #%BUILD_NUMBER%^</h1^> >> allure-report/index.html
              echo ^<p^>The tests may have failed to run or no test results were generated.^</p^> >> allure-report/index.html
              echo ^</body^>^</html^> >> allure-report/index.html
            '''
          }
        }
      }
    }

    stage('Create Custom Dashboard') {
      steps {
        script {
          // Create a custom dashboard that links to Allure report
          bat '''
            (
            echo ^<!DOCTYPE html^>
            echo ^<html^>
            echo ^<head^>
            echo     ^<title^>Cypress Test Dashboard - Build #%BUILD_NUMBER%^</title^>
            echo     ^<meta charset="UTF-8"^>
            echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^>
            echo     ^<style^>
            echo         * { margin: 0; padding: 0; box-sizing: border-box; }
            echo         body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%^); min-height: 100vh; }
            echo         .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
            echo         .header { text-align: center; color: white; margin-bottom: 2rem; }
            echo         .header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.3^); }
            echo         .header p { font-size: 1.2rem; opacity: 0.9; }
            echo         .dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr^)^); gap: 2rem; margin-bottom: 2rem; }
            echo         .card { background: rgba(255, 255, 255, 0.95^); padding: 2rem; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2^); backdrop-filter: blur(10px^); transition: transform 0.3s ease; }
            echo         .card:hover { transform: translateY(-5px^); }
            echo         .card-header { display: flex; align-items: center; margin-bottom: 1rem; }
            echo         .card-icon { width: 50px; height: 50px; margin-right: 1rem; border-radius: 50%%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: white; }
            echo         .card-title { font-size: 1.2rem; font-weight: bold; color: #333; }
            echo         .stat-number { font-size: 3rem; font-weight: bold; margin: 1rem 0; }
            echo         .stat-label { color: #666; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }
            echo         .passed { color: #27ae60; }
            echo         .failed { color: #e74c3c; }
            echo         .pending { color: #f39c12; }
            echo         .skipped { color: #95a5a6; }
            echo         .success-icon { background: #27ae60; }
            echo         .failed-icon { background: #e74c3c; }
            echo         .pending-icon { background: #f39c12; }
            echo         .info-icon { background: #3498db; }
            echo         .percentage { font-size: 2.5rem; font-weight: bold; }
            echo         .progress-container { margin-top: 1rem; }
            echo         .progress-bar { width: 100%%; height: 25px; background: #ecf0f1; border-radius: 12px; overflow: hidden; position: relative; }
            echo         .progress-fill { height: 100%%; background: linear-gradient(90deg, #27ae60, #2ecc71^); transition: width 1s ease; border-radius: 12px; }
            echo         .progress-fill.failed { background: linear-gradient(90deg, #e74c3c, #c0392b^); }
            echo         .progress-text { position: absolute; top: 50%%; left: 50%%; transform: translate(-50%%, -50%%^); color: white; font-weight: bold; font-size: 0.9rem; }
            echo         .actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 2rem; }
            echo         .btn { padding: 1rem 2rem; border: none; border-radius: 50px; font-size: 1rem; font-weight: bold; cursor: pointer; transition: all 0.3s ease; text-decoration: none; display: inline-flex; align-items: center; color: white; }
            echo         .btn-primary { background: linear-gradient(45deg, #667eea, #764ba2^); }
            echo         .btn-primary:hover { transform: translateY(-2px^); box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4^); }
            echo         .btn-secondary { background: linear-gradient(45deg, #f093fb, #f5576c^); }
            echo         .btn-secondary:hover { transform: translateY(-2px^); box-shadow: 0 5px 15px rgba(240, 147, 251, 0.4^); }
            echo         .build-status { padding: 1rem; margin-bottom: 2rem; border-radius: 10px; text-align: center; font-weight: bold; font-size: 1.1rem; }
            echo         .build-status.success { background: rgba(46, 204, 113, 0.1^); color: #27ae60; border: 2px solid #27ae60; }
            echo         .build-status.failure { background: rgba(231, 76, 60, 0.1^); color: #e74c3c; border: 2px solid #e74c3c; }
            echo         .footer { text-align: center; color: rgba(255, 255, 255, 0.8^); margin-top: 2rem; font-size: 0.9rem; }
            echo         @media (max-width: 768px^) { .dashboard { grid-template-columns: 1fr; } .actions { flex-direction: column; } }
            echo     ^</style^>
            echo ^</head^>
            echo ^<body^>
            echo     ^<div class="container"^>
            echo         ^<div class="header"^>
            echo             ^<h1^>🚀 Cypress Test Dashboard^</h1^>
            echo             ^<p^>Build #%BUILD_NUMBER% - $(Get-Date -Format "yyyy-MM-dd HH:mm:ss"^)^</p^>
            echo         ^</div^>
            echo         ^<div class="build-status" id="buildStatus"^>
            echo             ^<div id="statusIcon"^>⏳^</div^>
            echo             ^<div id="statusText"^>Loading test results...^</div^>
            echo         ^</div^>
            echo         ^<div class="dashboard"^>
            echo             ^<div class="card"^>
            echo                 ^<div class="card-header"^>
            echo                     ^<div class="card-icon info-icon"^>📊^</div^>
            echo                     ^<div class="card-title"^>Total Tests^</div^>
            echo                 ^</div^>
            echo                 ^<div class="stat-number" id="totalTests"^>Loading...^</div^>
            echo                 ^<div class="stat-label"^>Test Cases Executed^</div^>
            echo             ^</div^>
            echo             ^<div class="card"^>
            echo                 ^<div class="card-header"^>
            echo                     ^<div class="card-icon success-icon"^>✅^</div^>
            echo                     ^<div class="card-title"^>Passed^</div^>
            echo                 ^</div^>
            echo                 ^<div class="stat-number passed" id="passedTests"^>Loading...^</div^>
            echo                 ^<div class="stat-label"^>Successful Tests^</div^>
            echo             ^</div^>
            echo             ^<div class="card"^>
            echo                 ^<div class="card-header"^>
            echo                     ^<div class="card-icon failed-icon"^>❌^</div^>
            echo                     ^<div class="card-title"^>Failed^</div^>
            echo                 ^</div^>
            echo                 ^<div class="stat-number failed" id="failedTests"^>Loading...^</div^>
            echo                 ^<div class="stat-label"^>Failed Tests^</div^>
            echo             ^</div^>
            echo             ^<div class="card"^>
            echo                 ^<div class="card-header"^>
            echo                     ^<div class="card-icon success-icon"^>📈^</div^>
            echo                     ^<div class="card-title"^>Success Rate^</div^>
            echo                 ^</div^>
            echo                 ^<div class="percentage" id="successRate"^>Loading...^</div^>
            echo                 ^<div class="progress-container"^>
            echo                     ^<div class="progress-bar"^>
            echo                         ^<div class="progress-fill" id="progressFill"^>^</div^>
            echo                         ^<div class="progress-text" id="progressText"^>0%%^</div^>
            echo                     ^</div^>
            echo                 ^</div^>
            echo             ^</div^>
            echo         ^</div^>
            echo         ^<div class="actions"^>
            echo             ^<a href="allure-report/index.html" class="btn btn-primary"^>
            echo                 📊 View Detailed Allure Report
            echo             ^</a^>
            echo             ^<a href="#" class="btn btn-secondary" onclick="location.reload(^)"^>
            echo                 🔄 Refresh Results
            echo             ^</a^>
            echo         ^</div^>
            echo         ^<div class="footer"^>
            echo             ^<p^>Generated with ❤️ using Cypress ^+ Allure ^+ Jenkins^</p^>
            echo         ^</div^>
            echo     ^</div^>
            echo     ^<script^>
            echo         function loadTestResults(^) {
            echo             fetch('allure-report/build-info.json'^)
            echo                 .then(response =^> response.json(^)^)
            echo                 .then(data =^> {
            echo                     const results = data.testResults;
            echo                     const total = results.statistic.total;
            echo                     const passed = results.statistic.passed;
            echo                     const failed = results.statistic.failed;
            echo                     const broken = results.statistic.broken || 0;
            echo                     const skipped = results.statistic.skipped || 0;
            echo                     const actualFailed = failed + broken;
            echo                     const passRate = total ^> 0 ? ((passed / total^) * 100^).toFixed(1^) : 0;
            echo                     document.getElementById('totalTests'^).textContent = total;
            echo                     document.getElementById('passedTests'^).textContent = passed;
            echo                     document.getElementById('failedTests'^).textContent = actualFailed;
            echo                     document.getElementById('successRate'^).textContent = passRate + '%%';
            echo                     const progressFill = document.getElementById('progressFill'^);
            echo                     const progressText = document.getElementById('progressText'^);
            echo                     const buildStatus = document.getElementById('buildStatus'^);
            echo                     const statusIcon = document.getElementById('statusIcon'^);
            echo                     const statusText = document.getElementById('statusText'^);
            echo                     if (actualFailed ^> 0^) {
            echo                         progressFill.className = 'progress-fill failed';
            echo                         buildStatus.className = 'build-status failure';
            echo                         statusIcon.textContent = '❌';
            echo                         statusText.textContent = `Build Failed - ${actualFailed} test(s^) failed`;
            echo                     } else {
            echo                         buildStatus.className = 'build-status success';
            echo                         statusIcon.textContent = '✅';
            echo                         statusText.textContent = 'Build Successful - All tests passed!';
            echo                     }
            echo                     progressText.textContent = passRate + '%%';
            echo                     setTimeout(^(^) =^> {
            echo                         progressFill.style.width = passRate + '%%';
            echo                     }, 500^);
            echo                 }^)
            echo                 .catch(error =^> {
            echo                     console.error('Error loading test results:', error^);
            echo                     document.getElementById('buildStatus'^).innerHTML = '⚠️ Error loading test results';
            echo                     document.getElementById('totalTests'^).textContent = 'N/A';
            echo                     document.getElementById('passedTests'^).textContent = 'N/A';
            echo                     document.getElementById('failedTests'^).textContent = 'N/A';
            echo                     document.getElementById('successRate'^).textContent = 'N/A';
            echo                 }^);
            echo         }
            echo         loadTestResults(^);
            echo     ^</script^>
            echo ^</body^>
            echo ^</html^>
            ) > allure-report/dashboard.html
          '''
        }
      }
    }
  }

  post {
    always {
      // Archive Allure results and reports
      archiveArtifacts artifacts: 'allure-results/**', fingerprint: true, allowEmptyArchive: true
      archiveArtifacts artifacts: 'allure-report/**', fingerprint: true, allowEmptyArchive: true
      archiveArtifacts artifacts: 'cypress/videos/**/*.mp4', allowEmptyArchive: true
      archiveArtifacts artifacts: 'cypress/screenshots/**/*.png', allowEmptyArchive: true
      
      // Publish Allure report using Jenkins Allure plugin (if installed)
      script {
        try {
          allure([
            includeProperties: false,
            jdk: '',
            properties: [],
            reportBuildPolicy: 'ALWAYS',
            results: [[path: 'allure-results']]
          ])
        } catch (Exception e) {
          echo "Allure Jenkins plugin not available, using HTML publisher instead"
        }
      }
      
      // Publish HTML reports
      publishHTML([
        allowMissing: true,
        alwaysLinkToLastBuild: true,
        keepAll: true,
        reportDir: 'allure-report',
        reportFiles: 'dashboard.html',
        reportName: 'Cypress Dashboard',
        reportTitles: '',
        escapeUnderscores: false
      ])
      
      publishHTML([
        allowMissing: true,
        alwaysLinkToLastBuild: true,
        keepAll: true,
        reportDir: 'allure-report',
        reportFiles: 'index.html',
        reportName: 'Allure Report',
        reportTitles: '',
        escapeUnderscores: false
      ])
      
      // Set build result based on test results
      script {
        if (env.CYPRESS_TESTS_FAILED == 'true') {
          currentBuild.result = 'FAILURE'
        }
      }
      
      cleanWs()
    }
    
    success {
      echo 'Tests passed! 🎉 Check the Allure report for detailed results.'
    }
    
    failure {
      echo 'Tests failed! 📊 Check the Allure report for detailed analysis.'
    }
  }
}