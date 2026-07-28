import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'

import { BuildingIcon } from '@/components/icons'
import { EmptyState, LoadingSpinner, PageHeader } from '@/components/ui'
import { api } from '@/lib/api'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useRooms } from '@/hooks/useRooms'
import { useCreateRoom } from '@/hooks/useCreateRoom'
import { useUpdateRoom } from '@/hooks/useUpdateRoom'
import { useCalendarStatus } from '@/hooks/useCalendarStatus'

const AddRoomModal = ({ onClose }: { onClose: () => void }) => {
  const [name, setName] = useState('')
  const [resourceEmail, setResourceEmail] = useState('')
  const [location, setLocation] = useState('')
  const [capacity, setCapacity] = useState('4')
  const [error, setError] = useState<string | null>(null)
  const createRoom = useCreateRoom()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    createRoom.mutate(
      { name, resourceEmail, location: location || undefined, capacity: Number(capacity) },
      {
        onSuccess: () => onClose(),
        onError: (err) => {
          const message =
            axios.isAxiosError(err) && typeof err.response?.data?.message === 'string'
              ? err.response.data.message
              : 'Something went wrong. Please try again.'
          setError(message)
        },
      },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-xl bg-surface p-6 shadow-lg"
      >
        <h2 className="text-base font-semibold text-content-primary">Add Room</h2>

        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-content-secondary">Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Conference Room A"
              className="h-9 w-full rounded-md border border-border px-3 text-sm text-content-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-border"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-content-secondary">Resource Email</label>
            <input
              required
              type="email"
              value={resourceEmail}
              onChange={(e) => setResourceEmail(e.target.value)}
              placeholder="room-a@company.com"
              className="h-9 w-full rounded-md border border-border px-3 text-sm text-content-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-border"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-content-secondary">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. 2nd Floor, East Wing"
              className="h-9 w-full rounded-md border border-border px-3 text-sm text-content-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-border"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-content-secondary">Capacity</label>
            <input
              required
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="h-9 w-full rounded-md border border-border px-3 text-sm text-content-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-border"
            />
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-md border border-status-error-border bg-status-error-bg px-3 py-2 text-xs text-status-error-text">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-md border border-border px-4 text-sm font-medium text-content-primary hover:bg-surface-subtle"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createRoom.isPending}
            className="h-9 rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50"
          >
            {createRoom.isPending ? 'Adding…' : 'Add Room'}
          </button>
        </div>
      </form>
    </div>
  )
}

const CalendarConnectionBanner = () => {
  const { data: status } = useCalendarStatus()
  const [searchParams, setSearchParams] = useSearchParams()
  const calendarParam = searchParams.get('calendar')
  const [connecting, setConnecting] = useState(false)

  const handleConnect = async () => {
    searchParams.delete('calendar')
    setSearchParams(searchParams, { replace: true })

    setConnecting(true)
    try {
      const { data } = await api.get<{ url: string }>('/calendar/connect')
      window.location.href = data.url
    } catch {
      setConnecting(false)
    }
  }

  return (
    <div className="mb-6 flex items-center justify-between rounded-lg border border-border bg-surface-subtle px-4 py-3">
      <div>
        <p className="text-sm font-medium text-content-primary">Google Calendar</p>
        <p className="text-xs text-content-secondary">
          {status?.connected
            ? 'Connected — interview events will be created automatically.'
            : 'Not connected yet — sessions will still be created, just without a synced calendar event.'}
        </p>
        {calendarParam === 'connected' && (
          <p className="mt-1 text-xs text-status-success-text">Successfully connected.</p>
        )}
        {calendarParam === 'error' && (
          <p className="mt-1 text-xs text-status-error-text">
            Connection failed — please try again.
          </p>
        )}
      </div>
      <button
        onClick={handleConnect}
        disabled={connecting}
        className="h-9 shrink-0 rounded-md border border-border px-4 text-sm font-medium text-content-primary hover:bg-surface disabled:opacity-50"
      >
        {connecting ? 'Redirecting…' : status?.connected ? 'Reconnect' : 'Connect Google Calendar'}
      </button>
    </div>
  )
}

export const RecruiterRoomsPage = () => {
  const { data: currentUser } = useCurrentUser()
  const { data: rooms, isLoading } = useRooms()
  const updateRoom = useUpdateRoom()
  const [showAddModal, setShowAddModal] = useState(false)

  const isAdmin = currentUser?.role === 'admin'

  return (
    <>
      <PageHeader
        title="Rooms"
        description="Meeting rooms available for scheduling interviews"
        action={
          isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="h-9 rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-hover"
            >
              Add Room
            </button>
          )
        }
      />

      {isAdmin && <CalendarConnectionBanner />}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : !rooms || rooms.length === 0 ? (
        <EmptyState
          icon={<BuildingIcon size={24} />}
          title="No rooms yet"
          description={
            isAdmin
              ? 'Add a room so recruiters can book it when scheduling interviews.'
              : 'No rooms have been added yet.'
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="grid grid-cols-4 border-b border-border bg-surface-subtle px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-content-muted">
            <div>Name</div>
            <div>Location</div>
            <div>Capacity</div>
            {isAdmin && <div className="text-right">Status</div>}
          </div>
          {rooms.map((room) => (
            <div
              key={room.id}
              className="grid grid-cols-4 items-center border-b border-surface-subtle px-4 py-3 text-sm last:border-b-0"
            >
              <div>
                <div className="font-medium text-content-primary">{room.name}</div>
                <div className="text-content-secondary">{room.resourceEmail}</div>
              </div>
              <div className="text-content-secondary">{room.location ?? '—'}</div>
              <div className="text-content-secondary">{room.capacity}</div>
              {isAdmin && (
                <div className="flex justify-end">
                  <button
                    onClick={() => updateRoom.mutate({ id: room.id, isActive: !room.isActive })}
                    disabled={updateRoom.isPending}
                    className={
                      room.isActive
                        ? 'rounded-full bg-status-success-bg px-2.5 py-0.5 text-xs font-medium text-status-success-text'
                        : 'rounded-full bg-status-error-bg px-2.5 py-0.5 text-xs font-medium text-status-error-text'
                    }
                  >
                    {room.isActive ? 'Active' : 'Deactivated'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAddModal && <AddRoomModal onClose={() => setShowAddModal(false)} />}
    </>
  )
}
