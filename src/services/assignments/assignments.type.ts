import type { z } from "zod"
import type {
  AdminStudentsResponseSchema,
  AssignmentsListResponseSchema,
  StudentSchema,
  TaskAssignmentSchema,
  UpsertAssignmentResponseSchema,
} from "./assignments.contract"

export type Student = z.infer<typeof StudentSchema>
export type TaskAssignment = z.infer<typeof TaskAssignmentSchema>
export type AdminStudentsResponse = z.infer<typeof AdminStudentsResponseSchema>
export type AssignmentsListResponse = z.infer<typeof AssignmentsListResponseSchema>
export type UpsertAssignmentResponse = z.infer<typeof UpsertAssignmentResponseSchema>

