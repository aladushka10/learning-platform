import { z } from "zod"

export const StudentSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string().optional().default(""),
  lastName: z.string().optional().default(""),
})

export const AdminStudentsResponseSchema = z.object({
  students: z.array(StudentSchema),
})

export const TaskAssignmentSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
    taskId: z.string(),
    assignedBy: z.string(),
    assignedAt: z.number(),
    dueAt: z.number().nullable().optional(),
    note: z.string().nullable().optional(),
    status: z.string().optional(),

    courseId: z.string(),
    courseTitle: z.string().optional(),
    taskTitle: z.string().optional(),
    taskDescription: z.string().optional(),
    taskMeta: z.any().optional(),
  })
  .passthrough()

export const AssignmentsListResponseSchema = z.object({
  assignments: z.array(TaskAssignmentSchema),
})

export const UpsertAssignmentResponseSchema = z
  .object({
    ok: z.boolean().optional(),
    assignments: z.array(TaskAssignmentSchema).optional(),
  })
  .passthrough()

