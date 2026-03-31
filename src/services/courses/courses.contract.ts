import { z } from "zod"

export const CourseSchema = z.object({
  id: z.string(),
  title: z.string().optional().default(""),
  category: z.string().optional().default(""),
})

export const CourseTaskSchema = z.object({
  id: z.string(),
  courseId: z.string().optional(),
  title: z.string().optional().default(""),
  description: z.string().optional().default(""),
  meta: z.any().optional(),
  ord: z.number().optional().default(0),
})

export const CourseLectureSchema = z.object({
  id: z.string(),
  title: z.string().optional().default(""),
  content: z.string().optional(),
})

export const CoursesSchema = z.array(CourseSchema)
export const CourseTasksSchema = z.array(CourseTaskSchema)
export const CourseLecturesSchema = z.array(CourseLectureSchema)

