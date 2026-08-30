-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(10) NOT NULL,
    is_premium BOOLEAN NOT NULL DEFAULT FALSE,
    premium_expire_at DATETIME NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

-- 2. Topic Table
CREATE TABLE IF NOT EXISTS topic (
    topic_id INT AUTO_INCREMENT PRIMARY KEY,
    topic_name VARCHAR(255) NOT NULL UNIQUE
);

-- 3. Problem Table
CREATE TABLE IF NOT EXISTS problem (
    problem_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    external_link VARCHAR(500) NULL,
    difficulty VARCHAR(20) NULL,
    concept TEXT NULL,
    is_premium BOOLEAN NOT NULL DEFAULT FALSE,
    added_by INT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    CONSTRAINT fk_problem_added_by FOREIGN KEY (added_by) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 4. Attachment Table
CREATE TABLE IF NOT EXISTS attachment (
    attachment_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    filetype VARCHAR(100) NULL,
    file_url VARCHAR(500) NOT NULL,
    uploaded_at DATETIME NOT NULL,
    CONSTRAINT fk_attachment_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 5. Comment Table
CREATE TABLE IF NOT EXISTS comment (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    comment TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    parent_comment_id INT NULL,
    CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_parent FOREIGN KEY (parent_comment_id) REFERENCES comment(comment_id) ON DELETE CASCADE
);

-- 6. Blog Table
CREATE TABLE IF NOT EXISTS blog (
    blog_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    CONSTRAINT fk_blog_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 7. Problem Topic Junction Table
CREATE TABLE IF NOT EXISTS problem_topic (
    problem_id INT NOT NULL,
    topic_id INT NOT NULL,
    PRIMARY KEY (problem_id, topic_id),
    CONSTRAINT fk_problem_topic_problem FOREIGN KEY (problem_id) REFERENCES problem(problem_id) ON DELETE CASCADE,
    CONSTRAINT fk_problem_topic_topic FOREIGN KEY (topic_id) REFERENCES topic(topic_id) ON DELETE CASCADE
);

-- 8. User Problem Junction / State Table
CREATE TABLE IF NOT EXISTS user_problem (
    user_id INT NOT NULL,
    problem_id INT NOT NULL,
    note TEXT NULL,
    bookmark BOOLEAN DEFAULT FALSE,
    solved BOOLEAN DEFAULT FALSE,
    solved_at DATETIME NULL,
    updated_at DATETIME NULL,
    PRIMARY KEY (user_id, problem_id),
    CONSTRAINT fk_user_problem_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_user_problem_problem FOREIGN KEY (problem_id) REFERENCES problem(problem_id) ON DELETE CASCADE
);

-- 9. Discussion Table
CREATE TABLE IF NOT EXISTS discussion (
    discussion_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    problem_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    CONSTRAINT fk_discussion_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_discussion_problem FOREIGN KEY (problem_id) REFERENCES problem(problem_id) ON DELETE CASCADE
);

-- 10. Editorials Table
CREATE TABLE IF NOT EXISTS editorials (
    editorial_id INT AUTO_INCREMENT PRIMARY KEY,
    problem_id INT NOT NULL,
    explanation LONGTEXT NOT NULL,
    video_link VARCHAR(500) NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    CONSTRAINT fk_editorials_problem FOREIGN KEY (problem_id) REFERENCES problem(problem_id) ON DELETE CASCADE
);

-- 11. Blog Attachment Junction Table
CREATE TABLE IF NOT EXISTS blog_attachment (
    attachment_id INT NOT NULL PRIMARY KEY,
    blog_id INT NOT NULL,
    CONSTRAINT fk_blog_attachment_attachment FOREIGN KEY (attachment_id) REFERENCES attachment(attachment_id) ON DELETE CASCADE,
    CONSTRAINT fk_blog_attachment_blog FOREIGN KEY (blog_id) REFERENCES blog(blog_id) ON DELETE CASCADE
);

-- 12. Blog Comment Junction Table
CREATE TABLE IF NOT EXISTS blog_comment (
    comment_id INT NOT NULL PRIMARY KEY,
    blog_id INT NOT NULL,
    CONSTRAINT fk_blog_comment_comment FOREIGN KEY (comment_id) REFERENCES comment(comment_id) ON DELETE CASCADE,
    CONSTRAINT fk_blog_comment_blog FOREIGN KEY (blog_id) REFERENCES blog(blog_id) ON DELETE CASCADE
);

-- 13. Blog Reaction Table
CREATE TABLE IF NOT EXISTS blog_reaction (
    user_id INT NOT NULL,
    blog_id INT NOT NULL,
    liked BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (user_id, blog_id),
    CONSTRAINT fk_blog_reaction_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_blog_reaction_blog FOREIGN KEY (blog_id) REFERENCES blog(blog_id) ON DELETE CASCADE
);

-- 14. Comment Attachment Junction Table
CREATE TABLE IF NOT EXISTS comment_attachment (
    attachment_id INT NOT NULL PRIMARY KEY,
    comment_id INT NOT NULL,
    CONSTRAINT fk_comment_attachment_attachment FOREIGN KEY (attachment_id) REFERENCES attachment(attachment_id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_attachment_comment FOREIGN KEY (comment_id) REFERENCES comment(comment_id) ON DELETE CASCADE
);

-- 15. Comment Reaction Table
CREATE TABLE IF NOT EXISTS comment_reaction (
    user_id INT NOT NULL,
    comment_id INT NOT NULL,
    liked BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (user_id, comment_id),
    CONSTRAINT fk_comment_reaction_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_reaction_comment FOREIGN KEY (comment_id) REFERENCES comment(comment_id) ON DELETE CASCADE
);

-- 16. Discussion Attachment Junction Table
CREATE TABLE IF NOT EXISTS discussion_attachment (
    attachment_id INT NOT NULL PRIMARY KEY,
    discussion_id INT NOT NULL,
    CONSTRAINT fk_discussion_attachment_attachment FOREIGN KEY (attachment_id) REFERENCES attachment(attachment_id) ON DELETE CASCADE,
    CONSTRAINT fk_discussion_attachment_discussion FOREIGN KEY (discussion_id) REFERENCES discussion(discussion_id) ON DELETE CASCADE
);

-- 17. Discussion Comment Junction Table
CREATE TABLE IF NOT EXISTS discussion_comment (
    comment_id INT NOT NULL PRIMARY KEY,
    discussion_id INT NOT NULL,
    CONSTRAINT fk_discussion_comment_comment FOREIGN KEY (comment_id) REFERENCES comment(comment_id) ON DELETE CASCADE,
    CONSTRAINT fk_discussion_comment_discussion FOREIGN KEY (discussion_id) REFERENCES discussion(discussion_id) ON DELETE CASCADE
);

-- 18. Discussion Reaction Table
CREATE TABLE IF NOT EXISTS discussion_reaction (
    user_id INT NOT NULL,
    discussion_id INT NOT NULL,
    liked BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (user_id, discussion_id),
    CONSTRAINT fk_discussion_reaction_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_discussion_reaction_discussion FOREIGN KEY (discussion_id) REFERENCES discussion(discussion_id) ON DELETE CASCADE
);

-- 19. Editorial Attachment Junction Table
CREATE TABLE IF NOT EXISTS editorial_attachment (
    attachment_id INT NOT NULL PRIMARY KEY,
    editorial_id INT NOT NULL,
    CONSTRAINT fk_editorial_attachment_attachment FOREIGN KEY (attachment_id) REFERENCES attachment(attachment_id) ON DELETE CASCADE,
    CONSTRAINT fk_editorial_attachment_editorial FOREIGN KEY (editorial_id) REFERENCES editorials(editorial_id) ON DELETE CASCADE
);

-- 20. Editorial Solutions Table
CREATE TABLE IF NOT EXISTS editorial_solutions (
    solution_id INT AUTO_INCREMENT PRIMARY KEY,
    editorial_id INT NOT NULL,
    language VARCHAR(30) NOT NULL,
    code LONGTEXT NOT NULL,
    CONSTRAINT fk_editorial_solutions_editorial FOREIGN KEY (editorial_id) REFERENCES editorials(editorial_id) ON DELETE CASCADE
);
