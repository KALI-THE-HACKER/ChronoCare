-- Drop the existing table
DROP TABLE IF EXISTS BodyParts;

-- Create new BodyParts table without indexes on user_id
CREATE TABLE BodyParts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    body_part_name VARCHAR(255) NOT NULL,
    date DATE,
    doc_type VARCHAR(100),
    details TEXT,
    document_link VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);