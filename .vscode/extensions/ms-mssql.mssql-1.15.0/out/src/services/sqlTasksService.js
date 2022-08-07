"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqlTasksService = exports.TaskStatus = void 0;
const vscode = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const protocol_1 = require("../protocol");
const utils = require("../models/utils");
const localizedConstants = require("../constants/localizedConstants");
var TaskStatus;
(function (TaskStatus) {
    TaskStatus[TaskStatus["NotStarted"] = 0] = "NotStarted";
    TaskStatus[TaskStatus["InProgress"] = 1] = "InProgress";
    TaskStatus[TaskStatus["Succeeded"] = 2] = "Succeeded";
    TaskStatus[TaskStatus["SucceededWithWarning"] = 3] = "SucceededWithWarning";
    TaskStatus[TaskStatus["Failed"] = 4] = "Failed";
    TaskStatus[TaskStatus["Canceled"] = 5] = "Canceled";
    TaskStatus[TaskStatus["Canceling"] = 6] = "Canceling";
})(TaskStatus = exports.TaskStatus || (exports.TaskStatus = {}));
var TaskStatusChangedNotification;
(function (TaskStatusChangedNotification) {
    TaskStatusChangedNotification.type = new vscode_languageclient_1.NotificationType('tasks/statuschanged');
})(TaskStatusChangedNotification || (TaskStatusChangedNotification = {}));
var TaskCreatedNotification;
(function (TaskCreatedNotification) {
    TaskCreatedNotification.type = new vscode_languageclient_1.NotificationType('tasks/newtaskcreated');
})(TaskCreatedNotification || (TaskCreatedNotification = {}));
var CancelTaskRequest;
(function (CancelTaskRequest) {
    CancelTaskRequest.type = new vscode_languageclient_1.RequestType('tasks/canceltask');
})(CancelTaskRequest || (CancelTaskRequest = {}));
/**
 * A simple service that hooks into the SQL Task Service feature provided by SQL Tools Service. This handles detecting when
 * new tasks are started and displaying a progress notification for those tasks while they're running.
 */
class SqlTasksService {
    constructor(_client, _untitledSqlDocumentService) {
        this._client = _client;
        this._untitledSqlDocumentService = _untitledSqlDocumentService;
        this._activeTasks = new Map();
        this._client.onNotification(TaskCreatedNotification.type, taskInfo => this.handleTaskCreatedNotification(taskInfo));
        this._client.onNotification(TaskStatusChangedNotification.type, taskProgressInfo => this.handleTaskChangedNotification(taskProgressInfo));
    }
    cancelTask(taskId) {
        const params = {
            taskId
        };
        return this._client.sendRequest(CancelTaskRequest.type, params);
    }
    /**
     * Handles a new task being created. This will start up a progress notification toast for the task and set up
     * callbacks to update the status of that task as it runs.
     * @param taskInfo The info for the new task that was created
     */
    handleTaskCreatedNotification(taskInfo) {
        // Default to no-op for the progressCallback since we don't have the progress callback from the notification yet. There's
        // potential here for a race condition in which the first update comes in before this callback is updated - if that starts
        // happening then we'd want to look into keeping track of the latest update message to display as soon as the progress
        // callback is set such that we update the notification correctly.
        const newTaskInfo = {
            taskInfo,
            progressCallback: () => { return; },
            completionPromise: new protocol_1.Deferred()
        };
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: taskInfo.name,
            cancellable: taskInfo.isCancelable
        }, (progress, token) => __awaiter(this, void 0, void 0, function* () {
            newTaskInfo.progressCallback = value => progress.report(value);
            token.onCancellationRequested(() => {
                this.cancelTask(taskInfo.taskId);
            });
            yield newTaskInfo.completionPromise;
        }));
        this._activeTasks.set(taskInfo.taskId, newTaskInfo);
    }
    /**
     * Handles an update to an existing task, updating the current progress notification as needed with any new
     * status/messages. If the task is completed then completes the progress notification and displays a final toast
     * informing the user that the task was completed.
     * @param taskProgressInfo The progress info for the task
     */
    handleTaskChangedNotification(taskProgressInfo) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const taskInfo = this._activeTasks.get(taskProgressInfo.taskId);
            if (!taskInfo) {
                console.warn(`Status update for unknown task ${taskProgressInfo.taskId}`);
                return;
            }
            const taskStatusString = toTaskStatusDisplayString(taskProgressInfo.status);
            if (taskProgressInfo.message && (taskProgressInfo.message.toLowerCase() !== taskStatusString.toLowerCase())) {
                taskInfo.lastMessage = taskProgressInfo.message;
            }
            if (isTaskCompleted(taskProgressInfo.status)) {
                // Task is completed, complete the progress notification and display a final toast informing the
                // user of the final status.
                this._activeTasks.delete(taskProgressInfo.taskId);
                if (taskProgressInfo.status === TaskStatus.Canceled) {
                    taskInfo.completionPromise.reject(new Error('Task cancelled'));
                }
                else {
                    taskInfo.completionPromise.resolve();
                }
                // Get the message to display, if the last status doesn't have a valid message then get the last valid one
                const lastMessage = (_a = (taskProgressInfo.message && taskProgressInfo.message.toLowerCase() !== taskStatusString.toLowerCase())) !== null && _a !== void 0 ? _a : taskInfo.lastMessage;
                // Only include the message if it isn't the same as the task status string we already have - some (but not all) task status
                // notifications include this string as the message
                const taskMessage = lastMessage ?
                    utils.formatString(localizedConstants.taskStatusWithNameAndMessage, taskInfo.taskInfo.name, taskStatusString, lastMessage) :
                    utils.formatString(localizedConstants.taskStatusWithName, taskInfo.taskInfo.name, taskStatusString);
                showCompletionMessage(taskProgressInfo.status, taskMessage);
                if (taskInfo.taskInfo.taskExecutionMode === 1 /* script */ && taskProgressInfo.script) {
                    yield this._untitledSqlDocumentService.newQuery(taskProgressInfo.script);
                }
            }
            else {
                // Task is still ongoing so just update the progress notification with the latest status
                // The progress notification already has the name, so we just need to update the message with the latest status info.
                // Only include the message if it isn't the same as the task status string we already have - some (but not all) task status
                // notifications include this string as the message
                const taskMessage = taskProgressInfo.message && taskProgressInfo.message.toLowerCase() !== taskStatusString.toLowerCase() ?
                    utils.formatString(localizedConstants.taskStatusWithMessage, taskInfo.taskInfo.name, taskStatusString, taskProgressInfo.message) :
                    taskStatusString;
                taskInfo.progressCallback({ message: taskMessage });
            }
        });
    }
}
exports.SqlTasksService = SqlTasksService;
/**
 * Determines whether a particular TaskStatus indicates that the task is completed.
 * @param taskStatus The task status to check
 * @returns true if the task is considered completed, false if not
 */
function isTaskCompleted(taskStatus) {
    return taskStatus === TaskStatus.Canceled ||
        taskStatus === TaskStatus.Failed ||
        taskStatus === TaskStatus.Succeeded ||
        taskStatus === TaskStatus.SucceededWithWarning;
}
/**
 * Shows a message for a task with a different type of toast notification being used for
 * different status types.
 *  Failed - Error notification
 *  Canceled or SucceededWithWarning - Warning notification
 *  All others - Information notification
 * @param taskStatus The status of the task we're showing the message for
 * @param message The message to show
 */
function showCompletionMessage(taskStatus, message) {
    if (taskStatus === TaskStatus.Failed) {
        vscode.window.showErrorMessage(message);
    }
    else if (taskStatus === TaskStatus.Canceled || taskStatus === TaskStatus.SucceededWithWarning) {
        vscode.window.showWarningMessage(message);
    }
    else {
        vscode.window.showInformationMessage(message);
    }
}
/**
 * Gets the string to display for the specified task status
 * @param taskStatus The task status to get the display string for
 * @returns The display string for the task status, or the task status directly as a string if we don't have a mapping
 */
function toTaskStatusDisplayString(taskStatus) {
    switch (taskStatus) {
        case TaskStatus.Canceled:
            return localizedConstants.canceled;
        case TaskStatus.Failed:
            return localizedConstants.failed;
        case TaskStatus.Succeeded:
            return localizedConstants.succeeded;
        case TaskStatus.SucceededWithWarning:
            return localizedConstants.succeededWithWarning;
        case TaskStatus.InProgress:
            return localizedConstants.inProgress;
        case TaskStatus.Canceling:
            return localizedConstants.canceling;
        case TaskStatus.NotStarted:
            return localizedConstants.notStarted;
        default:
            console.warn(`Don't have display string for task status ${taskStatus}`);
            return taskStatus.toString(); // Typescript warns that we can never get here because we've used all the enum values so cast to any
    }
}

//# sourceMappingURL=sqlTasksService.js.map
