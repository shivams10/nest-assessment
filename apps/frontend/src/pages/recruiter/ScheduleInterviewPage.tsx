import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RECRUITER_ROUTES } from '@/constants'

export function ScheduleInterviewPage() {
  const { candidateId } = useParams()
  const navigate = useNavigate()
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Minimal behavior: log and navigate back
    console.log('Schedule interview', { candidateId, date, time, notes })
    navigate(RECRUITER_ROUTES.CANDIDATE_DETAILS.replace(':candidateId', candidateId ?? ''))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Schedule Interview</h1>
        <p className="text-sm text-muted-foreground">Set up an interview for the candidate</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Interview Details</CardTitle>
          <CardDescription>Choose a date, time and add notes</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label>Time</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <div>
              <Label>Notes</Label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full resize-y rounded-md border p-2" rows={4} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => navigate(RECRUITER_ROUTES.CANDIDATE_DETAILS.replace(':candidateId', candidateId ?? ''))}>Cancel</Button>
              <Button type="submit">Schedule</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { recruiterCandidates, INTERVIEW_ROOMS } from '@/pages/recruiter/recruiterCandidateData'
import { RECRUITER_ROUTES } from '@/constants'

const getSlotsForDate = (dateString: string) => {
  const date = new Date(dateString)
  const day = date.getDay()
  return day % 2 === 0
    ? ['09:00 AM', '10:30 AM', '01:00 PM', '03:00 PM', '04:30 PM']
    : ['09:30 AM', '11:00 AM', '01:30 PM', '02:30 PM', '04:00 PM']
}

export function ScheduleInterviewPage() {
  const navigate = useNavigate()
  const params = useParams<{ candidateId: string }>()
  const candidate = useMemo(
    () => recruiterCandidates.find((item) => item.id === params.candidateId),
    [params.candidateId],
  )

  const today = new Date().toISOString().slice(0, 10)
  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedRoom, setSelectedRoom] = useState(INTERVIEW_ROOMS[0])
  const availableSlots = useMemo(() => getSlotsForDate(selectedDate), [selectedDate])
  const [selectedSlot, setSelectedSlot] = useState(availableSlots[0])
  const [confirmation, setConfirmation] = useState('')

  if (!candidate) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <Card>
          <CardContent className="text-center">
            <CardTitle>Candidate not found</CardTitle>
            <p className="text-sm text-muted-foreground">Choose a candidate from the recruiter dashboard.</p>
            <div className="mt-4">
              <Button variant="outline" onClick={() => navigate(RECRUITER_ROUTES.RECRUITER)}>
                Back to recruiter dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleScheduleInterview = () => {
    setConfirmation(
      `Interview scheduled for ${candidate.name} on ${new Date(selectedDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })} at ${selectedSlot} in ${selectedRoom}.`,
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" onClick={() => navigate(RECRUITER_ROUTES.RECRUITER)}>
            ← Back to recruiter dashboard
          </Button>
          <h1 className="mt-4 text-3xl font-semibold text-foreground">Schedule Interview</h1>
          <p className="mt-2 text-sm text-muted-foreground">Create a calendar-ready interview for {candidate.name}.</p>
        </div>
        <div className="rounded-3xl bg-card p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Candidate</p>
          <p>{candidate.name}</p>
          <p>{candidate.role}</p>
        </div>
      </div>

      {confirmation ? (
        <Card className="border-border bg-muted p-6">
          <p className="text-sm font-semibold text-foreground">Interview confirmed</p>
          <p className="mt-2 text-sm text-muted-foreground">{confirmation}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button onClick={() => setConfirmation('')}>Schedule another time</Button>
            <Button variant="outline" onClick={() => navigate(RECRUITER_ROUTES.RECRUITER)}>
              Return to dashboard
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Plan interview</CardTitle>
              <CardDescription>Pick a date, room, and available time slot.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="interview-date">Select Date</Label>
                  <Input
                    id="interview-date"
                    type="date"
                    value={selectedDate}
                    onChange={(event) => {
                      setSelectedDate(event.target.value)
                      setSelectedSlot(getSlotsForDate(event.target.value)[0])
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interview-room">Available interview rooms</Label>
                  <select
                    id="interview-room"
                    value={selectedRoom}
                    onChange={(event) => setSelectedRoom(event.target.value)}
                    className="w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {INTERVIEW_ROOMS.map((room) => (
                      <option key={room} value={room}>{room}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Available time slots</Label>
                    <span className="text-sm text-muted-foreground">Select one slot</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`rounded-3xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                          slot === selectedSlot
                            ? 'border-primary bg-primary/10 text-foreground'
                            : 'border-border bg-background text-muted-foreground hover:border-primary/60 hover:text-foreground'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Interview summary</CardTitle>
              <CardDescription>Quick overview before creating the invite.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-3xl bg-background p-5">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Date</span>
                  <span>{new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                  <span>Time slot</span>
                  <span>{selectedSlot}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                  <span>Room</span>
                  <span>{selectedRoom}</span>
                </div>
                <div className="mt-4 rounded-3xl bg-primary/5 p-4 text-sm text-foreground">
                  Estimated duration: 60 minutes
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={() => navigate(RECRUITER_ROUTES.RECRUITER)}>
                  Cancel
                </Button>
                <Button onClick={handleScheduleInterview}>Create Calendar Invite</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
