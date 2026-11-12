pipeline {
    agent any

    stages {
        stage('Checkout do Código 🌐') {
            steps {
                // Puxa o código fonte inteiro da raiz do repositório
                checkout scm
                echo 'Repositório clonado com sucesso!'
            }
        }

        stage('Instalação de Dependências 📦') {
            steps {
                // Entra na pasta do frontend para instalar os pacotes
                dir('frontend') { 
                    sh 'npm install'
                }
                echo 'Dependências instaladas.'
            }
        }

        stage('Build de Produção 🛠️') {
            steps {
                // Entra na pasta do frontend para gerar o build do Vite
                dir('frontend') { 
                    sh 'npm run build'
                }
                echo 'Build gerado com sucesso!'
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline do Aura System executado com sucesso absoluto!'
        }
        failure {
            echo '❌ Falha detetada no pipeline. Verifique os logs.'
        }
    }
}