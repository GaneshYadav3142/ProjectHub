export interface Task {
    taskID: number;
    taskTitle: string;
    taskDescription: string;
    dueDate: string;
    priority: string;
    status: string;
    projectName: string;
    teamMemberID: number;
    teamMemberName: string;
  }

export interface Team{
        teamID: number;
        teamName:string;
        projectName:string;
        taskID: number,
        taskTitle: string;
        taskDescription: string;
        dueDate: string;
        priority: string;
        status: string;
        teamMemberName:string
}