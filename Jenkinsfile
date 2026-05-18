pipeline {
    agent any

    environment {
        HARBOR_AUTH     = credentials('harbor-creds')
        HARBOR_REGISTRY = 'registry.arutien.top'
        HARBOR_PROJECT  = 'devops'
        BACKEND_REPO    = 'mern-todo-app-backend'
        FRONTEND_REPO   = 'mern-todo-app-frontend'
        
        // --- ĐIỀN IP CỦA MÁY EC2 KUBERNETES VÀO ĐÂY ---
        K8S_MASTER_IP   = 'IP_CUA_MAY_EC2_K8S' 
    }

    stages {
        stage('Docker Login') {
            steps {
                echo '=== ĐĂNG NHẬP VÀO HARBOR REGISTRY ==='
                sh "echo \$HARBOR_AUTH_PSW | docker login ${HARBOR_REGISTRY} -u \$HARBOR_AUTH_USR --password-stdin"
            }
        }

        stage('Build & Push Backend') {
            when {
                anyOf {
                    changeset "backend/**"
                    changeset "docker-compose.yml"
                    changeset "Jenkinsfile"
                }
            }
            steps {
                echo '=== PHÁT HIỆN THAY ĐỔI Ở BACKEND. BẮT ĐẦU BUILD & PUSH ==='
                sh "docker pull ${HARBOR_REGISTRY}/${HARBOR_PROJECT}/${BACKEND_REPO}:latest || true"
                sh "docker build --cache-from ${HARBOR_REGISTRY}/${HARBOR_PROJECT}/${BACKEND_REPO}:latest " +
                   "-t ${HARBOR_REGISTRY}/${HARBOR_PROJECT}/${BACKEND_REPO}:${BUILD_NUMBER} " +
                   "-t ${HARBOR_REGISTRY}/${HARBOR_PROJECT}/${BACKEND_REPO}:latest ./backend"
                sh "docker push ${HARBOR_REGISTRY}/${HARBOR_PROJECT}/${BACKEND_REPO}:${BUILD_NUMBER}"
                sh "docker push ${HARBOR_REGISTRY}/${HARBOR_PROJECT}/${BACKEND_REPO}:latest"
            }
        }

        stage('Build & Push Frontend') {
            when {
                anyOf {
                    changeset "frontend/**"
                    changeset "docker-compose.yml"
                    changeset "Jenkinsfile"
                }
            }
            steps {
                echo '=== PHÁT HIỆN THAY ĐỔI Ở FRONTEND. BẮT ĐẦU BUILD & PUSH ==='
                sh "docker pull ${HARBOR_REGISTRY}/${HARBOR_PROJECT}/${FRONTEND_REPO}:latest || true"
                sh "docker build --cache-from ${HARBOR_REGISTRY}/${HARBOR_PROJECT}/${FRONTEND_REPO}:latest " +
                   "-t ${HARBOR_REGISTRY}/${HARBOR_PROJECT}/${FRONTEND_REPO}:${BUILD_NUMBER} " +
                   "-t ${HARBOR_REGISTRY}/${HARBOR_PROJECT}/${FRONTEND_REPO}:latest ./frontend"
                sh "docker push ${HARBOR_REGISTRY}/${HARBOR_PROJECT}/${FRONTEND_REPO}:${BUILD_NUMBER}"
                sh "docker push ${HARBOR_REGISTRY}/${HARBOR_PROJECT}/${FRONTEND_REPO}:latest"
            }
        }

        // ================= STAGE CD: REMOTE DEPLOY SANG EC2 K8S =================
        stage('Deploy to Remote Kubernetes') {
            steps {
                echo '=== BẮT ĐẦU KẾT NỐI SSH SANG EC2 K8S ĐỂ DEPLOY ==='
                
                // Gọi chuỗi chìa khóa SSH đã cấu hình ở Bước 1
                sshagent(['k8s-server-ssh']) {
                    // Dùng lệnh ssh với cờ -o StrictHostKeyChecking=no để tự động bỏ qua xác thực vân tay lần đầu
                    // Lệnh này sẽ đứng từ Jenkins bắn lệnh 'kubectl rollout...' sang máy EC2 K8s chạy ngầm
                    sh """
                        ssh -o StrictHostKeyChecking=no ${SSH_USER}@${K8S_MASTER_IP} "
                            echo 'Đang thực thi rollout restart trên Master Node K8s...' &&
                            kubectl rollout restart deployment todo-backend || echo 'Không có backend để restart' &&
                            kubectl rollout restart deployment todo-frontend || echo 'Không có frontend để restart' &&
                            kubectl rollout status deployment todo-backend --timeout=60s || true &&
                            kubectl rollout status deployment todo-frontend --timeout=60s || true
                        "
                    """
                }
            }
        }
    }

    post {
        always {
            echo '=== DỌN DẸP IMAGE CŨ TRÊN AGENT BUILD ==='
            sh "docker rmi ${HARBOR_REGISTRY}/${HARBOR_PROJECT}/${BACKEND_REPO}:${BUILD_NUMBER} || true"
            sh "docker rmi ${HARBOR_REGISTRY}/${HARBOR_PROJECT}/${FRONTEND_REPO}:${BUILD_NUMBER} || true"
        }
        success {
            echo 'Pipeline Toàn diện CI/CD hoàn thành xuất sắc! EC2 K8s đã cập nhật bản mới.'
        }
        failure {
            echo 'Pipeline gặp lỗi ở một stage nào đó. Hãy check log nhé.'
        }
    }
}