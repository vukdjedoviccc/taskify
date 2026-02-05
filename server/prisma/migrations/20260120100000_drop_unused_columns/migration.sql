BEGIN TRY

BEGIN TRAN;

-- DropColumn: User.avatarUrl vise nije potreban
ALTER TABLE [dbo].[User] DROP COLUMN [avatarUrl];

-- DropColumn: Column.wipLimit vise nije potreban
ALTER TABLE [dbo].[Column] DROP COLUMN [wipLimit];

-- DropIndex: Task_dueDate_idx vise nije potreban
DROP INDEX [Task_dueDate_idx] ON [dbo].[Task];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
