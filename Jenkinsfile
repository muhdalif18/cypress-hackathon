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
        // Run tests with enhanced reporting
        bat '''
          npx cypress run --reporter mochawesome --reporter-options "reportDir=cypress/results,overwrite=false,html=false,json=true,timestamp=mmddyyyy_HHMMss,charts=true,reportPageTitle=Cypress Test Report,reportTitle=Test Results Dashboard,embeddedScreenshots=true,inlineAssets=true"
        '''
      }
      post {
        failure {
          // Archive screenshots on failure
          archiveArtifacts artifacts: 'cypress/screenshots/**/*.png', allowEmptyArchive: true
        }
      }
    }

    stage('Generate Enhanced Dashboard Report') {
      steps {
        script {
          // Create reports directory structure
          bat '''
            if not exist "cypress\\results\\html" mkdir "cypress\\results\\html"
            if not exist "cypress\\results\\assets" mkdir "cypress\\results\\assets"
          '''
          
          // Step 1: Merge all JSON reports
          bat 'npx mochawesome-merge "cypress/results/mochawesome*.json" > cypress/results/merged-report.json'
          
          // Step 2: Generate comprehensive HTML report with all features
          bat '''
            npx marge cypress/results/merged-report.json ^
              --reportDir cypress/results/html ^
              --reportFilename index.html ^
              --reportTitle "Cypress Test Dashboard - Build #%BUILD_NUMBER%" ^
              --reportPageTitle "Test Results Dashboard" ^
              --inline ^
              --charts ^
              --code ^
              --autoOpen false ^
              --overwrite ^
              --timestamp "mmddyyyy_HHMMss" ^
              --showPassed true ^
              --showFailed true ^
              --showPending true ^
              --showSkipped true ^
              --enableCharts true ^
              --enableCode true
          '''
          
          // Step 3: Generate module-based summary report
          bat '''
            echo Creating module summary report...
            powershell -Command "
              $jsonContent = Get-Content 'cypress/results/merged-report.json' | ConvertFrom-Json;
              $totalTests = $jsonContent.stats.tests;
              $passedTests = $jsonContent.stats.passes;
              $failedTests = $jsonContent.stats.failures;
              $skippedTests = $jsonContent.stats.skipped;
              $pendingTests = $jsonContent.stats.pending;
              $passRate = [math]::Round(($passedTests / $totalTests) * 100, 2);
              
              $summaryHtml = @'
              <!DOCTYPE html>
              <html>
              <head>
                  <title>Test Summary Dashboard</title>
                  <style>
                      body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
                      .container { max-width: 1200px; margin: 0 auto; }
                      .header { background: #2c3e50; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
                      .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px; }
                      .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                      .stat-number { font-size: 2em; font-weight: bold; margin-bottom: 10px; }
                      .stat-label { color: #666; font-size: 0.9em; }
                      .passed { color: #27ae60; }
                      .failed { color: #e74c3c; }
                      .skipped { color: #95a5a6; }
                      .pending { color: #f39c12; }
                      .total { color: #2c3e50; }
                      .progress-bar { width: 100%; height: 20px; background: #ecf0f1; border-radius: 10px; overflow: hidden; }
                      .progress-fill { height: 100%; background: #27ae60; transition: width 0.3s ease; }
                      .build-info { background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
                  </style>
              </head>
              <body>
                  <div class=\"container\">
                      <div class=\"header\">
                          <h1>Cypress Test Dashboard - Build #' + $env:BUILD_NUMBER + '</h1>
                          <p>Generated on ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss') + '</p>
                      </div>
                      
                      <div class=\"build-info\">
                          <h3>Build Information</h3>
                          <p><strong>Build Number:</strong> ' + $env:BUILD_NUMBER + '</p>
                          <p><strong>Build URL:</strong> ' + $env:BUILD_URL + '</p>
                          <p><strong>Overall Pass Rate:</strong> ' + $passRate + '%</p>
                          <div class=\"progress-bar\">
                              <div class=\"progress-fill\" style=\"width: ' + $passRate + '%;\"></div>
                          </div>
                      </div>
                      
                      <div class=\"stats-grid\">
                          <div class=\"stat-card\">
                              <div class=\"stat-number total\">' + $totalTests + '</div>
                              <div class=\"stat-label\">Total Tests</div>
                          </div>
                          <div class=\"stat-card\">
                              <div class=\"stat-number passed\">' + $passedTests + '</div>
                              <div class=\"stat-label\">Passed</div>
                          </div>
                          <div class=\"stat-card\">
                              <div class=\"stat-number failed\">' + $failedTests + '</div>
                              <div class=\"stat-label\">Failed</div>
                          </div>
                          <div class=\"stat-card\">
                              <div class=\"stat-number skipped\">' + $skippedTests + '</div>
                              <div class=\"stat-label\">Skipped</div>
                          </div>
                          <div class=\"stat-card\">
                              <div class=\"stat-number pending\">' + $pendingTests + '</div>
                              <div class=\"stat-label\">Pending</div>
                          </div>
                      </div>
                      
                      <div style=\"text-align: center; margin-top: 30px;\">
                          <a href=\"index.html\" style=\"background: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px;\">
                              View Detailed Report
                          </a>
                      </div>
                  </div>
              </body>
              </html>
'@;
              
              $summaryHtml | Out-File -FilePath 'cypress/results/html/dashboard.html' -Encoding UTF8;
              Write-Host 'Dashboard summary created successfully';
            "
          '''
        }
      }
    }

    stage('Generate Module Reports') {
      steps {
        script {
          // Create individual module reports if you have organized test files
          bat '''
            echo Generating module-specific reports...
            powershell -Command "
              $jsonFiles = Get-ChildItem 'cypress/results' -Filter '*.json' | Where-Object { $_.Name -like 'mochawesome*' };
              foreach ($file in $jsonFiles) {
                $content = Get-Content $file.FullName | ConvertFrom-Json;
                $moduleName = $file.BaseName -replace 'mochawesome_', '';
                Write-Host \"Processing module: $moduleName\";
              }
            "
          '''
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
      
      // Publish the enhanced dashboard
      publishHTML([
        allowMissing: false,
        alwaysLinkToLastBuild: true,
        keepAll: true,
        reportDir: 'cypress/results/html',
        reportFiles: 'dashboard.html',
        reportName: 'Test Dashboard',
        reportTitles: 'Cypress Test Dashboard'
      ])
      
      // Also publish detailed report
      publishHTML([
        allowMissing: false,
        alwaysLinkToLastBuild: true,
        keepAll: true,
        reportDir: 'cypress/results/html',
        reportFiles: 'index.html',
        reportName: 'Detailed Test Report',
        reportTitles: 'Cypress Detailed Results'
      ])
      
      // Generate and archive summary text
      script {
        bat '''
          echo Test Summary Report > cypress/results/summary.txt
          echo Build Number: %BUILD_NUMBER% >> cypress/results/summary.txt
          echo Build Date: %DATE% %TIME% >> cypress/results/summary.txt
          echo ========================== >> cypress/results/summary.txt
          
          powershell -Command "
            if (Test-Path 'cypress/results/merged-report.json') {
              $json = Get-Content 'cypress/results/merged-report.json' | ConvertFrom-Json;
              'Total Tests: ' + $json.stats.tests | Out-File -Append -FilePath 'cypress/results/summary.txt';
              'Passed: ' + $json.stats.passes | Out-File -Append -FilePath 'cypress/results/summary.txt';
              'Failed: ' + $json.stats.failures | Out-File -Append -FilePath 'cypress/results/summary.txt';
              'Skipped: ' + $json.stats.skipped | Out-File -Append -FilePath 'cypress/results/summary.txt';
              'Pass Rate: ' + [math]::Round(($json.stats.passes / $json.stats.tests) * 100, 2) + '%' | Out-File -Append -FilePath 'cypress/results/summary.txt';
            }
          "
        '''
        archiveArtifacts artifacts: 'cypress/results/summary.txt', fingerprint: true
      }
      
      // Clean up workspace
      cleanWs()
    }
    
    success {
      echo 'Tests passed! 🎉 Check the dashboard for detailed results.'
    }
    
    failure {
      echo 'Tests failed! Check the dashboard and detailed reports for analysis.'
    }
  }
}