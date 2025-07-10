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
        bat '''
          npx cypress run --reporter mochawesome --reporter-options "reportDir=cypress/results,overwrite=false,html=false,json=true,timestamp=mmddyyyy_HHMMss,charts=true,reportPageTitle=Cypress Test Report,reportTitle=Test Results Dashboard,embeddedScreenshots=true,inlineAssets=true"
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
            if not exist "cypress\\results\\assets" mkdir "cypress\\results\\assets"
          '''

          bat 'npx mochawesome-merge "cypress/results/mochawesome*.json" > cypress/results/merged-report.json'

          bat '''
            npx marge cypress/results/merged-report.json ^
              --reportDir cypress/results/html ^
              --reportFilename index ^
              --reportTitle "Cypress Test Dashboard - Build #%BUILD_NUMBER%" ^
              --reportPageTitle "Test Results Dashboard" ^
              --inline ^
              --charts ^
              --code ^
              --autoOpen false ^
              --overwrite
          '''

          writeFile file: 'create-dashboard.ps1', text: '''
$jsonContent = Get-Content 'cypress/results/merged-report.json' | ConvertFrom-Json
$totalTests = $jsonContent.stats.tests
$passedTests = $jsonContent.stats.passes
$failedTests = $jsonContent.stats.failures
$skippedTests = $jsonContent.stats.skipped
$pendingTests = $jsonContent.stats.pending
$passRate = [math]::Round(($passedTests / $totalTests) * 100, 2)

$summaryHtml = @"
<!DOCTYPE html>
<html>
<head>
  <title>Test Summary Dashboard</title>
  <style>
    body { font-family: Arial; margin: 20px; background-color: #f5f5f5; }
    .stat-number { font-size: 2em; font-weight: bold; }
    .passed { color: green; } .failed { color: red; } .skipped { color: gray; }
  </style>
</head>
<body>
  <h1>Cypress Test Dashboard - Build #$env:BUILD_NUMBER</h1>
  <p>Generated on $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')</p>
  <p><strong>Pass Rate:</strong> $passRate%</p>
  <ul>
    <li class="total">Total: $totalTests</li>
    <li class="passed">Passed: $passedTests</li>
    <li class="failed">Failed: $failedTests</li>
    <li class="skipped">Skipped: $skippedTests</li>
    <li class="pending">Pending: $pendingTests</li>
  </ul>
</body>
</html>
"@

$summaryHtml | Out-File -FilePath 'cypress/results/html/dashboard.html' -Encoding UTF8
Write-Host 'Dashboard summary created successfully'
'''
          bat 'powershell -ExecutionPolicy Bypass -File create-dashboard.ps1'
        }
      }
    }

    stage('Generate Module Reports') {
      steps {
        script {
          writeFile file: 'generate-modules.ps1', text: '''
$jsonFiles = Get-ChildItem 'cypress/results' -Filter '*.json' | Where-Object { $_.Name -like 'mochawesome*' }

foreach ($file in $jsonFiles) {
  try {
    $content = Get-Content $file.FullName | ConvertFrom-Json
    $moduleName = $file.BaseName -replace 'mochawesome_', ''
    Write-Host "Processing module: $moduleName"
    # You can extract module stats and save them to individual files if needed
  } catch {
    Write-Host "Failed to process $($file.FullName): $_"
  }
}
'''
          bat 'powershell -ExecutionPolicy Bypass -File generate-modules.ps1'
        }
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'cypress/results/**/*', fingerprint: true
      archiveArtifacts artifacts: 'cypress/videos/**/*.mp4', allowEmptyArchive: true
      archiveArtifacts artifacts: 'cypress/screenshots/**/*.png', allowEmptyArchive: true

      publishHTML([
        allowMissing: false,
        alwaysLinkToLastBuild: true,
        keepAll: true,
        reportDir: 'cypress/results/html',
        reportFiles: 'dashboard.html',
        reportName: 'Test Dashboard',
        reportTitles: 'Cypress Test Dashboard'
      ])

      publishHTML([
        allowMissing: false,
        alwaysLinkToLastBuild: true,
        keepAll: true,
        reportDir: 'cypress/results/html',
        reportFiles: 'index.html',
        reportName: 'Detailed Test Report',
        reportTitles: 'Cypress Detailed Results'
      ])

      script {
        bat '''
          echo Test Summary Report > cypress/results/summary.txt
          echo Build Number: %BUILD_NUMBER% >> cypress/results/summary.txt
          echo Build Date: %DATE% %TIME% >> cypress/results/summary.txt
          echo ========================== >> cypress/results/summary.txt
