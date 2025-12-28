import { useState } from 'react'
import { useUsers } from '@/hooks/queries/useAdmin'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'

export function UsersListPage() {
  const [page, setPage] = useState(1)
  const [roleFilter, setRoleFilter] = useState<'admin' | 'moderator' | undefined>()

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useUsers({ page, limit: 10, role: roleFilter })

  if (isLoading) {
    return <LoadingState message="Loading users..." />
  }

  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load users'}
        onRetry={() => refetch()}
      />
    )
  }

  if (!data || data.data.length === 0) {
    return (
      <EmptyState
        title="No users found"
        description="There are no users matching your criteria."
      />
    )
  }

  const totalPages = Math.ceil(data.total / data.limit)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage system users
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={roleFilter === undefined ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRoleFilter(undefined)}
          >
            All
          </Button>
          <Button
            variant={roleFilter === 'admin' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setRoleFilter('admin')
              setPage(1)
            }}
          >
            Admins
          </Button>
          <Button
            variant={roleFilter === 'moderator' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setRoleFilter('moderator')
              setPage(1)
            }}
          >
            Moderators
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {data.data.map((user) => (
          <Card key={user.id} className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.email}
                  </span>
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium ${
                      user.isActive
                        ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium capitalize">
                    {user.role}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

