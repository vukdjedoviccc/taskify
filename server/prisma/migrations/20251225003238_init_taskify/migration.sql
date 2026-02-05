BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(191) NOT NULL,
    [email] NVARCHAR(191) NOT NULL,
    [password] NVARCHAR(255) NOT NULL,
    [avatarUrl] NVARCHAR(500),
    [role] NVARCHAR(16) NOT NULL CONSTRAINT [User_role_df] DEFAULT 'USER',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Project] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(191) NOT NULL,
    [description] NVARCHAR(max),
    [color] NVARCHAR(7) NOT NULL CONSTRAINT [Project_color_df] DEFAULT '#6366f1',
    [isArchived] BIT NOT NULL CONSTRAINT [Project_isArchived_df] DEFAULT 0,
    [ownerId] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Project_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Project_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ProjectMember] (
    [id] INT NOT NULL IDENTITY(1,1),
    [projectId] INT NOT NULL,
    [userId] INT NOT NULL,
    [role] NVARCHAR(16) NOT NULL CONSTRAINT [ProjectMember_role_df] DEFAULT 'MEMBER',
    [joinedAt] DATETIME2 NOT NULL CONSTRAINT [ProjectMember_joinedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [ProjectMember_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [ProjectMember_projectId_userId_key] UNIQUE NONCLUSTERED ([projectId],[userId])
);

-- CreateTable
CREATE TABLE [dbo].[Board] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(191) NOT NULL,
    [projectId] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Board_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Board_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Column] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(64) NOT NULL,
    [boardId] INT NOT NULL,
    [position] INT NOT NULL CONSTRAINT [Column_position_df] DEFAULT 0,
    [color] NVARCHAR(7) NOT NULL CONSTRAINT [Column_color_df] DEFAULT '#6b7280',
    [wipLimit] INT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Column_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Column_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Task] (
    [id] INT NOT NULL IDENTITY(1,1),
    [title] NVARCHAR(255) NOT NULL,
    [description] NVARCHAR(max),
    [columnId] INT NOT NULL,
    [position] INT NOT NULL CONSTRAINT [Task_position_df] DEFAULT 0,
    [priority] NVARCHAR(16) NOT NULL CONSTRAINT [Task_priority_df] DEFAULT 'MEDIUM',
    [dueDate] DATETIME2,
    [completedAt] DATETIME2,
    [createdById] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Task_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Task_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Project_ownerId_idx] ON [dbo].[Project]([ownerId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ProjectMember_projectId_idx] ON [dbo].[ProjectMember]([projectId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [ProjectMember_userId_idx] ON [dbo].[ProjectMember]([userId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Board_projectId_idx] ON [dbo].[Board]([projectId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Column_boardId_idx] ON [dbo].[Column]([boardId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Column_boardId_position_idx] ON [dbo].[Column]([boardId], [position]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Task_columnId_idx] ON [dbo].[Task]([columnId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Task_columnId_position_idx] ON [dbo].[Task]([columnId], [position]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Task_createdById_idx] ON [dbo].[Task]([createdById]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Task_dueDate_idx] ON [dbo].[Task]([dueDate]);

-- AddForeignKey
ALTER TABLE [dbo].[Project] ADD CONSTRAINT [Project_ownerId_fkey] FOREIGN KEY ([ownerId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ProjectMember] ADD CONSTRAINT [ProjectMember_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[Project]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ProjectMember] ADD CONSTRAINT [ProjectMember_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Board] ADD CONSTRAINT [Board_projectId_fkey] FOREIGN KEY ([projectId]) REFERENCES [dbo].[Project]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Column] ADD CONSTRAINT [Column_boardId_fkey] FOREIGN KEY ([boardId]) REFERENCES [dbo].[Board]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Task] ADD CONSTRAINT [Task_createdById_fkey] FOREIGN KEY ([createdById]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Task] ADD CONSTRAINT [Task_columnId_fkey] FOREIGN KEY ([columnId]) REFERENCES [dbo].[Column]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
