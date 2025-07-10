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
          
          // Generate custom dashboard with statistics
          bat '''
            node -e "
            const fs = require('fs');
            const report = JSON.parse(fs.readFileSync('cypress/results/merged-report.json', 'utf8'));
            
            const stats = {
              total: report.stats.tests,
              passed: report.stats.passes,
              failed: report.stats.failures,
              pending: report.stats.pending,
              skipped: report.stats.skipped,
              passPercentage: ((report.stats.passes / report.stats.tests) * 100).toFixed(2),
              duration: report.stats.duration,
              suites: report.stats.suites
            };
            
            const dashboardHtml = \`
<!DOCTYPE html>
<html>
<head>
    <title>Cypress Test Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stat-number { font-size: 2.5em; font-weight: bold; margin: 10px 0; }
        .stat-label { color: #666; font-size: 0.9em; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .pending { color: #ffc107; }
        .skipped { color: #6c757d; }
        .percentage { font-size: 1.8em; font-weight: bold; color: #28a745; }
        .progress-bar { width: 100%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; }
        .progress-fill { height: 100%; background: #28a745; transition: width 0.3s ease; }
        .main-report-link { display: inline-block; margin: 20px 0; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
        .main-report-link:hover { background: #0056b3; }
    </style>
</head>
<body>
    <h1>Cypress Test Dashboard - Build #${BUILD_NUMBER}</h1>
    
    <div class="dashboard">
        <div class="card">
            <div class="stat-label">Total Tests</div>
            <div class="stat-number">\${stats.total}</div>
        </div>
        
        <div class="card">
            <div class="stat-label">Passed</div>
            <div class="stat-number passed">\${stats.passed}</div>
        </div>
        
        <div class="card">
            <div class="stat-label">Failed</div>
            <div class="stat-number failed">\${stats.failed}</div>
        </div>
        
        <div class="card">
            <div class="stat-label">Success Rate</div>
            <div class="percentage">\${stats.passPercentage}%</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: \${stats.passPercentage}%"></div>
            </div>
        </div>
        
        <div class="card">
            <div class="stat-label">Duration</div>
            <div class="stat-number">\${(stats.duration / 1000).toFixed(1)}s</div>
        </div>
        
        <div class="card">
            <div class="stat-label">Test Suites</div>
            <div class="stat-number">\${stats.suites}</div>
        </div>
    </div>
    
    <a href="index.html" class="main-report-link">View Detailed Report</a>
    
    <script>
        // Add some interactivity
        document.addEventListener('DOMContentLoaded', function() {
            const progressFill = document.querySelector('.progress-fill');
            setTimeout(() => {
                progressFill.style.width = '\${stats.passPercentage}%';
            }, 500);
        });
    </script>
</body>
</html>
            \`;
            
            fs.writeFileSync('cypress/results/dashboard/dashboard.html', dashboardHtml);
            console.log('Dashboard generated successfully');
            "
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