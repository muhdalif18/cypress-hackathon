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
                bat 'npx cypress run'
            }
        }

        stage('Generate Allure Report') {
            steps {
                bat 'npx allure generate allure-results --clean -o allure-report'
            }
        }

        stage('Publish Allure Report') {
            steps {
                allure([
                    includeProperties: false,
                    jdk: '',
                    reportBuildPolicy: 'ALWAYS',
                    results: [[path: 'allure-results']]
                ])
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'allure-report/**', allowEmptyArchive: true
        }
    }
}