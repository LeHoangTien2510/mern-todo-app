pipeline {
    agent any

    environment {
        // Gọi ID Credentials bạn đã tạo trên Jenkins đưa vào biến môi trường
        // Jenkins sẽ tự sinh ra 2 biến: HARBOR_AUTH_USR và HARBOR_AUTH_PSW
        HARBOR_AUTH = credentials('harbor-creds')
        
        // Định nghĩa các biến dùng chung để dễ quản lý và sửa đổi
        HARBOR_REGISTRY = 'registry.arutien.top'
        HARBOR_PROJECT  = 'devops'
        BACKEND_REPO    = 'mern-todo-app-backend'
        FRONTEND_REPO   = 'mern-todo-app-frontend'
    }

    stages {
        stage('Docker Login') {
            steps {
                echo '=== ĐĂNG NHẬP VÀO HARBOR REGISTRY ==='
                // Sử dụng --password-stdin để truyền mật khẩu an toàn, không bị lộ trong log của Jenkins
                sh "echo \$HARBOR_AUTH_PSW | docker login ${HARBOR_REGISTRY} -u \$HARBOR_AUTH_USR --password-stdin"
            }
        }

        stage('Build & Push Backend') {
            when {
                anyOf {
                    // Chỉ chạy khi có thay đổi trong thư mục backend hoặc file docker-compose gốc
                    changeset "backend/**"
                    changeset "docker-compose.yml"
                    changeset "Jenkinsfile"
                }
            }
            steps {
                echo '=== PHÁT HIỆN THAY ĐỔI Ở BACKEND. BẮT ĐẦU BUILD & PUSH ==='
                // Khai báo kéo layer cache từ bản latest về (nếu có) để tối ưu thời gian build
                sh "docker pull ${HARBOR_REGISTRY}/${HARBOR_PROJECT}/${BACKEND_REPO}:latest || true"
                
                // Tiến hành build image backend sử dụng cache và gắn tag theo số lần build của Jenkins
                sh "docker build --cache-from ${HARBOR_REGISTRY}/${HARBOR_PROJECT}/${BACKEND_REPO}:latest " +
                   "-t ${HARBOR_REGISTRY}/${HARBOR_PROJECT}/${BACKEND_REPO}:${BUILD_NUMBER} " +
                   "-t ${HARBOR_REGISTRY}/${HARBOR_PROJECT}/${BACKEND_REPO}:latest ./backend"
                
                // Đẩy cả image tag theo phiên bản và bản latest lên Harbor
                sh "docker push ${HARBOR_REGISTRY}/${HARBOR_PROJECT}/${BACKEND_REPO}:${BUILD_NUMBER}"
                sh "docker push ${HARBOR_REGISTRY}/${HARBOR_PROJECT}/${BACKEND_REPO}:latest"
            }
        }

        stage('Build & Push Frontend') {
            when {
                anyOf {
                    // Chỉ chạy khi có thay đổi trong thư mục frontend hoặc file docker-compose gốc
                    changeset "frontend/**"
                    changeset "docker-compose.yml"
                    changeset "Jenkinsfile"
                }
            }
            steps {
                echo '=== PHÁT HIỆN THAY ĐỔI Ở FRONTEND. BẮT ĐẦU BUILD & PUSH ==='
                // Khai báo kéo layer cache cho frontend
                sh "docker pull ${HARBOR_REGISTRY}/${HARBOR_PROJECT}/${FRONTEND_REPO}:latest || true"
                
                // Tiến hành build image frontend
                sh "docker build --cache-from ${HARBOR_REGISTRY}/${HARBOR_PROJECT}/${FRONTEND_REPO}:latest " +
                   "-t ${HARBOR_REGISTRY}/${HARBOR_PROJECT}/${FRONTEND_REPO}:${BUILD_NUMBER} " +
                   "-t ${HARBOR_REGISTRY}/${HARBOR_PROJECT}/${FRONTEND_REPO}:latest ./frontend"
                
                // Đẩy image frontend lên Harbor
                sh "docker push ${HARBOR_REGISTRY}/${HARBOR_PROJECT}/${FRONTEND_REPO}:${BUILD_NUMBER}"
                sh "docker push ${HARBOR_REGISTRY}/${HARBOR_PROJECT}/${FRONTEND_REPO}:latest"
            }
        }
    }

    post {
        always {
            echo '=== DỌN DẸP IMAGE CŨ TRÊN AGENT BUILD ==='
            // Xóa các image vừa build dưới local máy Jenkins sau khi đã push lên Harbor thành công 
            // Việc này giúp máy build (hoặc VPS chạy Jenkins) không bao giờ bị đầy ổ cứng (Disk Full)
            sh "docker rmi ${HARBOR_REGISTRY}/${HARBOR_PROJECT}/${BACKEND_REPO}:${BUILD_NUMBER} || true"
            sh "docker rmi ${HARBOR_REGISTRY}/${HARBOR_PROJECT}/${FRONTEND_REPO}:${BUILD_NUMBER} || true"
        }
        success {
            echo 'Pipeline hoàn thành xuất sắc! Toàn bộ Image mới đã được đưa lên Harbor Registry.'
        }
        failure {
            echo 'Pipeline gặp lỗi trong quá trình thực thi. Hãy kiểm tra lại Console Output để fix lỗi nhé.'
        }
    }
}