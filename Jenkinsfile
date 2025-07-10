pipeline {
    agent any

    tools {
        nodejs 'node16' // use the exact name defined in your Jenkins
    }

    environment {
        PATH = "${PATH};${WORKSPACE}\\node_modules\\.bin"
    }

    stages {
        stage('Install') {
            steps {
                bat 'npm ci'
            }
        }

        stage('Clean Previous Results') {
            steps {
                // Clean allure-results directory before running tests
                bat '''
                    if exist allure-results (
                        rmdir /s /q allure-results
                    )
                    if exist allure-report (
                        rmdir /s /q allure-report
                    )
                '''
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    // Run tests but don't fail the pipeline immediately
                    // This allows subsequent stages to run even if tests fail
                    try {
                        bat 'npx cypress run'
                    } catch (Exception e) {
                        // Mark the build as unstable but continue
                        currentBuild.result = 'UNSTABLE'
                        echo "Tests failed, but continuing to generate reports..."
                        echo "Error: ${e.getMessage()}"
                    }
                }
            }
        }

        stage('Generate Allure Report') {
            steps {
                script {
                    try {
                        bat 'npx allure generate allure-results --clean -o allure-report'
                    } catch (Exception e) {
                        echo "Failed to generate Allure report: ${e.getMessage()}"
                        // Check if allure-results directory exists
                        bat '''
                            if exist allure-results (
                                echo "allure-results directory exists"
                                dir allure-results
                            ) else (
                                echo "allure-results directory does not exist"
                            )
                        '''
                    }
                }
            }
        }

        stage('Publish Allure Report') {
            steps {
                script {
                    try {
                        allure([
                            includeProperties: false,
                            jdk: '',
                            reportBuildPolicy: 'ALWAYS',
                            results: [[path: 'allure-results']]
                        ])
                    } catch (Exception e) {
                        echo "Failed to publish Allure report: ${e.getMessage()}"
                    }
                }
            }
        }
    }

    post {
        always {
            // Always archive artifacts regardless of test results
            script {
                try {
                    archiveArtifacts artifacts: 'allure-report/**', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'allure-results/**', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'cypress/screenshots/**', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'cypress/videos/**', allowEmptyArchive: true
                } catch (Exception e) {
                    echo "Failed to archive some artifacts: ${e.getMessage()}"
                }
            }
        }
        
        failure {
            echo 'Pipeline failed - but reports should still be available'
        }
        
        unstable {
            echo 'Tests failed but reports were generated successfully'
        }
        
        success {
            echo 'All tests passed successfully'
        }
    }
}