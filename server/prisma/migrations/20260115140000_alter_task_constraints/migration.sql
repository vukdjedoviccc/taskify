BEGIN TRY

BEGIN TRAN;

-- AlterColumn: Task.title 255 -> 512
ALTER TABLE [dbo].[Task] ALTER COLUMN [title] NVARCHAR(512) NOT NULL;

-- AddCheckConstraint: Task.priority mora biti LOW, MEDIUM, HIGH ili URGENT
ALTER TABLE [dbo].[Task] ADD CONSTRAINT [Task_priority_check] CHECK ([priority] IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT'));

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
