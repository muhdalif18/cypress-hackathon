pipeline {
    agent any

    tools {
        nodejs 'node16' // use the exact name defined in your Jenkins
    }

    environment {
        PATH = "${PATH};${WORKSPACE}\\node_modules\\.bin"
        // Add environment variables for Allure reporting
        NODE_ENV = 'staging'
        TEST_ENV = 'Jenkins CI/CD'
        BASE_URL = 'https://my-shop-eight-theta.vercel.app/'
        BROWSER = 'chrome'
        GIT_BRANCH = "${env.GIT_BRANCH}"
        BUILD_NUMBER = "${env.BUILD_NUMBER}"
        BUILD_ID = "${env.BUILD_ID}"
        JENKINS_URL = "${env.JENKINS_URL}"
        JOB_NAME = "${env.JOB_NAME}"
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

        stage('Setup Environment Info') {
            steps {
                script {
                    // Create allure-results directory and environment.properties file
                    bat '''
                        if not exist allure-results (
                            mkdir allure-results
                        )
                        echo Browser=Chrome > allure-results\\environment.properties
                        echo OS=Windows >> allure-results\\environment.properties
                        echo Environment=Staging >> allure-results\\environment.properties
                        echo Base.URL=%BASE_URL% >> allure-results\\environment.properties
                        echo CI/CD=Jenkins >> allure-results\\environment.properties
                        echo Build.Number=%BUILD_NUMBER% >> allure-results\\environment.properties
                        echo Job.Name=%JOB_NAME% >> allure-results\\environment.properties
                        echo Test.Framework=Cypress >> allure-results\\environment.properties
                        echo Node.Version=%NODE_VERSION% >> allure-results\\environment.properties
                        echo Git.Branch=%GIT_BRANCH% >> allure-results\\environment.properties
                    '''
                }
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
                            includeProperties: true,  // Changed to true to include environment properties
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