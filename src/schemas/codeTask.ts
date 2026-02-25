// import { z } from "zod"

// export const difficultySchema = z.enum(["Easy", "Medium", "Hard"])

// export const codeTaskMetaSchema = z
//   .object({
//     type: z.literal("code").optional(),
//     language: z.string().optional(),
//     difficulty: difficultySchema.optional(),
//     topic: z.string().optional(),
//     starterCode: z.string().optional(),
//     tests: z
//       .array(
//         z.object({
//           name: z.string(),
//           expected: z.unknown(),
//         }),
//       )
//       .optional(),
//   })
//   .passthrough()

// export type CodeTaskMeta = z.infer<typeof codeTaskMetaSchema>

// export const codeTaskFormSchema = z.object({
//   code: z.string().trim().min(1, "Введите код"),
// })

// export type CodeTaskFormValues = z.infer<typeof codeTaskFormSchema>
