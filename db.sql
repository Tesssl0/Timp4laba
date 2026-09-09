CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user'
        CHECK (role IN ('user', 'moderator', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('draft', 'pending', 'published', 'rejected', 'archived')),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'visible'
        CHECK (status IN ('visible', 'hidden')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Жалобы читателей на комментарии (раздел «Модерация» -> «Жалобы на комментарии»)
CREATE TABLE comment_reports (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    reporter_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE moderation_logs (
    id SERIAL PRIMARY KEY,
    article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
    moderator_id INTEGER REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_comments_article ON comments(article_id);
CREATE INDEX idx_comment_reports_comment ON comment_reports(comment_id);

-- Пароли: admin@mediaguard.ru / admin123, moderator@mediaguard.ru / moderator123
INSERT INTO users(username, email, password_hash, role)
VALUES
('admin', 'admin@mediaguard.ru', '$2b$10$7PcGWrZgP3b4w922kW6nO.kzcytvC2gZCoqSW0mib8OTXB2WZ4DnG', 'admin'),
('moderator', 'moderator@mediaguard.ru', '$2b$10$oqkyayLQ0Yp23wnQRkAQW.kL1gIoVFdsITu4bz/T.mOgudzzRAMha', 'moderator');

INSERT INTO articles(title, content, category, status, user_id)
VALUES
('Защита медиаресурсов', 'Тестовая статья', 'Безопасность', 'published', 1);
