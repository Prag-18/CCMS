USE CCMS;

-- Helper: add column only if it doesn't already exist
DROP PROCEDURE IF EXISTS ccms_add_col;
DELIMITER //
CREATE PROCEDURE ccms_add_col(
  IN tbl VARCHAR(64),
  IN col VARCHAR(64),
  IN col_def TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = tbl
      AND COLUMN_NAME  = col
  ) THEN
    SET @sql = CONCAT('ALTER TABLE `', tbl, '` ADD COLUMN `', col, '` ', col_def);
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END //
DELIMITER ;

-- Add missing Evidence columns
CALL ccms_add_col('Evidence', 'evidence_type', "ENUM('DOCUMENT','IMAGE','VIDEO','AUDIO','OTHER') DEFAULT 'DOCUMENT'");
CALL ccms_add_col('Evidence', 'file_name',     'VARCHAR(255)');
CALL ccms_add_col('Evidence', 'mime_type',     'VARCHAR(100)');
CALL ccms_add_col('Evidence', 'file_size',     'BIGINT');
CALL ccms_add_col('Evidence', 'uploaded_by_officer_id', 'INT');
CALL ccms_add_col('Evidence', 'created_at',   'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

-- Broaden status enum if it's too narrow
ALTER TABLE Evidence MODIFY COLUMN status
  ENUM('PENDING','IN_ANALYSIS','VERIFIED','PROCESSED','UNKNOWN') DEFAULT 'PENDING';

-- Backfill evidence_type from old `type` column where possible
UPDATE Evidence
SET evidence_type = CASE
  WHEN type = 'PHOTO'    THEN 'IMAGE'
  WHEN type = 'VIDEO'    THEN 'VIDEO'
  WHEN type = 'DOCUMENT' THEN 'DOCUMENT'
  ELSE 'OTHER'
END
WHERE evidence_type IS NULL;

-- Backfill created_at from uploaded_at where possible
UPDATE Evidence
SET created_at = uploaded_at
WHERE created_at IS NULL
  AND uploaded_at IS NOT NULL;

-- Cleanup helper procedure
DROP PROCEDURE IF EXISTS ccms_add_col;

SELECT 'Evidence table migration complete.' AS result;
