import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import type { Question } from '@/types/question.types'

interface QuestionsTableProps {
  questions: Question[]
  onEdit?: (question: Question) => void
  onDelete?: (questionId: string) => void
  isDeleting?: boolean
}

/**
 * QuestionsTable - Table component for displaying questions
 */
export function QuestionsTable({
  questions,
  onEdit,
  onDelete,
  isDeleting = false,
}: QuestionsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Question</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Options</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {questions.map((question) => (
          <TableRow key={question.id}>
            <TableCell className="max-w-md">
              <div className="truncate font-medium">{question.stem}</div>
            </TableCell>
            <TableCell>
              <span className="text-sm text-muted-foreground">
                {question.type === 'single_select' ? 'Single' : 'Multi'}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-sm text-muted-foreground capitalize">
                {question.category}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-sm text-muted-foreground">
                {question.options?.length || 0} options
              </span>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(question)}
                  >
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(question.id)}
                    disabled={isDeleting}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

